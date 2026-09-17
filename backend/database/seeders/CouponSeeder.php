<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        Coupon::updateOrCreate(
            [
                'code' => 'NAVRATRI10',
            ],
            [
                'name' => 'Navratri 10% Off',
                'type' => 'percentage',
                'value' => 10,
                'min_order_amount' => 1000,
                'max_discount' => 500,
                'usage_limit' => 100,
                'usage_count' => 0,
                'is_active' => true,
            ]
        );
    }
}