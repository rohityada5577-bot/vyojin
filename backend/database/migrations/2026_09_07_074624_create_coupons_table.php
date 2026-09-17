<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();

            $table->string('code')->unique();

            $table->string('name')->nullable();

            $table->text('description')->nullable();

            // percentage or fixed
            $table->enum('type', ['percentage', 'fixed']);

            // Example:
            // percentage => 10 means 10%
            // fixed => 500 means ₹500
            $table->decimal('value', 10, 2);

            // Optional maximum discount for percentage coupons
            $table->decimal('max_discount', 10, 2)->nullable();

            // Minimum cart value required
            $table->decimal('min_order_amount', 10, 2)->default(0);

            // Usage limits
            $table->unsignedInteger('usage_limit')->nullable();

            $table->unsignedInteger('used_count')->default(0);

            $table->unsignedInteger('per_customer_limit')->nullable();

            $table->dateTime('starts_at')->nullable();

            $table->dateTime('expires_at')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index('code');
            $table->index('is_active');
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};