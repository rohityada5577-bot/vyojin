<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class AdminAnalyticsController extends Controller
{

public function topProducts(Request $request)
{
    $limit = min((int) $request->get('limit', 5), 20);

    $products = DB::table('order_items')
        ->join('orders', 'order_items.order_id', '=', 'orders.id')
        ->join('products', 'order_items.product_id', '=', 'products.id')
        ->where('orders.payment_status', 'paid')
        ->select(
            'products.id',
            'products.name',
            'products.slug',
            DB::raw('SUM(order_items.quantity) as sold_quantity'),
            DB::raw('SUM(order_items.quantity * order_items.price) as revenue')
        )
        ->groupBy(
            'products.id',
            'products.name',
            'products.slug'
        )
        ->orderByDesc('sold_quantity')
        ->limit($limit)
        ->get();

    return response()->json([
        'success' => true,
        'data' => $products->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sold_quantity' => (int) $product->sold_quantity,
                'revenue' => (float) $product->revenue,
            ];
        }),
    ]);
}

public function lowStock(Request $request)
{
    $limit = min((int) $request->get('limit', 10), 50);

    $products = Product::where('stock', '<=', 5)
        ->orderBy('stock', 'asc')
        ->limit($limit)
        ->get([
            'id',
            'name',
            'slug',
            'stock',
        ]);

    return response()->json([
        'success' => true,
        'data' => $products,
    ]);
}
    public function sales(Request $request)
    {
        $period = $request->get('period', '30days');

        switch ($period) {
            case '7days':
                $startDate = Carbon::now()->subDays(6)->startOfDay();
                break;

            case '90days':
                $startDate = Carbon::now()->subDays(89)->startOfDay();
                break;

            case '12months':
                $startDate = Carbon::now()->subMonths(11)->startOfMonth();
                break;

            default:
                $startDate = Carbon::now()->subDays(29)->startOfDay();
                $period = '30days';
                break;
        }

        $endDate = Carbon::now()->endOfDay();

        $orders = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        $revenue = $orders->sum('total_amount');
        $orderCount = $orders->count();

        /*
        |--------------------------------------------------------------------------
        | Daily / Monthly Chart Data
        |--------------------------------------------------------------------------
        */

        $chartData = [];

        if ($period === '12months') {

            $current = $startDate->copy();

            while ($current <= $endDate) {

                $monthOrders = $orders->filter(function ($order) use ($current) {
                    return Carbon::parse($order->created_at)
                        ->isSameMonth($current);
                });

                $chartData[] = [
                    'label' => $current->format('M Y'),
                    'revenue' => round(
                        $monthOrders->sum('total_amount'),
                        2
                    ),
                    'orders' => $monthOrders->count(),
                ];

                $current->addMonth();
            }

        } else {

            $current = $startDate->copy();

            while ($current <= $endDate) {

                $dayOrders = $orders->filter(function ($order) use ($current) {
                    return Carbon::parse($order->created_at)
                        ->isSameDay($current);
                });

                $chartData[] = [
                    'label' => $current->format('d M'),
                    'revenue' => round(
                        $dayOrders->sum('total_amount'),
                        2
                    ),
                    'orders' => $dayOrders->count(),
                ];

                $current->addDay();
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Order Status
        |--------------------------------------------------------------------------
        */

        $statusData = Order::whereBetween(
                'created_at',
                [$startDate, $endDate]
            )
            ->selectRaw('order_status, COUNT(*) as count')
            ->groupBy('order_status')
            ->pluck('count', 'order_status');

        return response()->json([
            'success' => true,

            'data' => [
                'period' => $period,

                'summary' => [
                    'revenue' => round($revenue, 2),
                    'orders' => $orderCount,
                    'average_order_value' => $orderCount > 0
                        ? round($revenue / $orderCount, 2)
                        : 0,
                ],

                'chart' => $chartData,

                'order_status' => [
                    'pending' => (int) ($statusData['pending'] ?? 0),
                    'confirmed' => (int) ($statusData['confirmed'] ?? 0),
                    'processing' => (int) ($statusData['processing'] ?? 0),
                    'shipped' => (int) ($statusData['shipped'] ?? 0),
                    'delivered' => (int) ($statusData['delivered'] ?? 0),
                    'cancelled' => (int) ($statusData['cancelled'] ?? 0),
                ],
            ],
        ]);
    }
}