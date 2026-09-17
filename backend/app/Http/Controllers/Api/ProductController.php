<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | PUBLIC PRODUCTS
    |--------------------------------------------------------------------------
    */

  public function index(Request $request): JsonResponse
{
    $query = Product::with('category')
        ->where('is_active', true);
      

    if ($request->filled('category')) {
        $query->whereHas('category', function ($q) use ($request) {
            $q->where('slug', $request->category);
        });
    }

    if ($request->filled('search')) {
        $search = $request->search;

        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }

    if ($request->boolean('featured')) {
        $query->where('is_featured', true);
    }

    if ($request->has('is_new_arrival')) {
        $query->where(
            'is_new_arrival',
            $request->boolean('is_new_arrival')
        );
    }

    $products = $query
        ->latest()
        ->paginate($request->integer('per_page', 12));

    return response()->json([
        'success' => true,
        'data' => $products,
    ]);
}

    public function show(string $slug): JsonResponse
    {
        $product = Product::with('category')
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | ADMIN - PRODUCT LIST
    |--------------------------------------------------------------------------
    */

    public function adminIndex(Request $request): JsonResponse
    {
        $query = Product::with('category')
            ->latest();

        // Search
        if ($request->filled('search')) {
            $search = trim($request->search);

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Status filter
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            }

            if ($request->status === 'inactive') {
                $query->where('is_active', false);
            }

            if ($request->status === 'featured') {
                $query->where('is_featured', true);
            }
            if ($request->has('is_new_arrival')) {
          $query->where(
                'is_new_arrival',
                $request->boolean('is_new_arrival')
            );
        }
        }

        $products = $query->paginate(
            $request->integer('per_page', 12)
        );

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | ADMIN - CREATE PRODUCT
    |--------------------------------------------------------------------------
    */

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],

            'name' => ['required', 'string', 'max:255'],

            'slug' => [
                'nullable',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'compare_price' => [
                'nullable',
                'numeric',
                'min:0',
            ],
            'gst_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],

            'sku' => [
                'nullable',
                'string',
                'max:100',
            ],

            'stock' => [
                'required',
                'integer',
                'min:0',
            ],

            'image' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'images.*' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
            'remove_images' => [
                    'nullable',
                    'array',
                ],

                'remove_images.*' => [
                    'nullable',
                    'string',
                ],

            'sizes' => [
                'nullable',
                'array',
            ],

            'sizes.*' => [
                'nullable',
                'string',
                'max:50',
            ],

            'colors' => [
                'nullable',
                'array',
            ],

            'colors.*' => [
                'nullable',
                'string',
                'max:50',
            ],

            'is_active' => [
                'nullable',
                'boolean',
            ],

            'is_featured' => [
                'nullable',
                'boolean',
            ],
            'is_new_arrival' => ['nullable', 'boolean'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Generate unique slug
        |--------------------------------------------------------------------------
        */

        $slug = $validated['slug'] ?? Str::slug($validated['name']);

        $originalSlug = $slug;
        $counter = 1;

        while (
            Product::where('slug', $slug)->exists()
        ) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        /*
        |--------------------------------------------------------------------------
        | Main image
        |--------------------------------------------------------------------------
        */

        $mainImage = null;

        if ($request->hasFile('image')) {
            $mainImage = $request
                ->file('image')
                ->store('products', 'public');
        }

        /*
        |--------------------------------------------------------------------------
        | Additional images
        |--------------------------------------------------------------------------
        */

        $additionalImages = [];

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $additionalImages[] = $image->store(
                    'products',
                    'public'
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Create product
        |--------------------------------------------------------------------------
        */

        $product = Product::create([
            'category_id' => $validated['category_id'] ?? null,

            'name' => $validated['name'],

            'slug' => $slug,

            'description' => $validated['description'] ?? null,

            'price' => $validated['price'],

            'compare_price' =>
                $validated['compare_price'] ?? null,
                'gst_rate' => $request->input('gst_rate', 0),

            'sku' => $validated['sku'] ?? null,

            'stock' => $validated['stock'],

            'image' => $mainImage,

            'images' => $additionalImages,

            'sizes' => $validated['sizes'] ?? [],

            'colors' => $validated['colors'] ?? [],

            'is_active' =>
                $request->boolean('is_active', true),

            'is_featured' =>
                $request->boolean('is_featured', false),

                'is_new_arrival' =>
                 $request->boolean('is_new_arrival', false),
        ]);

        $product->load('category');

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully.',
            'data' => $product,
        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | ADMIN - SHOW PRODUCT
    |--------------------------------------------------------------------------
    */

    public function adminShow(int $id): JsonResponse
    {
        $product = Product::with('category')
            ->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | ADMIN - UPDATE PRODUCT
    |--------------------------------------------------------------------------
    */

    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
            ], 404);
        }

        $validated = $request->validate([
            'category_id' => [
                'nullable',
                'integer',
                'exists:categories,id',
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'compare_price' => [
                'nullable',
                'numeric',
                'min:0',
            ],
            'gst_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],

            'sku' => [
                'nullable', 
                'string',
                'max:100',
            ],

            'stock' => [
                'required',
                'integer',
                'min:0',
            ],

            'image' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'images.*' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'sizes' => [
                'nullable',
                'array',
            ],

            'sizes.*' => [
                'nullable',
                'string',
                'max:50',
            ],

            'colors' => [
                'nullable',
                'array',
            ],

            'colors.*' => [
                'nullable',
                'string',
                'max:50',
            ],

            'is_active' => [
                'nullable',
                'boolean',
            ],

            'is_featured' => [
                'nullable',
                'boolean',
            ],
            'is_new_arrival' => ['nullable', 'boolean'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Slug
        |--------------------------------------------------------------------------
        */

        $slug = $validated['slug']
            ?? Str::slug($validated['name']);

        $originalSlug = $slug;
        $counter = 1;

        while (
            Product::where('slug', $slug)
                ->where('id', '!=', $product->id)
                ->exists()
        ) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        /*
        |--------------------------------------------------------------------------
        | Main image
        |--------------------------------------------------------------------------
        */
$mainImage = $product->image;

/*
|--------------------------------------------------------------------------
| Remove existing main image
|--------------------------------------------------------------------------
*/

if ($request->boolean('remove_image')) {

    if (
        $product->image &&
        Storage::disk('public')->exists($product->image)
    ) {
        Storage::disk('public')->delete(
            $product->image
        );
    }

    $mainImage = null;
}

/*
|--------------------------------------------------------------------------
| Upload new main image
|--------------------------------------------------------------------------
*/

if ($request->hasFile('image')) {

    // Delete old image if it still exists
    if (
        $product->image &&
        Storage::disk('public')->exists($product->image)
    ) {
        Storage::disk('public')->delete(
            $product->image
        );
    }

    $mainImage = $request
        ->file('image')
        ->store('products', 'public');
}

        /*
        |--------------------------------------------------------------------------
        | Additional images
        |--------------------------------------------------------------------------
        */
$additionalImages = $product->images ?? [];

/*
|--------------------------------------------------------------------------
| Remove selected existing images
|--------------------------------------------------------------------------
*/

$removeImages = $request->input('remove_images', []);

if (is_array($removeImages) && count($removeImages) > 0) {

    foreach ($removeImages as $removeImage) {

        if (
            in_array($removeImage, $additionalImages, true)
        ) {
            if (
                Storage::disk('public')->exists($removeImage)
            ) {
                Storage::disk('public')->delete($removeImage);
            }

            $additionalImages = array_values(
                array_diff(
                    $additionalImages,
                    [$removeImage]
                )
            );
        }
    }
}

/*
|--------------------------------------------------------------------------
| Add new images
|--------------------------------------------------------------------------
*/

if ($request->hasFile('images')) {

    foreach ($request->file('images') as $image) {

        $additionalImages[] = $image->store(
            'products',
            'public'
        );
    }
}
     

        /*
        |--------------------------------------------------------------------------
        | Update
        |--------------------------------------------------------------------------
        */

        $product->update([
            'category_id' =>
                $validated['category_id'] ?? null,

            'name' =>
                $validated['name'],

            'slug' =>
                $slug,

            'description' =>
                $validated['description'] ?? null,

            'price' =>
                $validated['price'],

            'compare_price' =>
                $validated['compare_price'] ?? null,
                'gst_rate' => $request->input('gst_rate', 0),

            'sku' =>
                $validated['sku'] ?? null,

            'stock' =>
                $validated['stock'],

            'image' =>
                $mainImage,

            'images' =>
                $additionalImages,

            'sizes' =>
                $validated['sizes'] ?? [],

            'colors' =>
                $validated['colors'] ?? [],

            'is_active' =>
                $request->boolean('is_active'),

            'is_featured' =>
                $request->boolean('is_featured'),
                'is_new_arrival' =>
                      $request->boolean('is_new_arrival'),
        ]);

        $product->load('category');

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully.',
            'data' => $product,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | ADMIN - DELETE PRODUCT
    |--------------------------------------------------------------------------
    */

    public function destroy(int $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
            ], 404);
        }

        /*
        | Delete main image
        */

        if (
            $product->image &&
            Storage::disk('public')->exists($product->image)
        ) {
            Storage::disk('public')->delete(
                $product->image
            );
        }

        /*
        | Delete additional images
        */

        if (is_array($product->images)) {

            foreach ($product->images as $image) {

                if (
                    $image &&
                    Storage::disk('public')->exists($image)
                ) {
                    Storage::disk('public')->delete($image);
                }
            }
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully.',
        ]);
    }
}