<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'guest_info' => ['nullable', 'array'],
            'guest_info.name' => ['required_without:user_id', 'string', 'max:150'],
            'guest_info.email' => ['required_without:user_id', 'email', 'max:255'],
            'guest_info.phone' => ['required_without:user_id', 'string', 'max:25'],

            'address' => ['required', 'array'],
            'address.recipient_name' => ['required', 'string', 'max:120'],
            'address.phone' => ['required', 'string', 'max:25'],
            'address.street_address' => ['required', 'string'],
            'address.province_id' => ['required', 'string', 'max:10'],
            'address.city_id' => ['required', 'string', 'max:10'],
            'address.district_id' => ['required', 'string', 'max:10'],
            'address.postal_code' => ['required', 'string', 'max:10'],

            'courier' => ['required', 'array'],
            'courier.code' => ['required', 'string', 'max:50'],
            'courier.service' => ['required', 'string', 'max:50'],
            'courier.cost' => ['required', 'numeric', 'min:0'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.book_id' => ['required', 'integer', 'exists:books,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
        ];
    }
}
