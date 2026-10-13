<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
    public function __construct(
        protected MidtransService $midtransService
    ) {}

    /**
     * Handle incoming payment notifications from Midtrans.
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();
        $orderId = $request->input('order_id');
        $statusCode = (string) $request->input('status_code');
        $grossAmount = (string) $request->input('gross_amount');
        $signatureKey = (string) $request->input('signature_key');
        $transactionStatus = (string) $request->input('transaction_status');
        $fraudStatus = (string) $request->input('fraud_status');
        $paymentType = (string) $request->input('payment_type');

        if (! $orderId) {
            return response()->json(['message' => 'Missing order_id'], 400);
        }

        // Verify SHA-512 Signature
        if (! $this->midtransService->verifySignature($orderId, $statusCode, $grossAmount, $signatureKey)) {
            Log::warning("Midtrans Webhook: Invalid signature for Order {$orderId}");
            return response()->json(['message' => 'Invalid signature key'], 403);
        }

        // Idempotent lock to prevent race conditions
        $lock = Cache::lock("webhook_order_{$orderId}", 10);

        if (! $lock->get()) {
            return response()->json(['message' => 'Order is currently processing'], 429);
        }

        try {
            $order = Order::with('items.book')->where('order_number', $orderId)->first();

            if (! $order) {
                Log::error("Midtrans Webhook: Order not found {$orderId}");
                return response()->json(['message' => 'Order not found'], 404);
            }

            DB::transaction(function () use ($order, $transactionStatus, $fraudStatus, $paymentType, $payload) {
                $isPaid = false;
                $isCancelled = false;

                if (in_array($transactionStatus, ['capture', 'settlement'])) {
                    if ($transactionStatus === 'capture') {
                        if ($fraudStatus === 'accept') {
                            $isPaid = true;
                        }
                    } else {
                        $isPaid = true;
                    }
                } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                    $isCancelled = true;
                }

                if ($isPaid && $order->payment_status !== 'paid') {
                    $order->update([
                        'status' => 'paid',
                        'payment_status' => 'paid',
                        'payment_channel' => $paymentType,
                        'payment_payload' => $payload,
                    ]);

                    // Atomically decrement stock
                    foreach ($order->items as $item) {
                        if ($item->book) {
                            $item->book->decrement('stock', $item->quantity);
                        }
                    }

                    Log::info("Order {$order->order_number} marked as PAID via {$paymentType}");
                } elseif ($isCancelled && $order->payment_status !== 'paid') {
                    $order->update([
                        'status' => 'cancelled',
                        'payment_status' => $transactionStatus === 'expire' ? 'expired' : 'failed',
                        'payment_channel' => $paymentType,
                        'payment_payload' => $payload,
                    ]);

                    Log::info("Order {$order->order_number} marked as {$order->status}");
                }
            });

            return response()->json([
                'status' => 'ok',
                'message' => 'Notification processed successfully',
            ]);
        } catch (\Exception $e) {
            Log::error("Webhook error for {$orderId}: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        } finally {
            $lock->release();
        }
    }
}
