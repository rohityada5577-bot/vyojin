<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'compare_price',
        'gst_rate' => 'decimal:2',
        'sku',
        'stock',
        'image',
        'images',
        'sizes',
        'colors',
        'is_active',
        'is_featured',
        'is_new_arrival',
    ];

    protected $casts = [
        'images' => 'array',
        'sizes' => 'array',
        'colors' => 'array',
        'price' => 'decimal:2',
        'compare_price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
         'is_new_arrival' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}