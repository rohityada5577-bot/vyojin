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
    Schema::create('orders', function (Blueprint $table) {
        $table->id();

        $table->foreignId('customer_id')
            ->constrained('customers')
            ->cascadeOnDelete();

        $table->string('order_number')->unique();

        $table->decimal('subtotal', 10, 2);
        $table->decimal('shipping_amount', 10, 2)->default(0);
        $table->decimal('discount_amount', 10, 2)->default(0);
        $table->decimal('total_amount', 10, 2);

        $table->string('payment_status')->default('pending');
        $table->string('order_status')->default('pending');
        $table->boolean('stock_restored')->default(false);

        $table->string('payment_method')->nullable();

        $table->text('notes')->nullable();

        $table->timestamps();

        $table->index('order_number');
        $table->index('payment_status');
        $table->index('order_status');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
