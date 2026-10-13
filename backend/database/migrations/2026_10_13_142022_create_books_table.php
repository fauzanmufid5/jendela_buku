<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->string('title', 255);
            $table->string('slug', 280)->unique();
            $table->string('author', 150);
            $table->string('publisher', 150)->default('Penerbit Deepublish');
            $table->string('isbn', 30)->nullable()->unique();
            $table->unsignedInteger('pages')->default(1);
            $table->unsignedSmallInteger('published_year')->nullable();
            $table->string('dimensions', 50)->nullable();
            $table->enum('format', ['hardcover', 'paperback', 'ebook'])->default('paperback');
            $table->decimal('regular_price', 12, 2);
            $table->decimal('sale_price', 12, 2)->nullable();
            $table->unsignedInteger('stock')->default(0);
            $table->unsignedInteger('weight_grams')->default(250);
            $table->text('cover_image_url');
            $table->longText('description');
            $table->longText('table_of_contents')->nullable();
            $table->boolean('is_best_seller')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('category_id');
            $table->index(['regular_price', 'sale_price']);
            $table->fullText(['title', 'author'], 'idx_books_search');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
