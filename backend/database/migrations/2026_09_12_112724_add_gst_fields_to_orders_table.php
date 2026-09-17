<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {

            $table->decimal('taxable_amount', 10, 2)
                ->default(0)
                ->after('discount_amount');

            $table->decimal('gst_rate', 5, 2)
                ->default(0)
                ->after('taxable_amount');

            $table->decimal('gst_amount', 10, 2)
                ->default(0)
                ->after('gst_rate');

            $table->decimal('cgst_amount', 10, 2)
                ->default(0)
                ->after('gst_amount');

            $table->decimal('sgst_amount', 10, 2)
                ->default(0)
                ->after('cgst_amount');

            $table->decimal('igst_amount', 10, 2)
                ->default(0)
                ->after('sgst_amount');

            $table->string('tax_type')
                ->nullable()
                ->after('igst_amount');

            $table->string('billing_state')
                ->nullable()
                ->after('tax_type');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'taxable_amount',
                'gst_rate',
                'gst_amount',
                'cgst_amount',
                'sgst_amount',
                'igst_amount',
                'tax_type',
                'billing_state',
            ]);
        });
    }
};