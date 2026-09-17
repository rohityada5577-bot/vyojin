<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validateCoupon(Request $request)
    {
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:50',
            ],

            'subtotal' => [
                'required',
                'numeric',
                'min:0',
            ],
        ]);

        $code = strtoupper(
            trim($validated['code'])
        );

        $subtotal = (float) $validated['subtotal'];

        $coupon = Coupon::where(
            'code',
            $code
        )->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid coupon code.',
            ], 422);
        }

        if (!$coupon->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'This coupon is inactive.',
            ], 422);
        }

        if (
            $coupon->starts_at &&
            now()->lt($coupon->starts_at)
        ) {
            return response()->json([
                'success' => false,
                'message' => 'This coupon is not active yet.',
            ], 422);
        }

        if (
            $coupon->expires_at &&
            now()->gt($coupon->expires_at)
        ) {
            return response()->json([
                'success' => false,
                'message' => 'This coupon has expired.',
            ], 422);
        }

        if (
            $coupon->usage_limit !== null &&
            $coupon->used_count >= $coupon->usage_limit
        ) {
            return response()->json([
                'success' => false,
                'message' => 'This coupon usage limit has been reached.',
            ], 422);
        }

        if (
            $subtotal < (float) $coupon->min_order_amount
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Minimum order amount is ₹' .
                    number_format(
                        $coupon->min_order_amount,
                        2
                    ),
            ], 422);
        }

        $discount = $coupon->calculateDiscount(
            $subtotal
        );

        if ($discount <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon cannot be applied.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Coupon applied successfully.',
            'data' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'name' => $coupon->name,
                'type' => $coupon->type,
                'value' => $coupon->value,
                'discount' => $discount,
                'subtotal' => $subtotal,
                'min_order_amount' => $coupon->min_order_amount,
                'max_discount' => $coupon->max_discount,
            ],
        ]);
    }
}