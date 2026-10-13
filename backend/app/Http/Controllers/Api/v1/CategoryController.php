<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\v1\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories (hierarchical tree).
     */
    public function index(): AnonymousResourceCollection
    {
        $categories = Category::whereNull('parent_id')
            ->with(['children' => function ($query) {
                $query->withCount('books');
            }])
            ->withCount('books')
            ->orderBy('name')
            ->get();

        return CategoryResource::collection($categories);
    }

    /**
     * Display the specified category.
     */
    public function show(string $slug): CategoryResource|JsonResponse
    {
        $category = Category::where('slug', $slug)
            ->with(['children', 'parent'])
            ->withCount('books')
            ->first();

        if (! $category) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak ditemukan.',
            ], 404);
        }

        return new CategoryResource($category);
    }
}
