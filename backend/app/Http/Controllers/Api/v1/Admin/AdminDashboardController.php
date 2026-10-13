<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Order;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    /**
     * Get aggregate metrics, KPIs, recent orders, and inventory warnings.
     */
    public function index(): JsonResponse
    {
        $totalRevenue = (float) Order::whereIn('status', ['paid', 'processing', 'shipped', 'completed'])
            ->sum('grand_total');

        $totalOrders = Order::count();
        $pendingOrders = Order::where('status', 'pending')->count();
        $paidOrders = Order::where('status', 'paid')->count();
        $shippedOrders = Order::where('status', 'shipped')->count();

        $totalBooks = Book::count();
        $activeBooks = Book::where('is_active', true)->count();
        $lowStockCount = Book::where('stock', '<=', 5)->count();

        // 5 Most recent orders
        $recentOrders = Order::latest()
            ->take(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->shipping_address['recipient_name'] ?? $order->guest_email ?? 'Tamu',
                    'grand_total' => (float) $order->grand_total,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'created_at' => $order->created_at->toIso8601String(),
                ];
            });

        // Books with lowest stock
        $lowStockBooks = Book::with('category')
            ->where('stock', '<=', 5)
            ->orderBy('stock', 'asc')
            ->take(5)
            ->get()
            ->map(function ($book) {
                return [
                    'id' => $book->id,
                    'title' => $book->title,
                    'author' => $book->author,
                    'category' => $book->category->name ?? 'Umum',
                    'stock' => $book->stock,
                    'regular_price' => (float) $book->regular_price,
                    'sale_price' => $book->sale_price ? (float) $book->sale_price : null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'metrics' => [
                    'total_revenue' => $totalRevenue,
                    'total_orders' => $totalOrders,
                    'pending_orders' => $pendingOrders,
                    'paid_orders' => $paidOrders,
                    'shipped_orders' => $shippedOrders,
                    'total_books' => $totalBooks,
                    'active_books' => $activeBooks,
                    'low_stock_count' => $lowStockCount,
                ],
                'recent_orders' => $recentOrders,
                'low_stock_books' => $lowStockBooks,
            ],
        ]);
    }
}
