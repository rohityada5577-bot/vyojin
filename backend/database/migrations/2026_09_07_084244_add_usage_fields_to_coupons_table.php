<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('coupons', function (Blueprint $table) {

            if (!Schema::hasColumn('coupons', 'usage_limit')) {
                $table->unsignedInteger('usage_limit')
                    ->nullable()
                    ->after('expires_at');
            }

            if (!Schema::hasColumn('coupons', 'usage_count')) {
                $table->unsignedInteger('usage_count')
                    ->default(0)
                    ->after('usage_limit');
            }

            if (!Schema::hasColumn('coupons', 'is_active')) {
                $table->boolean('is_active')
                    ->default(true)
                    ->after('usage_count');
            }
        });
    }

    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {

            if (Schema::hasColumn('coupons', 'usage_limit')) {
                $table->dropColumn('usage_limit');
            }

            if (Schema::hasColumn('coupons', 'usage_count')) {
                $table->dropColumn('usage_count');
            }

            if (Schema::hasColumn('coupons', 'is_active')) {
                $table->dropColumn('is_active');
            }
        });
    }
};