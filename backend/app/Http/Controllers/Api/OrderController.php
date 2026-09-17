<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Create new order
     */
    public function store(Request $request): JsonResponse
    {
        /*
        |--------------------------------------------------------------------------
        | Validate request
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'customer.name' => [
                'required',
                'string',
                'max:255',
            ],

            'customer.email' => [
                'required',
                'email',
                'max:255',
            ],

            'customer.phone' => [
                'required',
                'string',
                'max:20',
            ],

            'customer.address' => [
                'required',
                'string',
                'max:500',
            ],

            'customer.city' => [
                'required',
                'string',
                'max:100',
            ],

            'customer.state' => [
                'required',
                'string',
                'max:100',
            ],

            'customer.pincode' => [
                'required',
                'string',
                'max:10',
            ],

            /*
            |--------------------------------------------------------------------------
            | Items
            |--------------------------------------------------------------------------
            */

            'items' => [
                'required',
                'array',
                'min:1',
            ],

            'items.*.product_id' => [
                'required',
                'integer',
                'exists:products,id',
            ],

            'items.*.quantity' => [
                'required',
                'integer',
                'min:1',
            ],

            'items.*.size' => [
                'nullable',
                'string',
                'max:50',
            ],

            'items.*.color' => [
                'nullable',
                'string',
                'max:50',
            ],

            /*
            |--------------------------------------------------------------------------
            | Coupon
            |--------------------------------------------------------------------------
            */

            'coupon_code' => [
                'nullable',
                'string',
                'max:50',
            ],
        ]);

        try {

            /*
            |--------------------------------------------------------------------------
            | Database Transaction
            |--------------------------------------------------------------------------
            */

            $order = DB::transaction(function () use ($validated, $request) {

                /*
                |--------------------------------------------------------------------------
                | 1. Get logged-in customer
                |--------------------------------------------------------------------------
                |
                | The /orders route is protected by auth:sanctum.
                | Therefore $request->user() is the logged-in customer.
                |
                */

                $customer = $request->user();

                if (!$customer) {
                    abort(
                        401,
                        'Unauthenticated.'
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | 2. Update customer information
                |--------------------------------------------------------------------------
                */

                $customer->update([
                    'name' => $validated['customer']['name'],
                    'email' => $validated['customer']['email'],
                    'phone' => $validated['customer']['phone'],
                    'address' => $validated['customer']['address'],
                    'city' => $validated['customer']['city'],
                    'state' => $validated['customer']['state'],
                    'pincode' => $validated['customer']['pincode'],
                ]);

                /*
                |--------------------------------------------------------------------------
                | 3. Calculate subtotal from DATABASE prices
                |--------------------------------------------------------------------------
                */

                $subtotal = 0;

                $orderItems = [];

                /*
                |--------------------------------------------------------------------------
                | Group requested quantities by product
                |--------------------------------------------------------------------------
                |
                | This prevents duplicate product IDs from bypassing
                | the stock check.
                |
                | Example:
                |
                | Product 10 → quantity 2
                | Product 10 → quantity 3
                |
                | Total required = 5
                |
                */

                $requestedQuantities = [];

                foreach ($validated['items'] as $item) {

                    $productId = (int) $item['product_id'];

                    $quantity = (int) $item['quantity'];

                    if (!isset($requestedQuantities[$productId])) {
                        $requestedQuantities[$productId] = 0;
                    }

                    $requestedQuantities[$productId] += $quantity;
                }

                /*
                |--------------------------------------------------------------------------
                | Lock and validate all products
                |--------------------------------------------------------------------------
                |
                | We lock every product row before checking stock.
                | This prevents two simultaneous orders from buying
                | the same remaining stock.
                |
                */

                $lockedProducts = [];

                foreach ($requestedQuantities as $productId => $totalQuantity) {

                    $product = Product::lockForUpdate()
                        ->where('id', $productId)
                        ->where('is_active', true)
                        ->first();

                    if (!$product) {
                        abort(
                            422,
                            'One of the selected products is unavailable.'
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Check TOTAL stock required for this product
                    |--------------------------------------------------------------------------
                    */

                    if ($product->stock < $totalQuantity) {
                        abort(
                            422,
                            "Insufficient stock for {$product->name}."
                        );
                    }

                    $lockedProducts[$productId] = $product;
                }

                /*
                |--------------------------------------------------------------------------
                | Calculate each order item
                |--------------------------------------------------------------------------
                */

                foreach ($validated['items'] as $item) {

                    $productId = (int) $item['product_id'];

                    $product = $lockedProducts[$productId];

                    $quantity = (int) $item['quantity'];

                    /*
                    |--------------------------------------------------------------------------
                    | Calculate item price
                    |--------------------------------------------------------------------------
                    */

                    $price = (float) $product->price;

                    $itemTotal = $price * $quantity;

                    $subtotal += $itemTotal;

                    /*
                    |--------------------------------------------------------------------------
                    | Store order item information
                    |--------------------------------------------------------------------------
                    */

                    $orderItems[] = [
                        'product' => $product,

                        'quantity' => $quantity,

                        'size' => $item['size'] ?? null,

                        'color' => $item['color'] ?? null,

                        'price' => $price,

                        'total' => $itemTotal,
                    ];
                }

                /*
                |--------------------------------------------------------------------------
                | 4. Coupon
                |--------------------------------------------------------------------------
                */

                $coupon = null;

                $discountAmount = 0;

                $couponCode = $validated['coupon_code'] ?? null;

                if ($couponCode) {

                    /*
                    |--------------------------------------------------------------------------
                    | Normalize coupon code
                    |--------------------------------------------------------------------------
                    */

                    $couponCode = strtoupper(
                        trim($couponCode)
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Find coupon and lock row
                    |--------------------------------------------------------------------------
                    */

                    $coupon = Coupon::where(
                        'code',
                        $couponCode
                    )
                        ->lockForUpdate()
                        ->first();

                    if (!$coupon) {
                        abort(
                            422,
                            'Invalid coupon code.'
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Check active status
                    |--------------------------------------------------------------------------
                    */

                    if (!$coupon->is_active) {
                        abort(
                            422,
                            'This coupon is inactive.'
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Check start date
                    |--------------------------------------------------------------------------
                    */

                    $now = now();

                    if (
                        $coupon->starts_at &&
                        $now->lt($coupon->starts_at)
                    ) {
                        abort(
                            422,
                            'This coupon is not active yet.'
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Check expiry
                    |--------------------------------------------------------------------------
                    */

                    if (
                        $coupon->expires_at &&
                        $now->gt($coupon->expires_at)
                    ) {
                        abort(
                            422,
                            'This coupon has expired.'
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Check usage limit
                    |--------------------------------------------------------------------------
                    */

                    if (
                        $coupon->usage_limit !== null &&
                        $coupon->usage_count >= $coupon->usage_limit
                    ) {
                        abort(
                            422,
                            'This coupon usage limit has been reached.'
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Check minimum order amount
                    |--------------------------------------------------------------------------
                    */

                    if (
                        $subtotal <
                        (float) $coupon->min_order_amount
                    ) {
                        abort(
                            422,
                            'Minimum order amount is ₹' .
                            number_format(
                                $coupon->min_order_amount,
                                2
                            )
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Calculate discount
                    |--------------------------------------------------------------------------
                    */

                    $discountAmount =
                        $coupon->calculateDiscount(
                            (float) $subtotal
                        );
                }

                /*
                |--------------------------------------------------------------------------
                | 5. Shipping
                |--------------------------------------------------------------------------
                */

                $shippingAmount = $subtotal >= 2000
                    ? 0
                    : 99;

                /*
                |--------------------------------------------------------------------------
                | 6. Final total
                |--------------------------------------------------------------------------
                */

              /*
|--------------------------------------------------------------------------
| 6. GST CALCULATION
|--------------------------------------------------------------------------
*/

$taxableAmount = max(
    0,
    $subtotal - $discountAmount
);

$gstRateTotal = 0;

foreach ($orderItems as $item) {
    $product = $item['product'];

    $gstRate = (float) ($product->gst_rate ?? 0);

    if ($gstRate <= 0) {
        continue;
    }

    $itemTaxableAmount =
        $item['total'] -
        (
            $item['total'] /
            max($subtotal, 1)
        ) * $discountAmount;

    $gstRateTotal +=
        $itemTaxableAmount * $gstRate;
}

$gstAmount = 0;

if ($subtotal > 0) {
    /*
    |--------------------------------------------------------------------------
    | Weighted average GST rate
    |--------------------------------------------------------------------------
    */

    $weightedGstRate =
        $gstRateTotal / $taxableAmount;

    $gstAmount =
        round(
            $taxableAmount *
            $weightedGstRate,
            2
        );
} else {
    $weightedGstRate = 0;
}

/*
|--------------------------------------------------------------------------
| Determine CGST / SGST / IGST
|--------------------------------------------------------------------------
*/

$businessState =
    strtolower(
        trim(
            env(
                'GST_BUSINESS_STATE',
                ''
            )
        )
    );

$billingState =
    strtolower(
        trim(
            $validated['customer']['state']
        )
    );

$cgstAmount = 0;
$sgstAmount = 0;
$igstAmount = 0;
$taxType = 'none';

if ($gstAmount > 0) {

    if (
        $businessState &&
        $billingState &&
        $businessState === $billingState
    ) {

        $cgstAmount =
            round(
                $gstAmount / 2,
                2
            );

        $sgstAmount =
            round(
                $gstAmount - $cgstAmount,
                2
            );

        $taxType = 'cgst_sgst';

    } else {

        $igstAmount =
            round(
                $gstAmount,
                2
            );

        $taxType = 'igst';
    }
}

/*
|--------------------------------------------------------------------------
| 7. FINAL TOTAL
|--------------------------------------------------------------------------
*/

$totalAmount = max(
    0,
    $taxableAmount +
    $gstAmount +
    $shippingAmount
);

                /*
                |--------------------------------------------------------------------------
                | 7. Generate unique order number
                |--------------------------------------------------------------------------
                */

                do {

                    $orderNumber =
                        'NAV-' .
                        now()->format('Ymd') .
                        '-' .
                        strtoupper(
                            Str::random(6)
                        );

                } while (
                    Order::where(
                        'order_number',
                        $orderNumber
                    )->exists()
                );

                /*
                |--------------------------------------------------------------------------
                | 8. Create order
                |--------------------------------------------------------------------------
                */

                $order = Order::create([
                    'customer_id' => $customer->id,

                    'order_number' => $orderNumber,

                    'subtotal' => $subtotal,

                    'shipping_amount' => $shippingAmount,

                    'discount_amount' => $discountAmount,

                    'total_amount' => $totalAmount,

                    'coupon_id' => $coupon?->id,

                    'coupon_code' => $coupon?->code,

                    'payment_status' => 'pending',

                    'order_status' => 'pending',

                    'payment_method' => 'razorpay',

                    'taxable_amount' => $taxableAmount,
                    'gst_rate' => $taxableAmount > 0
                        ? round(($gstAmount / $taxableAmount) * 100, 2)
                        : 0,
                    'gst_amount' => $gstAmount,
                    'cgst_amount' => $cgstAmount,
                    'sgst_amount' => $sgstAmount,
                    'igst_amount' => $igstAmount,
                    'tax_type' => $taxType,
                    'billing_state' => $validated['customer']['state'],
                ]);

                /*
                |--------------------------------------------------------------------------
                | 9. Create order items + reduce stock
                |--------------------------------------------------------------------------
                */

                foreach ($orderItems as $item) {

                    $product = $item['product'];

                    /*
                    |--------------------------------------------------------------------------
                    | Create order item
                    |--------------------------------------------------------------------------
                    */

                    $order->items()->create([
                        'product_id' => $product->id,

                        'product_name' => $product->name,

                        'size' => $item['size'],

                        'color' => $item['color'],

                        'quantity' => $item['quantity'],

                        'price' => $item['price'],

                        'total' => $item['total'],
                    ]);

                    /*
                    |--------------------------------------------------------------------------
                    | Reduce product stock
                    |--------------------------------------------------------------------------
                    */

                    $product->decrement(
                        'stock',
                        $item['quantity']
                    );
                }

                return $order;
            });

            /*
            |--------------------------------------------------------------------------
            | 10. Load relationships
            |--------------------------------------------------------------------------
            */

            $order->load([
                'customer',
                'items.product',
                'payment',
            ]);

            /*
            |--------------------------------------------------------------------------
            | 11. Success response
            |--------------------------------------------------------------------------
            */

            return response()->json([
                'success' => true,

                'message' => 'Order created successfully.',

                'data' => $order,
            ], 201);

        } catch (\Throwable $e) {

            /*
            |--------------------------------------------------------------------------
            | Error response
            |--------------------------------------------------------------------------
            */

            return response()->json([
                'success' => false,

                'message' => $e->getMessage(),
            ], 422);
        }
    }


    /**
     * Public order lookup
     */
    // public function show(
    //                 string $orderNumber
    //             ): JsonResponse {

    //                 $order = Order::with([
    //                     'customer',
    //                     'items.product',
    //                     'payment',
    //                 ])
    //                     ->where(
    //                         'order_number',
    //                         $orderNumber
    //                     )
    //                     ->first();

    //                 if (!$order) {

    //                     return response()->json([
    //                         'success' => false,

    //                         'message' => 'Order not found.',
    //                     ], 404);
    //                 }

    //                 return response()->json([
    //                     'success' => true,

    //                     'data' => $order,
    //                 ]);
    // }

    /**
 * Public order lookup
 *
 * Returns only limited order information.
 * Customer/payment sensitive information is not exposed.
 */
public function show(
    string $orderNumber
): JsonResponse {

    $order = Order::where(
        'order_number',
        $orderNumber
    )->first();

    if (!$order) {
        return response()->json([
            'success' => false,
            'message' => 'Order not found.',
        ], 404);
    }

    return response()->json([
        'success' => true,
        'data' => [
            'order_number' => $order->order_number,
            'payment_status' => $order->payment_status,
            'order_status' => $order->order_status,
            'total_amount' => $order->total_amount,
            'created_at' => $order->created_at,
        ],
    ]);
}


    /**
     * Get all orders of logged-in customer
     */
    public function customerOrders(
        Request $request
    ): JsonResponse {

        $customer = $request->user();

        if (!$customer) {

            return response()->json([
                'success' => false,

                'message' => 'Unauthenticated.',
            ], 401);
        }

        $orders = Order::where(
            'customer_id',
            $customer->id
        )
            ->with([
                'items.product',
                'payment',
            ])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,

            'data' => [
                'orders' => $orders,
            ],
        ]);
    }


    /**
     * Get single order of logged-in customer
     */
    public function customerOrder(
        Request $request,
        string $orderNumber
    ): JsonResponse {

        $customer = $request->user();

        if (!$customer) {

            return response()->json([
                'success' => false,

                'message' => 'Unauthenticated.',
            ], 401);
        }

        $order = Order::where(
            'customer_id',
            $customer->id
        )
            ->where(
                'order_number',
                $orderNumber
            )
            ->with([
                'customer',
                'items.product',
                'payment',
            ])
            ->first();

        if (!$order) {

            return response()->json([
                'success' => false,

                'message' => 'Order not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,

            'data' => [
                'order' => $order,
            ],
        ]);
    }
}