<?php

namespace App\Http\Resources\Api\v1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'author' => $this->author,
            'publisher' => $this->publisher,
            'isbn' => $this->isbn,
            'pages' => $this->pages,
            'published_year' => $this->published_year,
            'dimensions' => $this->dimensions,
            'format' => $this->format,
            'regular_price' => (float) $this->regular_price,
            'sale_price' => $this->sale_price !== null ? (float) $this->sale_price : null,
            'final_price' => (float) $this->final_price,
            'discount_percentage' => (int) $this->discount_percentage,
            'stock' => (int) $this->stock,
            'weight_grams' => (int) $this->weight_grams,
            'cover_image_url' => $this->cover_image_url,
            'description' => $this->description,
            'table_of_contents' => $this->table_of_contents,
            'is_best_seller' => (bool) $this->is_best_seller,
            'is_active' => (bool) $this->is_active,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
