<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Models\Book;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    public function __construct(
        protected MidtransService $midtransService
    ) {}

    /**
     * Process checkout, create order & order items, and generate Midtrans Snap transaction.
     */
    public function store(CheckoutRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // 1. Fetch requested books from DB
        $bookIds = collect($validated['items'])->pluck('book_id')->toArray();
        $books = Book::whereIn('id', $bookIds)->get()->keyBy('id');

        $totalBooksPrice = 0;
        $totalWeightGrams = 0;
        $itemsToCreate = [];

        foreach ($validated['items'] as $item) {
            $book = $books->get($item['book_id']);

            if (! $book) {
                return response()->json([
                    'success' => false,
                    'message' => "Buku dengan ID {$item['book_id']} tidak ditemukan.",
                ], 404);
            }

            if ($book->stock < $item['qty']) {
                return response()->json([
                    'success' => false,
                    'message' => "Stok buku '{$book->title}' tidak mencukupi (Tersisa: {$book->stock}, diminta: {$item['qty']}).",
                ], 422);
            }

            $effectivePrice = (float) ($book->sale_price ?? $book->regular_price);
            $subtotal = $effectivePrice * $item['qty'];

            $totalBooksPrice += $subtotal;
            $totalWeightGrams += ($book->weight_grams ?? 300) * $item['qty'];

            $itemsToCreate[] = [
                'book_id' => $book->id,
                'quantity' => $item['qty'],
                'price_unit' => $effectivePrice,
                'subtotal' => $subtotal,
            ];
        }

        $shippingCost = (float) $validated['courier']['cost'];
        $grandTotal = $totalBooksPrice + $shippingCost;

        // 2. Generate unique order number (e.g. JB-20261013-ABCDE)
        $orderNumber = 'JB-' . date('Ymd') . '-' . strtoupper(Str::random(5));

        // 3. Atomically create Order and OrderItems
        $order = DB::transaction(function () use ($validated, $orderNumber, $totalBooksPrice, $shippingCost, $grandTotal, $itemsToCreate) {
            $guestEmail = $validated['guest_info']['email'] ?? ($validated['address']['email'] ?? null);
            $guestPhone = $validated['guest_info']['phone'] ?? ($validated['address']['phone'] ?? null);

            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => auth('sanctum')->id(),
                'guest_email' => $guestEmail,
                'guest_phone' => $guestPhone,
                'total_books_price' => $totalBooksPrice,
                'shipping_cost' => $shippingCost,
                'grand_total' => $grandTotal,
                'courier_code' => $validated['courier']['code'],
                'courier_service' => $validated['courier']['service'],
                'shipping_address' => $validated['address'],
                'status' => 'pending',
                'payment_status' => 'unpaid',
            ]);

            foreach ($itemsToCreate as $itemData) {
                $order->items()->create($itemData);
            }

            return $order;
        });

        // 4. Generate Midtrans Snap transaction token / redirect URL
        $snapResult = $this->midtransService->createSnapTransaction($order);

        $order->update([
            'payment_payload' => array_merge($order->payment_payload ?? [], [
                'snap_token' => $snapResult['token'],
                'snap_redirect_url' => $snapResult['redirect_url'],
                'snap_mode' => $snapResult['mode'] ?? 'simulation',
            ]),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibuat. Silakan selesaikan pembayaran.',
            'data' => [
                'order_number' => $order->order_number,
                'grand_total' => (float) $order->grand_total,
                'total_books_price' => (float) $order->total_books_price,
                'shipping_cost' => (float) $order->shipping_cost,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'snap_token' => $snapResult['token'],
                'snap_redirect_url' => $snapResult['redirect_url'],
                'created_at' => $order->created_at->toIso8601String(),
            ],
        ], 201);
    }
}
