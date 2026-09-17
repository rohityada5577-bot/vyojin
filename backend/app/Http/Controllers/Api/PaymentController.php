<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Razorpay\Api\Api;
use App\Services\OrderCancellationService;
use Throwable;

class PaymentController extends Controller
{
    /**
     * Create Razorpay order.
     */
    public function create(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_number' => ['required', 'string'],
        ]);

        $order = Order::with('payment')
            ->where('order_number', $validated['order_number'])
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        if ($order->payment_status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Order has already been paid.',
            ], 422);
        }

        if ($order->order_status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Order has been cancelled.',
            ], 422);
        }

        try {
            $api = new Api(
                config('services.razorpay.key_id'),
                config('services.razorpay.key_secret')
            );

            $amountInPaise = (int) round(
                ((float) $order->total_amount) * 100
            );

            $razorpayOrder = $api->order->create([
                'receipt' => $order->order_number,
                'amount' => $amountInPaise,
                'currency' => 'INR',
                'notes' => [
                    'order_number' => $order->order_number,
                    'coupon_code' => $order->coupon_code ?? '',
                    'discount_amount' => (string) $order->discount_amount,
                ],
            ]);

            $payment = Payment::updateOrCreate(
                [
                    'order_id' => $order->id,
                ],
                [
                    'provider' => 'razorpay',
                    'razorpay_order_id' => $razorpayOrder['id'],
                    'amount' => $order->total_amount,
                    'status' => 'created',
                    'response' => json_encode(
                        $razorpayOrder->toArray()
                    ),
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Razorpay order created.',
                'data' => [
                    'order_number' => $order->order_number,
                    'razorpay_order_id' => $razorpayOrder['id'],
                    'amount' => $amountInPaise,
                    'currency' => 'INR',
                    'key_id' => config('services.razorpay.key_id'),
                    'payment_id' => $payment->id,
                ],
            ], 201);

        } catch (Throwable $e) {

            return response()->json([
                'success' => false,
                'message' => 'Unable to create Razorpay order.',
            ], 500);
        }
    }

    /**
     * Verify successful Razorpay payment.
     */
  public function verify(
    Request $request,
    OrderCancellationService $cancellationService
): JsonResponse {
    $validated = $request->validate([
        'order_number' => ['required', 'string'],
        'razorpay_order_id' => ['required', 'string'],
        'razorpay_payment_id' => ['required', 'string'],
        'razorpay_signature' => ['required', 'string'],
    ]);

    $order = Order::where(
        'order_number',
        $validated['order_number']
    )->first();

    if (!$order) {
        return response()->json([
            'success' => false,
            'message' => 'Order not found.',
        ], 404);
    }

    $payment = Payment::where('order_id', $order->id)
        ->where(
            'razorpay_order_id',
            $validated['razorpay_order_id']
        )
        ->first();

    if (!$payment) {
        return response()->json([
            'success' => false,
            'message' => 'Payment record not found.',
        ], 404);
    }

    try {

        $api = new Api(
            config('services.razorpay.key_id'),
            config('services.razorpay.key_secret')
        );

        /*
        |--------------------------------------------------------------------------
        | Verify Razorpay signature
        |--------------------------------------------------------------------------
        */

        $api->utility->verifyPaymentSignature([
            'razorpay_order_id' => $validated['razorpay_order_id'],
            'razorpay_payment_id' => $validated['razorpay_payment_id'],
            'razorpay_signature' => $validated['razorpay_signature'],
        ]);


        /*
        |--------------------------------------------------------------------------
        | Update order + payment atomically
        |--------------------------------------------------------------------------
        */

        DB::transaction(function () use ($validated) {

            $order = Order::where(
                'order_number',
                $validated['order_number']
            )
                ->lockForUpdate()
                ->firstOrFail();

            $payment = Payment::where(
                'order_id',
                $order->id
            )
                ->where(
                    'razorpay_order_id',
                    $validated['razorpay_order_id']
                )
                ->lockForUpdate()
                ->firstOrFail();


            /*
            |--------------------------------------------------------------------------
            | Already paid
            |--------------------------------------------------------------------------
            */

            if ($order->payment_status === 'paid') {
                return;
            }


            /*
            |--------------------------------------------------------------------------
            | Order was cancelled
            |--------------------------------------------------------------------------
            */

            if ($order->order_status === 'cancelled') {
                throw new \Exception(
                    'Order has already been cancelled.'
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Mark payment as paid
            |--------------------------------------------------------------------------
            */

            $payment->update([
                'razorpay_payment_id' =>
                    $validated['razorpay_payment_id'],

                'status' => 'paid',

                'response' => json_encode(
                    $validated
                ),
            ]);


            /*
            |--------------------------------------------------------------------------
            | Confirm order
            |--------------------------------------------------------------------------
            */

            $order->update([
                'payment_status' => 'paid',
                'order_status' => 'confirmed',
            ]);


            /*
            |--------------------------------------------------------------------------
            | Coupon usage
            |--------------------------------------------------------------------------
            */

            if ($order->coupon_id) {

                $coupon = Coupon::lockForUpdate()
                    ->find($order->coupon_id);

                if ($coupon) {
                    $coupon->increment(
                        'usage_count'
                    );
                }
            }
        });


        /*
        |--------------------------------------------------------------------------
        | Success
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,
            'message' => 'Payment verified successfully.',
            'data' => [
                'order_number' =>
                    $validated['order_number'],

                'payment_status' => 'paid',

                'order_status' => 'confirmed',
            ],
        ]);


    } catch (Throwable $e) {

        /*
        |--------------------------------------------------------------------------
        | Payment verification failed
        |--------------------------------------------------------------------------
        |
        | Cancel unpaid order and restore stock.
        |
        */

        $cancellationService->cancel(
            $validated['order_number'],
            'Payment verification failed: ' .
                $e->getMessage()
        );


        return response()->json([
            'success' => false,
            'message' => 'Payment verification failed.',
        ], 422);
    }
}

    /**
     * Cancel unpaid order and restore stock.
     */
  public function cancel(
    Request $request,
    OrderCancellationService $cancellationService
): JsonResponse {
    $validated = $request->validate([
        'order_number' => ['required', 'string'],
        'reason' => ['nullable', 'string', 'max:255'],
    ]);

    $result = $cancellationService->cancel(
        $validated['order_number'],
        $validated['reason'] ?? 'Payment cancelled.'
    );

    /*
    |--------------------------------------------------------------------------
    | Order not found
    |--------------------------------------------------------------------------
    */

    if ($result['status'] === 'not_found') {
        return response()->json([
            'success' => false,
            'message' => 'Order not found.',
        ], 404);
    }

    /*
    |--------------------------------------------------------------------------
    | Paid order
    |--------------------------------------------------------------------------
    */

    if ($result['status'] === 'paid') {
        return response()->json([
            'success' => false,
            'message' => 'Paid order cannot be cancelled here.',
        ], 422);
    }

    /*
    |--------------------------------------------------------------------------
    | Already cancelled
    |--------------------------------------------------------------------------
    */

    if ($result['status'] === 'already_cancelled') {
        return response()->json([
            'success' => true,
            'message' => 'Order was already cancelled.',
            'data' => $result['order'],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Successfully cancelled
    |--------------------------------------------------------------------------
    */

    return response()->json([
        'success' => true,
        'message' => 'Order cancelled and stock restored.',
        'data' => $result['order'],
    ]);
}
}