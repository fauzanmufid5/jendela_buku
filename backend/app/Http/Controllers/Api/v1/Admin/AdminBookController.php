<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminBookController extends Controller
{
    /**
     * Display a listing of books with search, filter, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Book::with('category')->latest();

        // Search by title, author, isbn
        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%")
                    ->orWhere('isbn', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // Filter by stock
        if ($stockStatus = $request->input('stock_status')) {
            if ($stockStatus === 'low') {
                $query->where('stock', '<=', 5)->where('stock', '>', 0);
            } elseif ($stockStatus === 'out_of_stock') {
                $query->where('stock', '<=', 0);
            }
        }

        $perPage = (int) $request->input('limit', 15);
        $books = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $books->items(),
            'meta' => [
                'current_page' => $books->currentPage(),
                'last_page' => $books->lastPage(),
                'per_page' => $books->perPage(),
                'total' => $books->total(),
            ],
        ]);
    }

    /**
     * Store a newly created book.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'author' => ['required', 'string', 'max:255'],
            'publisher' => ['required', 'string', 'max:150'],
            'isbn' => ['nullable', 'string', 'max:50'],
            'pages' => ['required', 'integer', 'min:1'],
            'published_year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'dimensions' => ['nullable', 'string', 'max:50'],
            'format' => ['required', 'string', 'in:paperback,hardcover,ebook'],
            'regular_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'weight_grams' => ['required', 'integer', 'min:10'],
            'cover_image_url' => ['required', 'string'],
            'description' => ['required', 'string'],
            'table_of_contents' => ['nullable', 'string'],
            'is_best_seller' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        // Generate unique slug
        $baseSlug = Str::slug($validated['title']);
        $slug = $baseSlug;
        $counter = 1;
        while (Book::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }
        $validated['slug'] = $slug;

        $book = Book::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Buku baru berhasil ditambahkan.',
            'data' => $book->load('category'),
        ], 201);
    }

    /**
     * Display the specified book.
     */
    public function show(int $id): JsonResponse
    {
        $book = Book::with('category')->find($id);

        if (! $book) {
            return response()->json([
                'success' => false,
                'message' => 'Buku tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $book,
        ]);
    }

    /**
     * Update the specified book.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $book = Book::find($id);

        if (! $book) {
            return response()->json([
                'success' => false,
                'message' => 'Buku tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'author' => ['sometimes', 'string', 'max:255'],
            'publisher' => ['sometimes', 'string', 'max:150'],
            'isbn' => ['nullable', 'string', 'max:50'],
            'pages' => ['sometimes', 'integer', 'min:1'],
            'published_year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'dimensions' => ['nullable', 'string', 'max:50'],
            'format' => ['sometimes', 'string', 'in:paperback,hardcover,ebook'],
            'regular_price' => ['sometimes', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['sometimes', 'integer', 'min:0'],
            'weight_grams' => ['sometimes', 'integer', 'min:10'],
            'cover_image_url' => ['sometimes', 'string'],
            'description' => ['sometimes', 'string'],
            'table_of_contents' => ['nullable', 'string'],
            'is_best_seller' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        $book->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data buku berhasil diperbarui.',
            'data' => $book->fresh('category'),
        ]);
    }

    /**
     * Remove the specified book.
     */
    public function destroy(int $id): JsonResponse
    {
        $book = Book::find($id);

        if (! $book) {
            return response()->json([
                'success' => false,
                'message' => 'Buku tidak ditemukan.',
            ], 404);
        }

        $book->delete();

        return response()->json([
            'success' => true,
            'message' => 'Buku berhasil dihapus.',
        ]);
    }
}
