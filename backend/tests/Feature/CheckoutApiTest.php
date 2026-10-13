<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutApiTest extends TestCase
{
    public function test_can_fetch_shipping_destinations(): void
    {
        $response = $this->getJson('/api/v1/shipping/destinations');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'province_id',
                        'province_name',
                        'cities' => [
                            '*' => [
                                'city_id',
                                'city_name',
                                'district_id',
                                'district_name',
                                'postal_code',
                            ],
                        ],
                    ],
                ],
            ]);
    }

    public function test_can_calculate_shipping_rates(): void
    {
        $response = $this->postJson('/api/v1/shipping/calculate', [
            'destination_district_id' => '317101', // Jakarta Selatan
            'total_weight_grams' => 650,
            'courier' => ['jne', 'sicepat'],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'data' => [
                    'origin',
                    'destination_district_id',
                    'total_weight_grams',
                    'weight_kg',
                    'rates' => [
                        '*' => [
                            'courier',
                            'courier_name',
                            'service',
                            'service_name',
                            'cost',
                            'etd',
                            'weight_kg',
                        ],
                    ],
                ],
            ]);
    }

    public function test_can_process_checkout_and_create_order(): void
    {
        $book = Book::where('stock', '>=', 5)->first();
        $this->assertNotNull($book, 'Seeded book must exist');

        $initialStock = $book->stock;
        $expectedBookPrice = (float) ($book->sale_price ?? $book->regular_price);
        $qty = 2;
        $expectedTotalBooksPrice = $expectedBookPrice * $qty;

        $checkoutPayload = [
            'guest_info' => [
                'name' => 'Budi Pembeli',
                'email' => 'budi@example.com',
                'phone' => '081298765432',
            ],
            'address' => [
                'recipient_name' => 'Budi Pembeli',
                'phone' => '081298765432',
                'street_address' => 'Jl. Salemba Raya No. 10',
                'province_id' => '31',
                'city_id' => '3171',
                'district_id' => '317101',
                'postal_code' => '10430',
            ],
            'courier' => [
                'code' => 'jne',
                'service' => 'REG',
                'cost' => 15000,
            ],
            'items' => [
                [
                    'book_id' => $book->id,
                    'qty' => 2,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/checkout', $checkoutPayload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_books_price' => $expectedTotalBooksPrice,
                    'shipping_cost' => 15000,
                    'grand_total' => $expectedTotalBooksPrice + 15000,
                    'status' => 'pending',
                    'payment_status' => 'unpaid',
                ],
            ]);

        $orderNumber = $response->json('data.order_number');
        $this->assertNotEmpty($orderNumber);

        // Fetch Order details
        $detailResponse = $this->getJson("/api/v1/orders/{$orderNumber}");
        $detailResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'order_number' => $orderNumber,
                    'grand_total' => $expectedTotalBooksPrice + 15000,
                ],
            ]);

        // Simulate payment completion
        $payResponse = $this->postJson("/api/v1/orders/{$orderNumber}/simulate-pay");
        $payResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'order_number' => $orderNumber,
                    'status' => 'paid',
                    'payment_status' => 'paid',
                ],
            ]);

        // Verify stock was reduced by 2
        $book->refresh();
        $this->assertEquals($initialStock - 2, $book->stock);
    }
}
