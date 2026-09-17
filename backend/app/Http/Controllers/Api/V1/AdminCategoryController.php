<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminCategoryController extends Controller
{
    /**
     * Get all categories
     */
    public function index(Request $request)
    {
        $query = Category::query()
            ->withCount('products');

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            }

            if ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $categories = $query
            ->latest()
            ->paginate(
                $request->integer('per_page', 15)
            );

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }


    /**
     * Create category
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:255',
                'unique:categories,slug',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'is_active' => [
                'nullable',
                'boolean',
            ],
        ]);

        $slug = $validated['slug'] ?? Str::slug(
            $validated['name']
        );

        if (
            Category::where('slug', $slug)->exists()
        ) {
            $slug .= '-' . Str::lower(
                Str::random(5)
            );
        }

        $category = Category::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' =>
                $validated['description'] ?? null,
            'is_active' =>
                $request->boolean('is_active', true),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully.',
            'data' => $category,
        ], 201);
    }


    /**
     * Get single category
     */
    public function show($id)
    {
        $category = Category::withCount('products')
            ->find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $category,
        ]);
    }


    /**
     * Update category
     */
    public function update(
        Request $request,
        $id
    ) {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:255',
                'unique:categories,slug,' . $category->id,
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'is_active' => [
                'nullable',
                'boolean',
            ],
        ]);

        $slug = $validated['slug'] ?? Str::slug(
            $validated['name']
        );

        $existing = Category::where(
            'slug',
            $slug
        )
            ->where(
                'id',
                '!=',
                $category->id
            )
            ->exists();

        if ($existing) {
            $slug .= '-' . Str::lower(
                Str::random(5)
            );
        }

        $category->update([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' =>
                $validated['description'] ?? null,
            'is_active' =>
                $request->boolean(
                    'is_active',
                    $category->is_active
                ),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully.',
            'data' => $category,
        ]);
    }


    /**
     * Delete category
     */
    public function destroy($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found.',
            ], 404);
        }

        if (
            $category->products()->exists()
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'This category contains products and cannot be deleted.',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' =>
                'Category deleted successfully.',
        ]);
    }
}