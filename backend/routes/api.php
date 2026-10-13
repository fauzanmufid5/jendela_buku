<?php

use App\Http\Controllers\Api\v1\BookController;
use App\Http\Controllers\Api\v1\CategoryController;
use App\Models\Book;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Health check & System Stats endpoint
    Route::get('/health', function () {
        try {
            DB::connection()->getPdo();
            $dbStatus = 'connected';
        } catch (\Exception $e) {
            $dbStatus = 'disconnected: ' . $e->getMessage();
        }

        return response()->json([
            'status' => 'ok',
            'app_name' => config('app.name'),
            'version' => '1.0.0 (Laravel 11)',
            'database' => [
                'status' => $dbStatus,
                'categories_count' => Category::count(),
                'books_count' => Book::count(),
            ],
            'timestamp' => now()->toIso8601String(),
        ]);
    });

    // Public Catalog Endpoints
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);

    Route::get('/books', [BookController::class, 'index']);
    Route::get('/books/{slug}', [BookController::class, 'show']);

    // Shipping Endpoints
    Route::get('/shipping/destinations', [\App\Http\Controllers\Api\v1\ShippingController::class, 'destinations']);
    Route::post('/shipping/calculate', [\App\Http\Controllers\Api\v1\ShippingController::class, 'calculate']);

    // Checkout & Order Endpoints
    Route::post('/checkout', [\App\Http\Controllers\Api\v1\CheckoutController::class, 'store'])->middleware('throttle:checkout');
    Route::get('/orders/{orderNumber}', [\App\Http\Controllers\Api\v1\OrderController::class, 'show']);
    Route::post('/orders/{orderNumber}/simulate-pay', [\App\Http\Controllers\Api\v1\OrderController::class, 'simulatePayment']);

    // Payment Gateway Webhook
    Route::post('/webhooks/payment', [\App\Http\Controllers\Api\v1\PaymentWebhookController::class, 'handle'])->middleware('throttle:webhook');

    // Authentication Endpoints
    Route::post('/auth/login', [\App\Http\Controllers\Api\v1\AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [\App\Http\Controllers\Api\v1\AuthController::class, 'me']);
        Route::post('/auth/logout', [\App\Http\Controllers\Api\v1\AuthController::class, 'logout']);

        // Authenticated user shortcut
        Route::get('/user', function (Request $request) {
            return response()->json([
                'success' => true,
                'data' => $request->user(),
            ]);
        });

        // Protected Admin Endpoints
        Route::middleware('admin')->prefix('admin')->group(function () {
            Route::get('/dashboard', [\App\Http\Controllers\Api\v1\Admin\AdminDashboardController::class, 'index']);

            // Books Management
            Route::get('/books', [\App\Http\Controllers\Api\v1\Admin\AdminBookController::class, 'index']);
            Route::post('/books', [\App\Http\Controllers\Api\v1\Admin\AdminBookController::class, 'store']);
            Route::get('/books/{id}', [\App\Http\Controllers\Api\v1\Admin\AdminBookController::class, 'show']);
            Route::put('/books/{id}', [\App\Http\Controllers\Api\v1\Admin\AdminBookController::class, 'update']);
            Route::delete('/books/{id}', [\App\Http\Controllers\Api\v1\Admin\AdminBookController::class, 'destroy']);

            // Orders Management
            Route::get('/orders', [\App\Http\Controllers\Api\v1\Admin\AdminOrderController::class, 'index']);
            Route::get('/orders/{id}', [\App\Http\Controllers\Api\v1\Admin\AdminOrderController::class, 'show']);
            Route::patch('/orders/{id}/status', [\App\Http\Controllers\Api\v1\Admin\AdminOrderController::class, 'updateStatus']);
            Route::patch('/orders/{id}/tracking', [\App\Http\Controllers\Api\v1\Admin\AdminOrderController::class, 'updateTracking']);
        });
    });
});
