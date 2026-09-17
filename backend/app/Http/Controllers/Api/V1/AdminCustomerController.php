<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class AdminCustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query()
            ->withCount('orders')
            ->withSum('orders', 'total_amount');

        if ($request->filled('search')) {
            $search = trim($request->search);

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $customers = $query
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $customers,
        ]);
    }

    public function show($id)
    {
        $customer = Customer::with([
            'orders' => function ($query) {
                $query->latest();
            },
        ])
            ->withCount('orders')
            ->withSum('orders', 'total_amount')
            ->find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $customer,
        ]);
    }
}