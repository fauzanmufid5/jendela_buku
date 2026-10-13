<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ShippingCalculateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'destination_district_id' => ['required', 'string'],
            'total_weight_grams' => ['required', 'integer', 'min:1'],
            'courier' => ['nullable', 'array'],
            'courier.*' => ['string', 'in:jne,sicepat,jnt,pos'],
        ];
    }
}
