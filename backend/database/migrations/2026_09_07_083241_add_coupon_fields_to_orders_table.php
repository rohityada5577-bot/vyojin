<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {

            if (!Schema::hasColumn('orders', 'coupon_id')) {
                $table->foreignId('coupon_id')
                    ->nullable()
                    ->after('customer_id')
                    ->constrained('coupons')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('orders', 'coupon_code')) {
                $table->string('coupon_code', 50)
                    ->nullable()
                    ->after('coupon_id');
            }

            // discount_amount already exists in your database.
            // Do not create it again.
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {

            if (Schema::hasColumn('orders', 'coupon_id')) {
                $table->dropForeign(['coupon_id']);
                $table->dropColumn('coupon_id');
            }

            if (Schema::hasColumn('orders', 'coupon_code')) {
                $table->dropColumn('coupon_code');
            }
        });
    }
};