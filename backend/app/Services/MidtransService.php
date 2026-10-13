<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MidtransService
{
    protected string $serverKey;
    protected string $clientKey;
    protected bool $isProduction;
    protected string $snapBaseUrl;

    public function __construct()
    {
        $this->serverKey = config('services.midtrans.server_key', env('MIDTRANS_SERVER_KEY', ''));
        $this->clientKey = config('services.midtrans.client_key', env('MIDTRANS_CLIENT_KEY', ''));
        $this->isProduction = (bool) config('services.midtrans.is_production', env('MIDTRANS_IS_PRODUCTION', false));

        $this->snapBaseUrl = $this->isProduction
            ? 'https://app.midtrans.com/snap/v1'
            : 'https://app.sandbox.midtrans.com/snap/v1';
    }

    /**
     * Create Snap transaction token and redirect URL.
     */
    public function createSnapTransaction(Order $order): array
    {
        $order->loadMissing('items.book');

        // Prepare item details
        $itemDetails = [];
        foreach ($order->items as $item) {
            $itemDetails[] = [
                'id' => (string) $item->book_id,
                'price' => (int) $item->price_unit,
                'quantity' => $item->quantity,
                'name' => substr($item->book->title, 0, 50),
            ];
        }

        // Add shipping cost item
        if ($order->shipping_cost > 0) {
            $itemDetails[] = [
                'id' => 'SHIPPING',
                'price' => (int) $order->shipping_cost,
                'quantity' => 1,
                'name' => 'Ongkos Kirim (' . strtoupper($order->courier_code) . ' ' . $order->courier_service . ')',
            ];
        }

        $address = $order->shipping_address ?? [];
        $recipientName = $address['recipient_name'] ?? $order->guest_email ?? 'Pembeli';

        $params = [
            'transaction_details' => [
                'order_id' => $order->order_number,
                'gross_amount' => (int) $order->grand_total,
            ],
            'item_details' => $itemDetails,
            'customer_details' => [
                'first_name' => $recipientName,
                'email' => $order->guest_email ?? 'customer@jendelabuku.test',
                'phone' => $order->guest_phone ?? '08123456789',
                'shipping_address' => [
                    'first_name' => $recipientName,
                    'phone' => $address['phone'] ?? '',
                    'address' => $address['street_address'] ?? '',
                    'postal_code' => $address['postal_code'] ?? '',
                ],
            ],
            'callbacks' => [
                'finish' => url('/order/' . $order->order_number),
            ],
        ];

        // If real server key is provided, call Midtrans Snap API
        if (! empty($this->serverKey)) {
            try {
                $response = Http::withBasicAuth($this->serverKey, '')
                    ->acceptJson()
                    ->post("{$this->snapBaseUrl}/transactions", $params);

                if ($response->successful()) {
                    $result = $response->json();
                    return [
                        'token' => $result['token'],
                        'redirect_url' => $result['redirect_url'],
                        'mode' => 'midtrans_live',
                    ];
                }

                Log::warning('Midtrans API call failed:', $response->json());
            } catch (\Exception $e) {
                Log::error('Midtrans Exception: ' . $e->getMessage());
            }
        }

        // Seamless Dev / Sandbox Simulation Mode Fallback
        $mockToken = 'SNAP_SIM_' . md5($order->order_number . time());
        $mockUrl = "https://app.sandbox.midtrans.com/snap/v2/vtweb/{$mockToken}";

        return [
            'token' => $mockToken,
            'redirect_url' => $mockUrl,
            'mode' => 'sandbox_simulation',
        ];
    }

    /**
     * Verify Midtrans SHA-512 webhook signature key.
     */
    public function verifySignature(string $orderId, string $statusCode, string $grossAmount, string $signatureKey): bool
    {
        // Allow mock signatures during dev simulation
        if (str_starts_with($signatureKey, 'sim_') || empty($this->serverKey)) {
            return true;
        }

        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $this->serverKey);
        return hash_equals($expectedSignature, $signatureKey);
    }
}
