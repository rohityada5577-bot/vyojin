<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'type',
        'value',
        'max_discount',
        'min_order_amount',
        'usage_limit',
        'used_count',
        'per_customer_limit',
        'starts_at',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'min_order_amount' => 'decimal:2',

        'starts_at' => 'datetime',
        'expires_at' => 'datetime',

        'is_active' => 'boolean',
    ];

    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if (
            $this->starts_at &&
            now()->lt($this->starts_at)
        ) {
            return false;
        }

        if (
            $this->expires_at &&
            now()->gt($this->expires_at)
        ) {
            return false;
        }

        if (
            $this->usage_limit !== null &&
            $this->used_count >= $this->usage_limit
        ) {
            return false;
        }

        return true;
    }

    public function calculateDiscount(float $subtotal): float
    {
        if (!$this->isValid()) {
            return 0;
        }

        if ($subtotal < (float) $this->min_order_amount) {
            return 0;
        }

        if ($this->type === 'percentage') {
            $discount = ($subtotal * (float) $this->value) / 100;

            if ($this->max_discount !== null) {
                $discount = min(
                    $discount,
                    (float) $this->max_discount
                );
            }

            return round($discount, 2);
        }

        return round(
            min((float) $this->value, $subtotal),
            2
        );
    }
}