<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
// use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\OrderCancellationService;
use App\Services\ShiprocketService;
use Throwable;

class AdminOrderController extends Controller
{
    /**
     * Get all orders
     */
    public function index(Request $request)
    {
        $query = Order::with([
            'customer',
            'items.product',
            'payment',
        ]);

        // Search
        if ($request->filled('search')) {
            $search = trim($request->search);

            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($customerQuery) use ($search) {
                        $customerQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
            });
        }

        // Order status filter
        if ($request->filled('order_status')) {
            $query->where(
                'order_status',
                $request->order_status
            );
        }

        // Payment status filter
        if ($request->filled('payment_status')) {
            $query->where(
                'payment_status',
                $request->payment_status
            );
        }

        // Payment method filter
        if ($request->filled('payment_method')) {
            $query->where(
                'payment_method',
                $request->payment_method
            );
        }

        $perPage = min(
            max($request->integer('per_page', 15), 1),
            100
        );

        $orders = $query
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }


    /**
     * Get single order
     */
    public function show($id)
    {
        $order = Order::with([
            'customer',
            'items.product',
            'payment',
        ])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }


    /**
     * Update order status
     */
  public function updateStatus(
    Request $request,
    $id,
    OrderCancellationService $cancellationService
) {
    $validated = $request->validate([
        'order_status' => [
            'required',
            'string',
            'in:pending,confirmed,processing,shipped,delivered,cancelled',
        ],
    ]);

    try {

        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        $newStatus = $validated['order_status'];

        /*
        |--------------------------------------------------------------------------
        | Same status
        |--------------------------------------------------------------------------
        */

        if ($order->order_status === $newStatus) {
            return response()->json([
                'success' => true,
                'message' => 'Order status is already set to this status.',
                'data' => $order,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Cancel order
        |--------------------------------------------------------------------------
        */

        if ($newStatus === 'cancelled') {

            // Paid orders require refund handling.
            if ($order->payment_status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Paid order cannot be cancelled without processing a refund.',
                ], 422);
            }

            $result = $cancellationService->cancel(
                $order->order_number,
                'Order cancelled by admin.'
            );

            if ($result['status'] === 'not_found') {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found.',
                ], 404);
            }

            if ($result['status'] === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Paid order cannot be cancelled without processing a refund.',
                ], 422);
            }

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled and stock restored.',
                'data' => $result['order'],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Cancelled order cannot be reopened
        |--------------------------------------------------------------------------
        */

        if ($order->order_status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'A cancelled order cannot be reopened.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Delivered order cannot be changed
        |--------------------------------------------------------------------------
        */

        if ($order->order_status === 'delivered') {
            return response()->json([
                'success' => false,
                'message' => 'A delivered order cannot be changed.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Paid order cannot go back to pending
        |--------------------------------------------------------------------------
        */

        if (
            $order->payment_status === 'paid' &&
            $newStatus === 'pending'
        ) {
            return response()->json([
                'success' => false,
                'message' => 'A paid order cannot be moved back to pending.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Normal status update
        |--------------------------------------------------------------------------
        */

        $order->update([
            'order_status' => $newStatus,
        ]);

        $order->load([
            'customer',
            'items.product',
            'payment',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully.',
            'data' => $order,
        ]);

    } catch (\Throwable $e) {

        return response()->json([
            'success' => false,
            'message' => 'Unable to update order status.',
        ], 500);
    }
}
/**
 * Create Shiprocket shipment for an order
 */
public function createShipment(
    $id,
    ShiprocketService $shiprocket
) {
    try {
        $order = Order::with([
            'customer',
            'items.product',
        ])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Prevent duplicate shipment
        |--------------------------------------------------------------------------
        */

        if ($order->shipment_id) {
            return response()->json([
                'success' => false,
                'message' => 'Shipment already created for this order.',
                'data' => $order,
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Customer validation
        |--------------------------------------------------------------------------
        */

        if (!$order->customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer information is missing.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Create Shiprocket order payload
        |--------------------------------------------------------------------------
        */

        $items = [];

        foreach ($order->items as $item) {
            $items[] = [
                'name' => $item->product->name,
                'sku' => $item->product->sku ?: 'PRODUCT-' . $item->product->id,
                'units' => $item->quantity,
                'selling_price' => (float) $item->price,
                'discount' => 0,
                'tax' => (float) ($item->product->gst_rate ?? 0),
            ];
        }

        $payload = [
            'order_id' => $order->order_number,
            'order_date' => $order->created_at
                ? $order->created_at->format('Y-m-d H:i')
                : now()->format('Y-m-d H:i'),

            // IMPORTANT:
            // Replace this with the exact pickup location
            // configured in your Shiprocket account.
            'pickup_location' => 'Primary',

            'channel_id' => '',

            'comment' => 'RangRiwaaz order ' . $order->order_number,

            'billing_customer_name' => $order->customer->name,
            'billing_last_name' => '',
            'billing_address' => $order->customer->address,
            'billing_address_2' => '',
            'billing_city' => $order->customer->city,
            'billing_pincode' => $order->customer->pincode,
            'billing_state' => $order->customer->state,
            'billing_country' => 'India',
            'billing_email' => $order->customer->email,
            'billing_phone' => $order->customer->phone,

            'shipping_is_billing' => true,

            'order_items' => $items,

            'payment_method' =>
                strtoupper($order->payment_method) === 'COD'
                    ? 'COD'
                    : 'Prepaid',

            'shipping_charges' => (float) $order->shipping_amount,
            'giftwrap_charges' => 0,
            'transaction_charges' => 0,
            'total_discount' => (float) $order->discount_amount,
            'sub_total' => (float) $order->subtotal,

            // Temporary package dimensions for development.
            // We can later make these configurable.
            'length' => 10,
            'breadth' => 10,
            'height' => 10,
            'weight' => 1,
        ];

        /*
        |--------------------------------------------------------------------------
        | Create Shiprocket order
        |--------------------------------------------------------------------------
        */

        $result = $shiprocket->createOrder($payload);

        /*
        |--------------------------------------------------------------------------
        | Save shipment ID
        |--------------------------------------------------------------------------
        */

        $shipmentId =
            $result['shipment_id']
            ?? $result['shipment_id']
            ?? null;

        if (!$shipmentId) {
            return response()->json([
                'success' => false,
                'message' => 'Shiprocket order created but shipment ID was not returned.',
                'data' => $result,
            ], 422);
        }

        $order->update([
            'shipment_id' => (string) $shipmentId,
            'shipping_status' => 'created',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Shiprocket shipment created successfully.',
            'data' => [
                'order' => $order->fresh(),
                'shiprocket' => $result,
            ],
        ]);

    } catch (Throwable $e) {

        return response()->json([
            'success' => false,
            'message' => 'Unable to create shipment.',
            'error' => $e->getMessage(),
        ], 500);
    }
}
}