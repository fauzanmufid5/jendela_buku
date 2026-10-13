<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    /**
     * Test the API v1 health endpoint.
     */
    public function test_health_endpoint_returns_ok_and_database_counts(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'app_name',
                'version',
                'database' => [
                    'status',
                    'categories_count',
                    'books_count',
                ],
                'timestamp',
            ]);

        $this->assertEquals('ok', $response->json('status'));
        $this->assertEquals('connected', $response->json('database.status'));
        $this->assertGreaterThan(0, $response->json('database.books_count'));
    }
}
