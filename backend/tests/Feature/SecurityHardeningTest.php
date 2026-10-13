<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\Category;
use App\Models\Order;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class SecurityHardeningTest extends TestCase
{
    public function test_catalog_search_is_safe_against_sql_injection(): void
    {
        // Malicious SQL injection payloads
        $payloads = [
            "' OR '1'='1",
            "'; DROP TABLE books; --",
            "1 UNION SELECT 1,2,3,4,5,6,7,8,9,10--",
        ];

        foreach ($payloads as $payload) {
            $response = $this->getJson('/api/v1/books?q=' . urlencode($payload));
            $response->assertStatus(200)
                ->assertJsonStructure(['data', 'meta']);
        }
    }

    public function test_webhook_rejects_unauthorized_signature(): void
    {
        config(['services.midtrans.server_key' => 'real-secret-key-12345']);

        $response = $this->postJson('/api/v1/webhooks/payment', [
            'order_id' => 'JB-FAKE-ORDER',
            'status_code' => '200',
            'gross_amount' => '100000.00',
            'signature_key' => 'fraudulent_invalid_sha512_hash',
            'transaction_status' => 'settlement',
            'fraud_status' => 'accept',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Invalid signature key',
            ]);
    }

    public function test_webhook_is_idempotent_on_repeated_calls(): void
    {
        $book = Book::where('stock', '>=', 5)->first();
        $this->assertNotNull($book);
        $initialStock = $book->stock;

        $order = Order::create([
            'order_number' => 'JB-IDEMPOTENT-' . uniqid(),
            'total_books_price' => $book->final_price,
            'shipping_cost' => 10000,
            'grand_total' => $book->final_price + 10000,
            'courier_code' => 'jne',
            'courier_service' => 'REG',
            'shipping_address' => ['recipient_name' => 'Test Idempotency'],
            'status' => 'pending',
            'payment_status' => 'unpaid',
        ]);

        $order->items()->create([
            'book_id' => $book->id,
            'quantity' => 1,
            'price_unit' => $book->final_price,
            'subtotal' => $book->final_price,
        ]);

        $webhookPayload = [
            'order_id' => $order->order_number,
            'status_code' => '200',
            'gross_amount' => (string) $order->grand_total,
            'signature_key' => 'sim_valid_signature',
            'transaction_status' => 'settlement',
            'fraud_status' => 'accept',
            'payment_type' => 'qris',
        ];

        // 1st Webhook Call -> Should succeed and mark as PAID
        $firstCall = $this->postJson('/api/v1/webhooks/payment', $webhookPayload);
        $firstCall->assertStatus(200);

        $book->refresh();
        $this->assertEquals($initialStock - 1, $book->stock);

        // 2nd Duplicate Webhook Call -> Must not decrement stock again!
        $secondCall = $this->postJson('/api/v1/webhooks/payment', $webhookPayload);
        $secondCall->assertStatus(200);

        $book->refresh();
        $this->assertEquals($initialStock - 1, $book->stock); // Still exactly -1, not -2!
    }

    public function test_checkout_rate_limiter_blocks_excessive_spam_requests(): void
    {
        RateLimiter::clear('checkout:' . '127.0.0.1');

        $category = Category::first();
        $book = Book::where('stock', '>', 0)->first();

        $validPayload = [
            'guest_info' => [
                'name' => 'Tester Limiter',
                'email' => 'tester@example.com',
                'phone' => '081234567890',
            ],
            'address' => [
                'recipient_name' => 'Tester Limiter',
                'phone' => '081234567890',
                'street_address' => 'Jl. Test No. 1',
                'province_id' => '31',
                'city_id' => '3171',
                'district_id' => '317101',
                'postal_code' => '12110',
            ],
            'courier' => [
                'code' => 'jne',
                'service' => 'REG',
                'cost' => 15000,
            ],
            'items' => [
                ['book_id' => $book->id, 'qty' => 1],
            ],
        ];

        // Hit checkout 10 times (perMinute limit is 10)
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/v1/checkout', $validPayload);
        }

        // 11th request should be throttled
        $throttledResponse = $this->postJson('/api/v1/checkout', $validPayload);

        $throttledResponse->assertStatus(429);
    }
}
