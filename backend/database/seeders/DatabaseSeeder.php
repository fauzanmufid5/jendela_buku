<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Admin User
        User::updateOrCreate(
            ['email' => 'admin@jendelabuku.test'],
            [
                'name' => 'Administrator Jendela Buku',
                'phone' => '081234567890',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // 2. Seed Customer User
        User::updateOrCreate(
            ['email' => 'customer@jendelabuku.test'],
            [
                'name' => 'Budi Pratama (Dosen/Peneliti)',
                'phone' => '089876543210',
                'password' => Hash::make('password123'),
                'role' => 'customer',
                'email_verified_at' => now(),
            ]
        );

        // 3. Seed Hierarchical Categories
        $this->call(CategorySeeder::class);

        // 4. Seed Books (32 realistic academic books)
        $this->call(BookSeeder::class);
    }
}
