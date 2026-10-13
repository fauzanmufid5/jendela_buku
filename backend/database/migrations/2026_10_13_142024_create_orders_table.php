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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 50)->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('guest_email', 255)->nullable();
            $table->string('guest_phone', 20)->nullable();
            $table->decimal('total_books_price', 12, 2);
            $table->decimal('shipping_cost', 12, 2);
            $table->decimal('grand_total', 12, 2);
            $table->string('courier_code', 50);
            $table->string('courier_service', 50);
            $table->json('shipping_address');
            $table->string('tracking_number', 100)->nullable();
            $table->enum('status', ['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled'])->default('pending');
            $table->string('payment_channel', 50)->nullable();
            $table->enum('payment_status', ['unpaid', 'paid', 'expired', 'failed'])->default('unpaid');
            $table->json('payment_payload')->nullable();
            $table->timestamps();

            $table->index('order_number');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
