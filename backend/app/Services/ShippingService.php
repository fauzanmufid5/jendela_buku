<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class ShippingService
{
    /**
     * Calculate courier rates based on destination and weight.
     *
     * @param string $districtId
     * @param int $totalWeightGrams
     * @param array $requestedCouriers
     * @return array
     */
    public function calculate(string $districtId, int $totalWeightGrams, array $requestedCouriers = ['jne', 'sicepat', 'jnt', 'pos']): array
    {
        // Minimum weight 1000g (1 kg), rounded up to next kg if > 1000g (with 300g tolerance e.g. 1.3kg = 1kg)
        $weightInKg = (int) max(1, ceil($totalWeightGrams / 1000));
        $cacheKey = "shipping:origin_jogja:dest_{$districtId}:kg_{$weightInKg}";

        return Cache::remember($cacheKey, 86400, function () use ($districtId, $weightInKg, $requestedCouriers) {
            $rates = [];
            $baseMultiplier = $this->determineZoneMultiplier($districtId);

            $availableServices = [
                'jne' => [
                    [
                        'courier' => 'jne',
                        'courier_name' => 'JNE Express',
                        'service' => 'REG',
                        'service_name' => 'Layanan Reguler',
                        'base_rate' => 15000,
                        'etd' => '2-3 Hari',
                    ],
                    [
                        'courier' => 'jne',
                        'courier_name' => 'JNE Express',
                        'service' => 'YES',
                        'service_name' => 'Yakin Esok Sampai',
                        'base_rate' => 28000,
                        'etd' => '1 Hari',
                    ],
                ],
                'sicepat' => [
                    [
                        'courier' => 'sicepat',
                        'courier_name' => 'SiCepat Ekspres',
                        'service' => 'SIUNT',
                        'service_name' => 'SiUntung Cepat',
                        'base_rate' => 14000,
                        'etd' => '1-2 Hari',
                    ],
                    [
                        'courier' => 'sicepat',
                        'courier_name' => 'SiCepat Ekspres',
                        'service' => 'BEST',
                        'service_name' => 'Besok Sampai Tujuan',
                        'base_rate' => 26000,
                        'etd' => '1 Hari',
                    ],
                ],
                'jnt' => [
                    [
                        'courier' => 'jnt',
                        'courier_name' => 'J&T Express',
                        'service' => 'EZ',
                        'service_name' => 'Layanan Reguler',
                        'base_rate' => 16000,
                        'etd' => '2-3 Hari',
                    ],
                ],
                'pos' => [
                    [
                        'courier' => 'pos',
                        'courier_name' => 'Pos Indonesia',
                        'service' => 'KILAT',
                        'service_name' => 'Pos Kilat Khusus',
                        'base_rate' => 13000,
                        'etd' => '2-4 Hari',
                    ],
                ],
            ];

            foreach ($requestedCouriers as $courierCode) {
                $code = strtolower($courierCode);
                if (isset($availableServices[$code])) {
                    foreach ($availableServices[$code] as $service) {
                        $cost = (int) ($service['base_rate'] * $baseMultiplier * $weightInKg);
                        $rates[] = [
                            'courier' => $service['courier'],
                            'courier_name' => $service['courier_name'],
                            'service' => $service['service'],
                            'service_name' => $service['service_name'],
                            'cost' => $cost,
                            'etd' => $service['etd'],
                            'weight_kg' => $weightInKg,
                        ];
                    }
                }
            }

            return $rates;
        });
    }

    /**
     * Determine shipping price multiplier based on province/district prefix.
     */
    private function determineZoneMultiplier(string $districtId): float
    {
        // 31: DKI Jakarta, 32: Jawa Barat, 33: Jawa Tengah, 34: DI Yogyakarta, 35: Jawa Timur
        $prefix = substr($districtId, 0, 2);

        return match ($prefix) {
            '34' => 0.8, // DIY (Lokal Asal Gudang)
            '33' => 0.9, // Jawa Tengah
            '31', '32', '35', '36' => 1.0, // Jabodetabek, Jabar, Jatim, Banten
            '11', '12', '13', '14', '15', '16', '17', '18', '19', '21' => 1.8, // Sumatera
            '61', '62', '63', '64', '65' => 2.2, // Kalimantan
            '71', '72', '73', '74', '75', '76' => 2.4, // Sulawesi
            '51', '52', '53' => 1.5, // Bali & Nusa Tenggara
            '81', '82', '91', '92', '93', '94', '95', '96' => 3.5, // Maluku & Papua
            default => 1.2,
        };
    }
}
