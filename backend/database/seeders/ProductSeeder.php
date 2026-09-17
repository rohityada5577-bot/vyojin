<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $category = Category::firstOrCreate(
            [
                'slug' => 'navratri-collection',
            ],
            [
                'name' => 'Navratri Collection',
                'description' => 'Premium festive collection',
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        Product::create([
            'category_id' => $category->id,
            'name' => 'Royal Navratri Kurta Set',
            'slug' => 'royal-navratri-kurta-set',
            'description' => 'Premium festive kurta set designed for Navratri celebrations.',
            'price' => 2499,
            'compare_price' => 3299,
            'sku' => 'NAV-KURTA-001',
            'stock' => 25,
            'image' => '/images/products/kurta-1.jpg',
            'images' => [
                '/images/products/kurta-1.jpg',
                '/images/products/kurta-2.jpg',
            ],
            'sizes' => [
                'S',
                'M',
                'L',
                'XL',
            ],
            'colors' => [
                'Maroon',
                'Cream',
            ],
            'is_active' => true,
            'is_featured' => true,
        ]);

        Product::create([
            'category_id' => $category->id,
            'name' => 'Festive Embroidered Set',
            'slug' => 'festive-embroidered-set',
            'description' => 'Elegant embroidered festive outfit for Navratri.',
            'price' => 2999,
            'compare_price' => 3999,
            'sku' => 'NAV-SET-002',
            'stock' => 18,
            'image' => '/images/products/set-1.jpg',
            'images' => [
                '/images/products/set-1.jpg',
            ],
            'sizes' => [
                'S',
                'M',
                'L',
                'XL',
            ],
            'colors' => [
                'Red',
                'Gold',
            ],
            'is_active' => true,
            'is_featured' => true,
        ]);
    }
}