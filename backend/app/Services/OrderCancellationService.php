<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class OrderCancellationService
{
    /**
     * Cancel an unpaid order and restore stock exactly once.
     */
    public function cancel(
        string $orderNumber,
        string $reason = 'Order cancelled.'
    ): array {
        return DB::transaction(function () use (
            $orderNumber,
            $reason
        ) {
            $order = Order::where(
                'order_number',
                $orderNumber
            )
                ->lockForUpdate()
                ->first();

            if (!$order) {
                return [
                    'status' => 'not_found',
                    'order' => null,
                ];
            }

            // Never cancel or restore stock for a paid order here.
            if ($order->payment_status === 'paid') {
                return [
                    'status' => 'paid',
                    'order' => $order,
                ];
            }

            // Already cancelled = stock was already restored.
            if ($order->order_status === 'cancelled') {
                return [
                    'status' => 'already_cancelled',
                    'order' => $order,
                ];
            }

            /*
            |--------------------------------------------------------------------------
            | Restore stock
            |--------------------------------------------------------------------------
            */

            $items = $order->items()
                ->lockForUpdate()
                ->get();

            foreach ($items as $item) {
                $product = Product::lockForUpdate()
                    ->find($item->product_id);

                if (!$product) {
                    continue;
                }

                $product->increment(
                    'stock',
                    (int) $item->quantity
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Cancel order
            |--------------------------------------------------------------------------
            */

            $order->update([
                'payment_status' => 'failed',
                'order_status' => 'cancelled',
                'notes' => $reason,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Update payment
            |--------------------------------------------------------------------------
            */

            $payment = Payment::where(
                'order_id',
                $order->id
            )
                ->lockForUpdate()
                ->first();

            if ($payment) {
                $payment->update([
                    'status' => 'failed',
                    'response' => json_encode([
                        'reason' => $reason,
                    ]),
                ]);
            }

            return [
                'status' => 'cancelled',
                'order' => $order->fresh([
                    'customer',
                    'items.product',
                    'payment',
                ]),
            ];
        });
    }
}