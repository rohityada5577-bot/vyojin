<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'customer_id',
        'order_number',

        // Amounts
        'subtotal',
        'shipping_amount',
        'discount_amount',
        'total_amount',

        // Coupon
        'coupon_id',
        'coupon_code',

        // Status
        'payment_status',
        'order_status',
        'stock_restored',

        // Payment
        'payment_method',

        //shipmemnt
          'shipment_id',
            'tracking_number',
            'courier_name',
            'shipping_status',
            'shipped_at',
            'delivered_at',

        // Additional information
        'notes',

     // GST and Tax fields
        'taxable_amount',
        'gst_rate',
        'gst_amount',
        'cgst_amount',
        'sgst_amount',
        'igst_amount',
        'tax_type',
        'billing_state',
    ];

   protected $casts = [
    'subtotal' => 'decimal:2',
    'shipping_amount' => 'decimal:2',
    'discount_amount' => 'decimal:2',
    'total_amount' => 'decimal:2',

    'stock_restored' => 'boolean',

    // Shipping
    'shipped_at' => 'datetime',
    'delivered_at' => 'datetime',

    // GST and Tax fields
    'taxable_amount' => 'decimal:2',
    'gst_rate' => 'decimal:2',
    'gst_amount' => 'decimal:2',
    'cgst_amount' => 'decimal:2',
    'sgst_amount' => 'decimal:2',
    'igst_amount' => 'decimal:2',
];
    /**
     * Customer who placed the order.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Coupon used for the order.
     */
    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    /**
     * Products/items included in the order.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Payment associated with the order.
     */
    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}