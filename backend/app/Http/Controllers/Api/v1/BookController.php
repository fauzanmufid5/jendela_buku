<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\v1\BookResource;
use App\Models\Book;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BookController extends Controller
{
    /**
     * Display a listing of books with filtering, searching, and sorting.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Book::query()->active()->with('category');

        // Filter by category slug
        if ($categorySlug = $request->query('category')) {
            $category = Category::where('slug', $categorySlug)->with('children')->first();

            if ($category) {
                $categoryIds = array_merge([$category->id], $category->children->pluck('id')->all());
                $query->whereIn('category_id', $categoryIds);
            }
        }

        // Full-text / LIKE search by title, author, or ISBN
        if ($searchTerm = $request->query('q')) {
            $query->search($searchTerm);
        }

        // Filter by format (paperback, hardcover, ebook)
        if ($format = $request->query('format')) {
            $query->where('format', $format);
        }

        // Filter by price range
        if ($minPrice = $request->query('min_price')) {
            $query->whereRaw('COALESCE(sale_price, regular_price) >= ?', [(float) $minPrice]);
        }
        if ($maxPrice = $request->query('max_price')) {
            $query->whereRaw('COALESCE(sale_price, regular_price) <= ?', [(float) $maxPrice]);
        }

        // Filter best seller only
        if ($request->boolean('best_seller_only')) {
            $query->where('is_best_seller', true);
        }

        // Sorting
        $sort = $request->query('sort', 'newest');
        match ($sort) {
            'bestseller' => $query->orderByDesc('is_best_seller')->latest('id'),
            'price_asc' => $query->orderByRaw('COALESCE(sale_price, regular_price) ASC'),
            'price_desc' => $query->orderByRaw('COALESCE(sale_price, regular_price) DESC'),
            'oldest' => $query->oldest('id'),
            default => $query->latest('id'),
        };

        $limit = max(1, min(50, (int) $request->query('limit', 12)));
        $books = $query->paginate($limit);

        return BookResource::collection($books);
    }

    /**
     * Display the specified book with related books.
     */
    public function show(string $slug): JsonResponse
    {
        $book = Book::where('slug', $slug)->active()->with('category')->first();

        if (! $book) {
            return response()->json([
                'success' => false,
                'message' => 'Buku tidak ditemukan atau sedang tidak aktif.',
            ], 404);
        }

        // Fetch related books from the same category
        $relatedBooks = Book::where('category_id', $book->category_id)
            ->where('id', '!=', $book->id)
            ->active()
            ->with('category')
            ->limit(4)
            ->get();

        return response()->json([
            'success' => true,
            'data' => new BookResource($book),
            'related_books' => BookResource::collection($relatedBooks),
        ]);
    }
}
