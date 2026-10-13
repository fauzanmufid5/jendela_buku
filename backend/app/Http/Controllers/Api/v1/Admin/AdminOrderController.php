<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    /**
     * Display a listing of orders with filters and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with('items')->latest();

        // Search by order number, customer email, or recipient name
        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('guest_email', 'like', "%{$search}%")
                    ->orWhere('shipping_address->recipient_name', 'like', "%{$search}%")
                    ->orWhere('shipping_address->phone', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        $perPage = (int) $request->input('limit', 15);
        $orders = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Display the specified order.
     */
    public function show(int $id): JsonResponse
    {
        $order = Order::with('items.book')->find($id);

        if (! $order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $order = Order::find($id);

        if (! $order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,paid,processing,shipped,completed,cancelled'],
        ]);

        $order->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'message' => "Status pesanan #{$order->order_number} berhasil diperbarui menjadi {$validated['status']}.",
            'data' => $order,
        ]);
    }

    /**
     * Update courier shipping tracking number (resi) and mark as shipped.
     */
    public function updateTracking(Request $request, int $id): JsonResponse
    {
        $order = Order::find($id);

        if (! $order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'tracking_number' => ['required', 'string', 'max:100'],
            'courier_code' => ['nullable', 'string', 'max:50'],
        ]);

        $updates = [
            'tracking_number' => $validated['tracking_number'],
        ];

        if (! empty($validated['courier_code'])) {
            $updates['courier_code'] = $validated['courier_code'];
        }

        // If order was paid or processing, transition to shipped
        if (in_array($order->status, ['paid', 'processing'])) {
            $updates['status'] = 'shipped';
        }

        $order->update($updates);

        return response()->json([
            'success' => true,
            'message' => "Nomor resi untuk pesanan #{$order->order_number} berhasil disimpan.",
            'data' => $order,
        ]);
    }
}
