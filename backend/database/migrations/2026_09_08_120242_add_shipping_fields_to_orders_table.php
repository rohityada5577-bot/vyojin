<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
      Schema::table('orders', function (Blueprint $table) {
                $table->string('shipment_id')->nullable()->after('order_number');
                $table->string('tracking_number')->nullable()->after('shipment_id');
                $table->string('courier_name')->nullable()->after('tracking_number');
                $table->string('shipping_status')->default('pending')->after('courier_name');
                $table->timestamp('shipped_at')->nullable()->after('shipping_status');
                $table->timestamp('delivered_at')->nullable()->after('shipped_at');
            });
                }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
       Schema::table('orders', function (Blueprint $table) {
    $table->dropColumn([
        'shipment_id',
        'tracking_number',
        'courier_name',
        'shipping_status',
        'shipped_at',
        'delivered_at',
    ]);
});
    }
};
