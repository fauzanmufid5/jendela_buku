<?php

namespace Tests\Feature;

use App\Models\Book;
use Tests\TestCase;

class CatalogApiTest extends TestCase
{
    public function test_categories_api_returns_hierarchical_data(): void
    {
        $response = $this->getJson('/api/v1/categories');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'parent_id',
                        'children',
                        'books_count',
                    ],
                ],
            ]);
    }

    public function test_books_api_returns_paginated_list_with_metadata(): void
    {
        $response = $this->getJson('/api/v1/books?limit=6');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'slug',
                        'author',
                        'regular_price',
                        'final_price',
                        'discount_percentage',
                        'cover_image_url',
                        'is_best_seller',
                    ],
                ],
                'links',
                'meta' => [
                    'current_page',
                    'per_page',
                    'total',
                ],
            ]);

        $this->assertLessThanOrEqual(6, count($response->json('data')));
    }

    public function test_books_search_by_keyword(): void
    {
        $response = $this->getJson('/api/v1/books?q=Python');

        $response->assertStatus(200);
        $books = $response->json('data');

        $this->assertNotEmpty($books);
        $this->assertStringContainsStringIgnoringCase('Python', $books[0]['title']);
    }

    public function test_single_book_detail_and_related_books(): void
    {
        $book = Book::where('is_active', true)->first();
        $this->assertNotNull($book);

        $response = $this->getJson("/api/v1/books/{$book->slug}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'title',
                    'slug',
                    'isbn',
                    'pages',
                    'dimensions',
                    'description',
                    'table_of_contents',
                ],
                'related_books',
            ]);

        $this->assertEquals($book->id, $response->json('data.id'));
    }
}
