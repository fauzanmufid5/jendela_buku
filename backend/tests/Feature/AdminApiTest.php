<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\Category;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminApiTest extends TestCase
{
    protected User $adminUser;
    protected User $customerUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::firstOrCreate(
            ['email' => 'admin@jendelabuku.test'],
            [
                'name' => 'Admin Tester',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]
        );

        $this->customerUser = User::firstOrCreate(
            ['email' => 'customer_tester@jendelabuku.test'],
            [
                'name' => 'Customer Tester',
                'password' => Hash::make('password123'),
                'role' => 'customer',
            ]
        );
    }

    public function test_admin_can_login_and_receive_sanctum_token(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@jendelabuku.test',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'email' => 'admin@jendelabuku.test',
                        'role' => 'admin',
                    ],
                ],
            ]);

        $this->assertNotEmpty($response->json('data.token'));
    }

    public function test_customer_is_forbidden_from_admin_endpoints(): void
    {
        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(403);
    }

    public function test_admin_can_access_dashboard_metrics(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'metrics' => [
                        'total_revenue',
                        'total_orders',
                        'pending_orders',
                        'paid_orders',
                        'shipped_orders',
                        'total_books',
                        'low_stock_count',
                    ],
                    'recent_orders',
                    'low_stock_books',
                ],
            ]);
    }

    public function test_admin_can_crud_books(): void
    {
        $category = Category::first();

        // 1. Create Book
        $createResponse = $this->actingAs($this->adminUser)
            ->postJson('/api/v1/admin/books', [
                'title' => 'Buku Baru Riset Informatika',
                'category_id' => $category->id,
                'author' => 'Prof. Dr. Anton',
                'publisher' => 'Deepublish',
                'isbn' => '978-623-02-9999-1',
                'pages' => 320,
                'published_year' => 2026,
                'format' => 'paperback',
                'regular_price' => 125000,
                'sale_price' => 110000,
                'stock' => 25,
                'weight_grams' => 450,
                'cover_image_url' => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
                'description' => 'Deskripsi lengkap buku riset informatika.',
                'is_active' => true,
            ]);

        $createResponse->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'title' => 'Buku Baru Riset Informatika',
                    'author' => 'Prof. Dr. Anton',
                ],
            ]);

        $bookId = $createResponse->json('data.id');

        // 2. Update Book
        $updateResponse = $this->actingAs($this->adminUser)
            ->putJson("/api/v1/admin/books/{$bookId}", [
                'title' => 'Buku Baru Riset Informatika Edisi 2',
                'stock' => 30,
            ]);

        $updateResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'title' => 'Buku Baru Riset Informatika Edisi 2',
                    'stock' => 30,
                ],
            ]);

        // 3. Delete Book
        $deleteResponse = $this->actingAs($this->adminUser)
            ->deleteJson("/api/v1/admin/books/{$bookId}");

        $deleteResponse->assertStatus(200);
    }

    public function test_admin_can_update_order_tracking_and_status(): void
    {
        $order = Order::latest()->first();

        if ($order) {
            $trackingResponse = $this->actingAs($this->adminUser)
                ->patchJson("/api/v1/admin/orders/{$order->id}/tracking", [
                    'tracking_number' => 'JNE-RESI-9876543210',
                ]);

            $trackingResponse->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'data' => [
                        'tracking_number' => 'JNE-RESI-9876543210',
                    ],
                ]);
        } else {
            $this->markTestSkipped('No orders in database to test tracking');
        }
    }
}
