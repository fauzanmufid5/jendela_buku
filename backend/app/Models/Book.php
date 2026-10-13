<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'title',
        'slug',
        'author',
        'publisher',
        'isbn',
        'pages',
        'published_year',
        'dimensions',
        'format',
        'regular_price',
        'sale_price',
        'stock',
        'weight_grams',
        'cover_image_url',
        'description',
        'table_of_contents',
        'is_best_seller',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'regular_price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'stock' => 'integer',
            'weight_grams' => 'integer',
            'pages' => 'integer',
            'published_year' => 'integer',
            'is_best_seller' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    protected $appends = [
        'discount_percentage',
        'final_price',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getDiscountPercentageAttribute(): int
    {
        if ($this->sale_price && $this->regular_price > 0 && $this->sale_price < $this->regular_price) {
            return (int) round((($this->regular_price - $this->sale_price) / $this->regular_price) * 100);
        }

        return 0;
    }

    public function getFinalPriceAttribute(): float
    {
        return (float) ($this->sale_price ?? $this->regular_price);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeBestSeller(Builder $query): Builder
    {
        return $query->where('is_best_seller', true);
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (empty($term)) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($term) {
            $q->where('title', 'LIKE', "%{$term}%")
              ->orWhere('author', 'LIKE', "%{$term}%")
              ->orWhere('isbn', 'LIKE', "%{$term}%");
        });
    }
}
