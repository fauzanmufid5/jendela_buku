# Jendela Buku - Platform E-Commerce Toko Buku Akademik & Referensi

> Platform toko buku online modern khusus literatur ilmiah, buku ajar perkuruan tinggi, monograf riset, dan buku referensi akademik. Terinspirasi dari standar industri Deepublish Store (`deepublishstore.com`).

---

## 🚀 Arsitektur & Tech Stack (Decoupled)

- **Frontend (Storefront & Back-Office)**:
  - **Framework**: [Next.js 14+](https://nextjs.org/) (App Router, React 19, TypeScript)
  - **Styling**: Tailwind CSS & Design System bertema Deep Academic Blue (`#0f2942`) & Warm Amber (`#f59e0b`)
  - **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Persistent LocalStorage Cart & Auth)
  - **Payment Integration**: Midtrans Snap Popup & Redirect
  - **Icons**: Lucide React
  - **HTTP Client**: Axios dengan Interceptor Token Sanctum

- **Backend (REST API)**:
  - **Framework**: [Laravel 11](https://laravel.com/) (PHP 8.2+)
  - **Autentikasi**: Laravel Sanctum (Token-based API RBAC)
  - **Database**: MySQL 8.0+ / MariaDB (`utf8mb4_unicode_ci`)
  - **Payment Gateway**: Midtrans Snap API (Live & Sandbox Simulation Mode) dengan verifikasi signature SHA-512 & idempotency lock
  - **Logistik**: Multi-ekspedisi (JNE, SiCepat, J&T, POS Indonesia) dengan perhitungan akumulasi berat otomatis dan caching 24 jam
  - **Keamanan**: Rate Limiting (`throttle:checkout`, `throttle:webhook`), Sanitasi Payload, & Proteksi CORS

---

## 📁 Struktur Direktori

```
jendela_buku/
├── backend/                           # REST API Laravel 11
│   ├── app/
│   │   ├── Http/Controllers/Api/v1/  # Controller Publik & Admin
│   │   ├── Models/                    # Eloquent Models (User, Category, Book, Order, dll.)
│   │   └── Services/                  # ShippingService & MidtransService
│   ├── database/                      # Migrations & Seeders (33 buku dummy, 21 kategori)
│   └── tests/Feature/                 # 19 Feature test suites (358 assertions passing)
│
├── frontend/                          # Storefront & Admin Next.js 14+
│   ├── src/app/                       # App Router Pages
│   │   ├── (store)/                   # Beranda, /katalog, /buku/[slug], /cart, /checkout, /order/[id]
│   │   ├── admin/                     # Dashboard, /admin/books, /admin/orders, /admin/login
│   │   ├── sitemap.ts                 # XML Sitemap generator dinamis
│   │   └── robots.ts                  # Robots.txt crawler directives
│   ├── src/components/                # Komponen modular UI (Cards, Shared, Layouts)
│   └── src/stores/                    # Zustand Stores (Cart & Auth)
│
└── production_deployment_guide.md     # Panduan komprehensif deployment VPS / Vercel
```

---

## 🛠️ Panduan Menjalankan Secara Lokal (Development)

### 1. Prasyarat
- PHP 8.2 atau lebih baru
- Composer 2.x
- Node.js 18+ & npm
- MySQL / MariaDB (XAMPP / MySQL Server)

### 2. Setup Backend Laravel
```bash
cd backend
composer install
cp .env.example .env
# Sesuaikan kredensial DB_DATABASE=jendela_buku, DB_USERNAME, DB_PASSWORD
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve --port=8000
```
Backend API akan berjalan di: `http://localhost:8000`

### 3. Setup Frontend Next.js
```bash
cd frontend
npm install
npm run dev -- -p 3000
```
Storefront akan berjalan di: `http://localhost:3000`

---

## 🔐 Akun Akses Default (Development & Demo)

- **Portal Admin**: [`http://localhost:3000/admin/login`](http://localhost:3000/admin/login)
  - **Email**: `admin@jendelabuku.test`
  - **Password**: `password123`

---

## 🧪 Menjalankan Automated Tests

Semua fitur telah diuji secara komprehensif dengan 358 assertions:
```bash
cd backend
php artisan test
```

---

## 📄 Lisensi
Hak Cipta © 2026 Jendela Buku. Dilindungi Undang-Undang.
