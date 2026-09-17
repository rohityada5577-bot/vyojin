<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Customer;

class AdminDashboardController extends Controller
{
    public function index()
    {
        /*
        |--------------------------------------------------------------------------
        | Dashboard Statistics
        |--------------------------------------------------------------------------
        */

        // Total revenue from paid orders
        $totalRevenue = Order::where(
            'payment_status',
            'paid'
        )->sum('total_amount');

        // Total orders
        $totalOrders = Order::count();

        // Total customers
        $totalCustomers = Customer::count();

        // Total products
        $totalProducts = Product::count();

        // Pending orders
        $pendingOrders = Order::where(
            'order_status',
            'pending'
        )->count();

        // Paid orders
        $paidOrders = Order::where(
            'payment_status',
            'paid'
        )->count();


        /*
        |--------------------------------------------------------------------------
        | Recent Orders
        |--------------------------------------------------------------------------
        */

        $recentOrders = Order::with('customer')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($order) {

                return [
                    'id' => $order->id,

                    'order_number' =>
                        $order->order_number,

                    'customer_name' =>
                        $order->customer?->name,

                    'total' =>
                        (float) $order->total_amount,

                    'status' =>
                        $order->order_status,

                    'payment_status' =>
                        $order->payment_status,

                    'created_at' =>
                        $order->created_at,
                ];
            });


        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,

            'data' => [

                'stats' => [

                    'total_revenue' =>
                        (float) $totalRevenue,

                    'total_orders' =>
                        $totalOrders,

                    'total_customers' =>
                        $totalCustomers,

                    'total_products' =>
                        $totalProducts,

                    'pending_orders' =>
                        $pendingOrders,

                    'paid_orders' =>
                        $paidOrders,
                ],

                'recent_orders' =>
                    $recentOrders,
            ],
        ]);
    }
}