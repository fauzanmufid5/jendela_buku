<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Get order details by order_number.
     */
    public function show(string $orderNumber): JsonResponse
    {
        $order = Order::with(['items.book'])->where('order_number', $orderNumber)->first();

        if (! $order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'order_number' => $order->order_number,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'payment_channel' => $order->payment_channel,
                'tracking_number' => $order->tracking_number,
                'courier_code' => $order->courier_code,
                'courier_service' => $order->courier_service,
                'total_books_price' => (float) $order->total_books_price,
                'shipping_cost' => (float) $order->shipping_cost,
                'grand_total' => (float) $order->grand_total,
                'guest_email' => $order->guest_email,
                'guest_phone' => $order->guest_phone,
                'shipping_address' => $order->shipping_address,
                'payment_payload' => $order->payment_payload,
                'created_at' => $order->created_at->toIso8601String(),
                'items' => $order->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'book_id' => $item->book_id,
                        'title' => $item->book->title ?? 'Buku',
                        'slug' => $item->book->slug ?? '',
                        'cover_image' => $item->book->cover_image_url ?? null,
                        'author' => $item->book->author ?? '',
                        'quantity' => $item->quantity,
                        'price_unit' => (float) $item->price_unit,
                        'subtotal' => (float) $item->subtotal,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Sandbox simulation endpoint to immediately mark order as paid and deduct stock.
     */
    public function simulatePayment(string $orderNumber): JsonResponse
    {
        $order = Order::with('items.book')->where('order_number', $orderNumber)->first();

        if (! $order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        if ($order->payment_status === 'paid') {
            return response()->json([
                'success' => true,
                'message' => 'Pesanan ini sudah berstatus LUNAS.',
                'data' => $order,
            ]);
        }

        DB::transaction(function () use ($order) {
            $order->update([
                'status' => 'paid',
                'payment_status' => 'paid',
                'payment_channel' => 'simulation_sandbox',
            ]);

            // Deduct inventory stock atomically
            foreach ($order->items as $item) {
                if ($item->book) {
                    $item->book->decrement('stock', $item->quantity);
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Simulasi pembayaran sukses! Status pesanan diperbarui menjadi LUNAS.',
            'data' => [
                'order_number' => $order->order_number,
                'status' => 'paid',
                'payment_status' => 'paid',
                'payment_channel' => 'simulation_sandbox',
            ],
        ]);
    }
}
