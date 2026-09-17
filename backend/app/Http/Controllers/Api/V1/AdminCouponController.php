<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminCouponController extends Controller
{
    public function index(Request $request)
    {
        $query = Coupon::query();

        if ($request->filled('search')) {
            $search = trim($request->search);

            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $status = $request->status;

            if ($status === 'active') {
                $query->where('is_active', true);
            }

            if ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $coupons = $query
            ->latest()
            ->paginate(
                $request->integer('per_page', 15)
            );

        return response()->json([
            'success' => true,
            'data' => $coupons,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:50',
                'unique:coupons,code',
            ],

            'name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'type' => [
                'required',
                Rule::in([
                    'percentage',
                    'fixed',
                ]),
            ],

            'value' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'max_discount' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'min_order_amount' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'usage_limit' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'per_customer_limit' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'starts_at' => [
                'nullable',
                'date',
            ],

            'expires_at' => [
                'nullable',
                'date',
                'after_or_equal:starts_at',
            ],

            'is_active' => [
                'nullable',
                'boolean',
            ],
        ]);

        if (
            $validated['type'] === 'percentage' &&
            $validated['value'] > 100
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Percentage discount cannot exceed 100%.',
            ], 422);
        }

        $validated['code'] = strtoupper(
            trim($validated['code'])
        );

        $coupon = Coupon::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Coupon created successfully.',
            'data' => $coupon,
        ], 201);
    }

    public function show($id)
    {
        $coupon = Coupon::find($id);

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $coupon,
        ]);
    }

    public function update(Request $request, $id)
    {
        $coupon = Coupon::find($id);

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon not found.',
            ], 404);
        }

        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('coupons', 'code')
                    ->ignore($coupon->id),
            ],

            'name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'type' => [
                'required',
                Rule::in([
                    'percentage',
                    'fixed',
                ]),
            ],

            'value' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'max_discount' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'min_order_amount' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'usage_limit' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'per_customer_limit' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'starts_at' => [
                'nullable',
                'date',
            ],

            'expires_at' => [
                'nullable',
                'date',
                'after_or_equal:starts_at',
            ],

            'is_active' => [
                'nullable',
                'boolean',
            ],
        ]);

        if (
            $validated['type'] === 'percentage' &&
            $validated['value'] > 100
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Percentage discount cannot exceed 100%.',
            ], 422);
        }

        $validated['code'] = strtoupper(
            trim($validated['code'])
        );

        $coupon->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Coupon updated successfully.',
            'data' => $coupon->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $coupon = Coupon::find($id);

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon not found.',
            ], 404);
        }

        $coupon->delete();

        return response()->json([
            'success' => true,
            'message' => 'Coupon deleted successfully.',
        ]);
    }

    public function toggleStatus($id)
    {
        $coupon = Coupon::find($id);

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon not found.',
            ], 404);
        }

        $coupon->is_active = !$coupon->is_active;
        $coupon->save();

        return response()->json([
            'success' => true,
            'message' => 'Coupon status updated.',
            'data' => $coupon,
        ]);
    }
}