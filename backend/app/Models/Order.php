<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'guest_email',
        'guest_phone',
        'total_books_price',
        'shipping_cost',
        'grand_total',
        'courier_code',
        'courier_service',
        'shipping_address',
        'tracking_number',
        'status',
        'payment_channel',
        'payment_status',
        'payment_payload',
    ];

    protected function casts(): array
    {
        return [
            'shipping_address' => 'array',
            'payment_payload' => 'array',
            'total_books_price' => 'decimal:2',
            'shipping_cost' => 'decimal:2',
            'grand_total' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
