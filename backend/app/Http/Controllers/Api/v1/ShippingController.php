<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ShippingCalculateRequest;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    public function __construct(
        protected ShippingService $shippingService
    ) {}

    /**
     * Calculate courier rates based on destination district and weight.
     */
    public function calculate(ShippingCalculateRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $couriers = $validated['courier'] ?? ['jne', 'sicepat', 'jnt', 'pos'];

        $rates = $this->shippingService->calculate(
            $validated['destination_district_id'],
            (int) $validated['total_weight_grams'],
            $couriers
        );

        return response()->json([
            'success' => true,
            'message' => 'Tarif ongkos kirim berhasil dihitung',
            'data' => [
                'origin' => 'DI Yogyakarta (Sleman)',
                'destination_district_id' => $validated['destination_district_id'],
                'total_weight_grams' => (int) $validated['total_weight_grams'],
                'weight_kg' => (int) max(1, ceil($validated['total_weight_grams'] / 1000)),
                'rates' => $rates,
            ],
        ]);
    }

    /**
     * Get list of supported provinces and major cities for checkout selection.
     */
    public function destinations(): JsonResponse
    {
        $destinations = [
            [
                'province_id' => '34',
                'province_name' => 'DI Yogyakarta',
                'cities' => [
                    ['city_id' => '3404', 'city_name' => 'Kab. Sleman', 'district_id' => '340401', 'district_name' => 'Depok', 'postal_code' => '55281'],
                    ['city_id' => '3471', 'city_name' => 'Kota Yogyakarta', 'district_id' => '347101', 'district_name' => 'Gondomanan', 'postal_code' => '55122'],
                    ['city_id' => '3402', 'city_name' => 'Kab. Bantul', 'district_id' => '340201', 'district_name' => 'Sewon', 'postal_code' => '55188'],
                ],
            ],
            [
                'province_id' => '31',
                'province_name' => 'DKI Jakarta',
                'cities' => [
                    ['city_id' => '3171', 'city_name' => 'Kota Jakarta Selatan', 'district_id' => '317101', 'district_name' => 'Kebayoran Baru', 'postal_code' => '12110'],
                    ['city_id' => '3173', 'city_name' => 'Kota Jakarta Pusat', 'district_id' => '317301', 'district_name' => 'Gambir', 'postal_code' => '10110'],
                    ['city_id' => '3174', 'city_name' => 'Kota Jakarta Barat', 'district_id' => '317401', 'district_name' => 'Grogol Petamburan', 'postal_code' => '11450'],
                    ['city_id' => '3175', 'city_name' => 'Kota Jakarta Timur', 'district_id' => '317501', 'district_name' => 'Matraman', 'postal_code' => '13110'],
                ],
            ],
            [
                'province_id' => '32',
                'province_name' => 'Jawa Barat',
                'cities' => [
                    ['city_id' => '3273', 'city_name' => 'Kota Bandung', 'district_id' => '327301', 'district_name' => 'Coblong', 'postal_code' => '40132'],
                    ['city_id' => '3275', 'city_name' => 'Kota Bekasi', 'district_id' => '327501', 'district_name' => 'Bekasi Barat', 'postal_code' => '17145'],
                    ['city_id' => '3276', 'city_name' => 'Kota Depok', 'district_id' => '327601', 'district_name' => 'Beji', 'postal_code' => '16424'],
                    ['city_id' => '3271', 'city_name' => 'Kota Bogor', 'district_id' => '327101', 'district_name' => 'Bogor Tengah', 'postal_code' => '16121'],
                ],
            ],
            [
                'province_id' => '33',
                'province_name' => 'Jawa Tengah',
                'cities' => [
                    ['city_id' => '3374', 'city_name' => 'Kota Semarang', 'district_id' => '337401', 'district_name' => 'Semarang Tengah', 'postal_code' => '50132'],
                    ['city_id' => '3372', 'city_name' => 'Kota Surakarta (Solo)', 'district_id' => '337201', 'district_name' => 'Banjarsari', 'postal_code' => '57139'],
                    ['city_id' => '3302', 'city_name' => 'Kab. Banyumas (Purwokerto)', 'district_id' => '330201', 'district_name' => 'Purwokerto Timur', 'postal_code' => '53111'],
                ],
            ],
            [
                'province_id' => '35',
                'province_name' => 'Jawa Timur',
                'cities' => [
                    ['city_id' => '3578', 'city_name' => 'Kota Surabaya', 'district_id' => '357801', 'district_name' => 'Genteng', 'postal_code' => '60275'],
                    ['city_id' => '3573', 'city_name' => 'Kota Malang', 'district_id' => '357301', 'district_name' => 'Lowokwaru', 'postal_code' => '65141'],
                ],
            ],
            [
                'province_id' => '12',
                'province_name' => 'Sumatera Utara',
                'cities' => [
                    ['city_id' => '1271', 'city_name' => 'Kota Medan', 'district_id' => '127101', 'district_name' => 'Medan Kota', 'postal_code' => '20212'],
                ],
            ],
            [
                'province_id' => '51',
                'province_name' => 'Bali',
                'cities' => [
                    ['city_id' => '5171', 'city_name' => 'Kota Denpasar', 'district_id' => '517101', 'district_name' => 'Denpasar Selatan', 'postal_code' => '80227'],
                ],
            ],
            [
                'province_id' => '73',
                'province_name' => 'Sulawesi Selatan',
                'cities' => [
                    ['city_id' => '7371', 'city_name' => 'Kota Makassar', 'district_id' => '737101', 'district_name' => 'Panakkukang', 'postal_code' => '90231'],
                ],
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $destinations,
        ]);
    }
}
