# Technical Plan - Platform Toko Buku Online

*Referensi Desain & Logika Bisnis: Deepublish Store (`deepublishstore.com`)*  
*Dokumen Terkait: `blueprint_toko_buku.md`, `prd_toko_buku.md`*

---

## 1. Arsitektur Sistem & Ekosistem Teknologi

Sistem dirancang menggunakan **arsitektur terpisah (*Decoupled Architecture*)**:
* **Frontend**: Next.js 14+ berbasis SSR/SSG (*Server-Side Rendering* / *Static Site Generation*) untuk memaksimalkan performa SEO katalog buku dan antarmuka belanja interaktif.
* **Backend**: Laravel 11 (PHP 8.2+) sebagai RESTful API yang menangani logika bisnis, kalkulasi harga/ongkir, otentikasi Sanctum, integrasi payment gateway Midtrans, dan pemrosesan antrian latar belakang (*Queues & Jobs*).

```
                    [ Pengguna / Peramban ]
                               │
                               ▼
                     [ Cloudflare / CDN ]
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
  [ Frontend: Next.js 14+ ]         [ Backend API: Laravel 11 ]
  ├── App Router (React 18/19)      ├── PHP 8.2+ RESTful API
  ├── Tailwind CSS + Shadcn/ui      ├── Eloquent ORM & Sanctum Auth
  └── Zustand (Cart State)          ├── Laravel Queues & Jobs
               │                               │
               └───────────────┬───────────────┘
                               │ (REST API / JSON)
               ┌───────────────┴───────────────┐
               ▼                               ▼
      [ Database: MySQL 8.0+ ]        [ Cache & Queue: Redis ]
      (Eloquent Migrations/InnoDB)    (Cache Ongkir, Rate Limit, Job Queue)
               │
   ┌───────────┼───────────┐
   ▼           ▼           ▼
[ Midtrans ] [ RajaOngkir ] [ Storage S3 / Local ]
(Gateway)    (Logistik API) (Asset Cover WebP)
```

### 1.1 Tech Stack Terpilih

* **Frontend Framework**: Next.js 14+ (React 18/19, App Router, TypeScript).
* **Styling**: Tailwind CSS + Shadcn/ui (komponen UI headless & accessible).
* **State Management**: Zustand (Cart & Guest Session), TanStack Query v5 (Data fetching & caching di frontend).
* **Backend Framework**: Laravel 11 (PHP 8.2+, RESTful API).
* **ORM & Database**: Eloquent ORM / MySQL 8.0+ (InnoDB, `utf8mb4_unicode_ci`).
* **In-Memory Cache & Queue**: Redis (Upstash / Local Redis) untuk caching respon ongkir, distributed lock webhook, dan antrian job.
* **Storage Provider**: Laravel Storage driver (AWS S3 / Cloudinary / Local Public) dengan kompresi otomatis WebP via Intervention Image v3.
* **Authentication**: Laravel Sanctum (Token-based API authentication & SPA cookie-based auth).
* **HTTP Client**: Axios / Typed `fetch` wrapper di Next.js untuk integrasi ke endpoint Laravel.

---

## 2. Skema Database Fisik (MySQL 8.0+ DDL & Laravel Migration Blueprint)

Berikut adalah skema fisik MySQL 8.0+ (InnoDB, UTF-8 Multibyte) beserta definisi blueprint migrasi Laravel 11:

```sql
-- DATABASE CONFIGURATION
-- Engine: InnoDB, Charset: utf8mb4, Collation: utf8mb4_unicode_ci

-- USERS TABLE
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NULL,
    password VARCHAR(255) NULL,
    role ENUM('customer', 'admin', 'warehouse') DEFAULT 'customer',
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CATEGORIES TABLE (Hierarchical)
CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    parent_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BOOKS TABLE
CREATE TABLE books (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(280) UNIQUE NOT NULL,
    author VARCHAR(150) NOT NULL,
    publisher VARCHAR(150) DEFAULT 'Penerbit Deepublish',
    isbn VARCHAR(30) UNIQUE NULL,
    pages INT UNSIGNED NOT NULL DEFAULT 1,
    published_year YEAR NULL,
    dimensions VARCHAR(50) NULL,
    format ENUM('hardcover', 'paperback', 'ebook') DEFAULT 'paperback',
    regular_price DECIMAL(12, 2) NOT NULL,
    sale_price DECIMAL(12, 2) NULL,
    stock INT UNSIGNED NOT NULL DEFAULT 0,
    weight_grams INT UNSIGNED NOT NULL DEFAULT 250,
    cover_image_url TEXT NOT NULL,
    description LONGTEXT NOT NULL,
    table_of_contents LONGTEXT NULL,
    is_best_seller BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_books_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_books_slug (slug),
    INDEX idx_books_category (category_id),
    INDEX idx_books_pricing (regular_price, sale_price),
    FULLTEXT INDEX idx_books_search (title, author)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ADDRESSES TABLE
CREATE TABLE addresses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    recipient_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    street_address TEXT NOT NULL,
    province_id VARCHAR(10) NOT NULL,
    city_id VARCHAR(10) NOT NULL,
    district_id VARCHAR(10) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ORDERS TABLE
CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT UNSIGNED NULL,
    guest_email VARCHAR(255) NULL,
    guest_phone VARCHAR(20) NULL,
    total_books_price DECIMAL(12, 2) NOT NULL,
    shipping_cost DECIMAL(12, 2) NOT NULL,
    grand_total DECIMAL(12, 2) NOT NULL,
    courier_code VARCHAR(50) NOT NULL,
    courier_service VARCHAR(50) NOT NULL,
    shipping_address JSON NOT NULL,
    tracking_number VARCHAR(100) NULL,
    status ENUM('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled') DEFAULT 'pending',
    payment_channel VARCHAR(50) NULL,
    payment_status ENUM('unpaid', 'paid', 'expired', 'failed') DEFAULT 'unpaid',
    payment_payload JSON NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_orders_order_number (order_number),
    INDEX idx_orders_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ORDER ITEMS TABLE
CREATE TABLE order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    book_id BIGINT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    price_unit DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```
```

---

## 3. Spesifikasi Kontrak API (Endpoints & Payloads)

### 3.1 Katalog & Produk

* **`GET /api/v1/books`**
  * *Query Params*: `page=1`, `limit=12`, `category=komputer`, `sort=bestseller|price_asc|newest`, `q=python`
  * *Response 200 OK*:
    ```json
    {
      "success": true,
      "meta": { "page": 1, "total_pages": 5, "total_items": 58 },
      "data": [
        {
          "id": "e4b2d358-1a52-47c3-b3eb-ff99c43818e6",
          "title": "Pemrograman Mesin Pembelajaran Modern",
          "slug": "pemrograman-mesin-pembelajaran-modern",
          "author": "Dr. Ir. Hendra",
          "regular_price": 125000,
          "sale_price": 105000,
          "discount_percentage": 16,
          "cover_image_url": "https://cdn.domain.com/books/sample.webp",
          "is_best_seller": true
        }
      ]
    }
    ```

* **`GET /api/v1/books/:slug`**
  * *Response 200 OK*: Mengembalikan detail spesifikasi buku lengkap, status ketersediaan stok, sinopsis, dan daftar isi.

### 3.2 Logistik & Ongkos Kirim

* **`POST /api/v1/shipping/calculate`**
  * *Request Body*:
    ```json
    {
      "destination_district_id": "3171010",
      "total_weight_grams": 750,
      "courier": ["jne", "sicepat", "jnt"]
    }
    ```
  * *Response 200 OK*:
    ```json
    {
      "rates": [
        { "courier": "jne", "service": "REG", "cost": 15000, "etd": "2-3 Hari" },
        { "courier": "sicepat", "service": "SIUNT", "cost": 14000, "etd": "1-2 Hari" }
      ]
    }
    ```

### 3.3 Checkout & Transaksi

* **`POST /api/v1/checkout`**
  * *Request Body*:
    ```json
    {
      "guest_info": { "name": "Budi", "email": "budi@example.com", "phone": "08123456789" },
      "address": { "street": "Jl. Sudirman No 10", "district_id": "3171010", "postal_code": "10220" },
      "courier": { "code": "jne", "service": "REG", "cost": 15000 },
      "items": [{ "book_id": "e4b2d358-1a52-47c3-b3eb-ff99c43818e6", "qty": 1 }]
    }
    ```
  * *Response 201 Created*:
    ```json
    {
      "order_number": "INV-20261012-0042",
      "grand_total": 120000,
      "payment": {
        "token": "snap_token_or_payment_url",
        "redirect_url": "https://app.midtrans.com/snap/v2/vtweb/..."
      }
    }
    ```

---

## 4. Alur Integrasi Webhook (Payment Gateway Idempotency)

Untuk mencegah pemrosesan transaksi ganda saat menerima notifikasi dari penyedia gateway (seperti Midtrans/Xendit):

```
Midtrans/Xendit Server
        │ (POST /api/v1/webhooks/payment)
        ▼
[Verifikasi Signature Hash]
        │
        ├──> [Signature Invalid] ──> Return 401 Unauthorized
        ▼
[Signature Valid]
        │
        ▼
[Acquire Redis Lock via Laravel Cache::lock()] (Key: `lock:order:{order_id}`)
        │
        ├──> [Lock Gagal / Sedang Proses] ──> Return 429 / Skip
        ▼
[Cek Status Order di Database MySQL]
        │
        ├──> [Order Sudah 'paid'] ──> Return 200 OK (Idempotent bypass)
        ▼
[Begin DB Transaction: DB::transaction()]
   ├── Update `orders.status` = 'paid'
   ├── Update `orders.payment_status` = 'paid'
   ├── Kurangi stok buku (`books.stock = stock - qty`)
   └── Simpan audit log pembayaran
[Commit DB Transaction]
        │
        ▼
[Release Redis Lock: $lock->release()]
        │
        ▼
[Dispatch Laravel Job: SendInvoiceEmailJob & NotifyAdminWhatsAppJob]
        │
        ▼
Return 200 OK ke Gateway
```

---

## 5. Strategi Caching & Optimasi Performa

1. **Static Page Generation (ISR) untuk Halaman Buku**:
   * Halaman `/buku/[slug]` di-generate menggunakan `revalidate: 3600` (1 jam).
   * Melakukan *on-demand revalidation* jika admin memperbarui harga atau stok buku melalui webhook internal.
2. **Redis In-Memory Caching untuk Tarif Pengiriman**:
   * Mengingat tarif ekspedisi statis per rute, respon ongkir di-cache dalam format `shipping:{origin}:{district_id}:{weight_bracket}` dengan TTL $86400$ detik ($24$ jam).
3. **Optimasi Aset Gambar**:
   * Kompresi otomatis saat upload sampul: format WebP, lebar maksimal 800px, kualitas $80\%$, lazy-loading native peramban pada grid katalog.

---

## 6. Arsitektur Keamanan (Security Posture)

* **Autentikasi & Autorisasi**:
  * Token API menggunakan **Laravel Sanctum** (Personal Access Tokens dengan izin scoped, atau cookie-based session auth untuk Next.js SPA).
  * Role-Based Access Control (RBAC) ditegakkan melalui Laravel Middleware (`auth:sanctum`, `role:admin`) untuk proteksi rute API `/api/v1/admin/*`, serta route guard di middleware Next.js.
* **Proteksi Transaksi & DDOS**:
  * Rate-limiting menggunakan Laravel RateLimiter berbasis Redis (`RateLimiter::for('checkout', ...)`): maksimum 10 permintaan checkout per menit per IP.
  * Sanitasi dan validasi ketat menggunakan **Laravel Form Request** (`CheckoutRequest`, `ShippingCalculateRequest`) sebelum query dieksekusi, serta validasi skema client-side menggunakan Zod di Next.js.
* **Integritas Webhook**:
  * Verifikasi signature hash `SHA-512` dari Midtrans (`hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey)`) sebelum memproses status transaksi.

---

## 7. Rencana Infrastruktur & Deployment

* **Environment Staging & Production**:
  * **Frontend (Next.js 14+)**: Vercel / Cloudflare Pages.
  * **Backend (Laravel 11)**: VPS (Ubuntu 24.04 LTS, Nginx, PHP 8.2/8.3-FPM, Supervisor untuk queue worker) atau Laravel Forge / Cloud Run.
  * **Database**: MySQL 8.0+ Managed Instance (AWS RDS / DigitalOcean Managed MySQL / VPS MySQL) dengan engine InnoDB dan connection pooling.
  * **In-Memory Cache**: Redis (Upstash / Local Redis Server) untuk distributed cache, queue worker, dan rate limiter.
  * **GitHub Actions CI/CD**: 
    - Frontend pipeline: ESLint, TypeScript check (`tsc --noEmit`), Vitest, Next.js build.
    - Backend pipeline: Laravel Pint (code style), PHPUnit / Pest test, security audit, dan auto-migration (`php artisan migrate --force`).