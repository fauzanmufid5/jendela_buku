# Development Plan & Implementation Roadmap - Platform Toko Buku Online

*Referensi Proyek: Deepublish Store (`deepublishstore.com`)*  
*Dokumen Pendukung: `blueprint_toko_buku.md`, `prd_toko_buku.md`, `technical_plan.md`, `design.md`*

---

## 1. Ikhtisar & Timeline Pelaksanaan

Pengembangan ditargetkan selesai dalam siklus **6 Sprint (total 6 minggu)** hingga peluncuran versi MVP yang siap produksi (*Production-Ready MVP*). 

```
[Sprint 1] [SELESAI] Fondasi Backend Laravel 11, Migrasi MySQL, Seeder & Setup Next.js 14
    │
[Sprint 2] [SELESAI] API Katalog & Kategori (Laravel) + Storefront Beranda & Katalog (Next.js)
    │
[Sprint 3] [SELESAI] API Detail Buku + Tab Metadata, Rekomendasi & Direct WhatsApp Order
    │
[Sprint 4] [SELESAI] API Ongkir & Checkout Midtrans (Laravel) + Keranjang & UI Checkout (Next.js)
    │
[Sprint 5] [SELESAI] Back-Office Admin API (Sanctum RBAC) & Dashboard Manajemen Inventaris
    │
[Sprint 6] [SELESAI] Testing Komprehensif (358 Assertions), Hardening, SEO & Launch Ready
```

---

## 2. Rincian Sprint & Deliverables

### Sprint 1: Foundation, DB Architecture & Environment Setup (Minggu 1)
* **Tujuan**: Membangun fondasi repositori arsitektur terpisah (decoupled), konfigurasi runtime Laravel 11 dan Next.js 14, skema database MySQL, serta mock data awal.
* **Tugas Spesifik**:
  - **Backend (Laravel 11)**:
    - Inisialisasi proyek Laravel 11 (`backend/`) dengan PHP 8.2+, konfigurasi CORS, dan setup Laravel Sanctum.
    - Konfigurasi koneksi MySQL 8.0+ dan buat migration file (`users`, `categories`, `books`, `addresses`, `orders`, `order_items`).
    - Buat model Eloquent lengkap dengan relasi (`Category hasMany Books`, `Order hasMany OrderItems`, dll.).
    - Buat seeder database (`BookSeeder.php`, `CategorySeeder.php`) berisi minimal 30 buku akademik dummy realistis (Kedokteran, Teknik, Komputer, Ekonomi).
  - **Frontend (Next.js 14+)**:
    - Inisialisasi proyek Next.js 14+ (`frontend/`) dengan App Router, TypeScript, Tailwind CSS, dan komponen dasar Shadcn/ui.
    - Setup HTTP client wrapper (`lib/api.ts`) dengan Axios/Fetch untuk konsumsi endpoint Laravel.
  - **Storage Provider**: Setup disk penyimpanan publik / S3 untuk asset cover buku.
* **Deliverable**:
  - Repository dengan dua direktori rapi (`backend/` dan `frontend/`).
  - Database MySQL aktif dengan migrasi dan 30+ data buku sampel terisi via seeder.

---

### Sprint 2: Core Storefront, Header & Catalog Browsing (Minggu 2)
* **Tujuan**: Mengimplementasikan REST API katalog di Laravel dan antarmuka utama toko serta listing katalog di Next.js.
* **Tugas Spesifik**:
  - **Backend (Laravel 11)**:
    - Buat `CategoryController` dan endpoint `GET /api/v1/categories` untuk menu hierarkis.
    - Buat `BookController` dan endpoint `GET /api/v1/books` dengan pagination, query filter (kategori, sort by harga/terbaru), serta full-text search MySQL.
    - Implementasikan `BookResource` dan `CategoryResource` untuk standardisasi payload JSON.
  - **Frontend (Next.js 14+)**:
    - Komponen Header: Top bar pengumuman, logo, search bar terintegrasi, counter cart icon, dan navigation dropdown kategori hierarkis.
    - Halaman Beranda (`/`): Hero banner promo, section buku terlaris (*Best Seller*), grid kategori populer, dan value proposition banner.
    - Halaman Katalog (`/katalog`): Grid buku dengan kartu produk (cover rasio 3:4, badge diskon, harga coret, rating, judul truncated) yang mengonsumsi API Laravel.
    - Fitur Filter & Search: URL query state sync untuk filter kategori, rentang harga, dan pencarian kata kunci.
* **Deliverable**:
  - Pengguna dapat menjelajahi beranda, mencari buku berdasarkan kata kunci/kategori, dan melihat katalog responsif yang terhubung langsung ke API Laravel 11.

---

### Sprint 3: Detail Produk & Dual Action Checkout (Minggu 3)
* **Tujuan**: Membangun endpoint detail buku di Laravel dan halaman detail buku di Next.js dengan tab spesifikasi dan tombol order instan via WhatsApp.
* **Tugas Spesifik**:
  - **Backend (Laravel 11)**:
    - Endpoint `GET /api/v1/books/{slug}`: Mengembalikan data spesifikasi buku lengkap, status stok, relasi kategori, dan daftar rekomendasi buku terkait.
  - **Frontend (Next.js 14+)**:
    - Halaman Detail Buku (`/buku/[slug]`):
      - Layout 2 kolom: Galeri thumbnail cover di kiri, detail metadata buku di kanan.
      - Tab informasi: Tab Sinopsis, Tab Spesifikasi Teknis (ISBN, halaman, ukuran, berat gram, tahun), Tab Daftar Isi.
      - Widget Rekomendasi Buku Sejenis (*Related Books carousel*).
    - Implementasi Tombol Aksi Transaksi Ganda:
      - Tombol *Direct WhatsApp Order*: Generator pesan otomatis `wa.me` berisi judul buku, tautan produk, dan template format data pembeli.
      - Tombol *Tambah ke Keranjang* & *Beli Sekarang*: Terhubung ke global store Zustand.
      - Mobile Sticky Action Bar di bagian bawah viewport smartphone.
* **Deliverable**:
  - Halaman detail buku kaya metadata dengan integrasi API Laravel dan opsi pembelian instan via WhatsApp CS yang berfungsi penuh.

---

### Sprint 4: Cart, Ekspedisi & Integrasi Payment Gateway (Minggu 4)
* **Tujuan**: Menyelesaikan alur checkout mandiri dari pemilihan ekspedisi hingga pembayaran otomatis Midtrans menggunakan backend Laravel 11.
* **Tugas Spesifik**:
  - **Backend (Laravel 11)**:
    - Service Logistik (`ShippingService.php`): Perhitungan akumulasi berat (`weight_grams * qty`) dan pengambilan tarif kurir (JNE, SiCepat, J&T) dengan caching Redis 24 jam.
    - Endpoint `POST /api/v1/shipping/calculate` dengan validasi `ShippingCalculateRequest`.
    - Endpoint `POST /api/v1/checkout` dengan validasi `CheckoutRequest`: Menyimpan entitas order & order items, serta menghasilkan token/URL Midtrans Snap menggunakan Midtrans PHP SDK.
    - Webhook Handler `POST /api/v1/webhooks/payment`: Verifikasi signature hash SHA-512, Redis distributed lock (`Cache::lock`), transaksi database atomik (`DB::transaction`) untuk update status order dan mutasi pengurangan stok, serta dispatch job notifikasi invoice email.
  - **Frontend (Next.js 14+)**:
    - Keranjang Belanja (`/cart`): Update kuantitas, kalkulasi subtotal otomatis, dan proteksi limit stok.
    - Halaman Checkout (`/checkout`): Formulir alamat penerima (Provinsi $\rightarrow$ Kota $\rightarrow$ Kecamatan), selector kurir & tarif ongkos kirim.
    - Integrasi Midtrans Snap Popup / Redirect URL.
    - Halaman Konfirmasi Pesanan (`/order/[id]`): Status pembayaran & ringkasan invoice.
* **Deliverable**:
  - Alur transaksi end-to-end: pembeli dapat memilih buku, menghitung tarif ongkir real-time, menyelesaikan pembayaran via QRIS/VA sandbox Midtrans, dan menerima invoice terverifikasi.

---

### Sprint 5: Admin Panel & Manajemen Transaksi (Minggu 5)
* **Tujuan**: Membangun antarmuka back-office dan API manajemen inventaris & pesanan yang aman menggunakan Laravel Sanctum.
* **Tugas Spesifik**:
  - **Backend (Laravel 11)**:
    - Autentikasi Admin: Login endpoint dengan Laravel Sanctum personal access token dan middleware `auth:sanctum` + role authorization (`EnsureUserIsAdmin`).
    - API Manajemen Buku (`/api/v1/admin/books`): CRUD buku, upload cover image dengan kompresi WebP otomatis, filter stok menipis.
    - API Manajemen Pesanan (`/api/v1/admin/orders`): List filter status pesanan, update nomor resi pengiriman kurir, dan ubah status pesanan menjadi *shipped*.
  - **Frontend (Next.js 14+)**:
    - Layout Admin terproteksi (`/admin`) dengan sidebar navigasi.
    - Tabel inventaris buku dengan pagination dan modal form tambah/edit buku.
    - Halaman manajemen pesanan: verifikasi pembayaran masuk, input nomor resi pengiriman, dan tombol cetak packing slip.
* **Deliverable**:
  - Dashboard internal yang memungkinkan admin menambah buku baru, mengelola stok, dan memproses nomor resi pengiriman secara aman.

---

### Sprint 6: Quality Assurance, Security, Performance & Launch (Minggu 6)
* **Tujuan**: Memastikan keandalan sistem melalui testing otomatis di kedua sisi (Laravel & Next.js), hardening keamanan, SEO, dan deployment produksi.
* **Tugas Spesifik**:
  - **Testing**:
    - Backend Testing (Pest PHP / PHPUnit): Uji unit kalkulasi diskon, ongkir, validasi Form Request, otentikasi Sanctum, dan idempotensi webhook Midtrans.
    - Frontend Testing (Vitest & Playwright): Uji komponen UI dan pengujian E2E alur checkout lengkap.
  - **Keamanan & Hardening**:
    - Proteksi rate-limiting Redis pada endpoint checkout/webhook di Laravel.
    - Konfigurasi header CORS ketat untuk domain frontend Next.js.
  - **Optimasi Performa & SEO**:
    - Konfigurasi metadata OpenGraph & Schema.org `Book` JSON-LD pada setiap halaman buku di Next.js SSR.
    - Audit Google Lighthouse: Memastikan skor Performance $\ge 90$ dan SEO $\ge 95$.
  - **Setup Production Deployment**:
    - Frontend: Vercel / Cloudflare Pages.
    - Backend: VPS (Ubuntu 24.04, Nginx, PHP 8.2/8.3-FPM, Supervisor worker) / Laravel Forge.
    - Database: Managed MySQL 8.0+ Instance dengan backup otomatis.
    - Payment: Beralih dari Sandbox ke Production Midtrans credentials.
* **Status**: **SELESAI & TERVERIFIKASI (100%)**
* **Deliverable**:
  - Website live di domain publik dengan sertifikat SSL aktif, backend Laravel 11 stabil, payment gateway terintegrasi, testing otomatis lengkap (358 assertions lulus), dan panduan deployment produksi komprehensif (`production_deployment_guide.md`).

---

## 3. Struktur Direktori Proyek (Target Architecture - Decoupled)

```
jendela_buku/
├── backend/                             # Backend API Laravel 11
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/v1/
│   │   │   │   ├── BookController.php
│   │   │   │   ├── CategoryController.php
│   │   │   │   ├── ShippingController.php
│   │   │   │   ├── CheckoutController.php
│   │   │   │   ├── PaymentWebhookController.php
│   │   │   │   └── Admin/
│   │   │   │       ├── AdminBookController.php
│   │   │   │       └── AdminOrderController.php
│   │   │   ├── Requests/
│   │   │   │   ├── CheckoutRequest.php
│   │   │   │   └── ShippingCalculateRequest.php
│   │   │   └── Resources/
│   │   │       ├── BookResource.php
│   │   │       └── CategoryResource.php
│   │   ├── Models/
│   │   │   ├── Book.php
│   │   │   ├── Category.php
│   │   │   ├── Order.php
│   │   │   ├── OrderItem.php
│   │   │   ├── Address.php
│   │   │   └── User.php
│   │   └── Services/
│   │       ├── ShippingService.php
│   │       └── MidtransService.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   │       ├── DatabaseSeeder.php
│   │       ├── CategorySeeder.php
│   │       └── BookSeeder.php
│   ├── routes/
│   │   └── api.php                      # Endpoint API v1
│   ├── tests/
│   │   ├── Feature/
│   │   └── Unit/
│   ├── composer.json
│   └── .env.example
│
└── frontend/                            # Frontend Next.js 14+ Storefront
    ├── public/
    │   ├── images/
    │   └── icons/
    ├── src/
    │   ├── app/
    │   │   ├── (store)/
    │   │   │   ├── layout.tsx
    │   │   │   ├── page.tsx
    │   │   │   ├── katalog/page.tsx
    │   │   │   ├── buku/[slug]/page.tsx
    │   │   │   ├── cart/page.tsx
    │   │   │   ├── checkout/page.tsx
    │   │   │   └── order/[id]/page.tsx
    │   │   └── (admin)/
    │   │       ├── admin/layout.tsx
    │   │       ├── admin/books/page.tsx
    │   │       └── admin/orders/page.tsx
    │   ├── components/
    │   │   ├── ui/
    │   │   ├── cards/
    │   │   ├── checkout/
    │   │   └── shared/
    │   ├── lib/
    │   │   └── api.ts                   # Client wrapper ke Laravel API
    │   ├── stores/
    │   │   └── useCartStore.ts
    │   └── types/
    │       └── index.ts
    ├── package.json
    ├── tailwind.config.ts
    └── next.config.mjs
```

---

## 4. Strategi Pengujian (Testing Strategy)

| Level Pengujian | Alat / Library | Ruang Lingkup Pengujian |
| :--- | :--- | :--- |
| **Unit Testing** | Pest PHP / PHPUnit & Vitest | Backend: Kalkulasi harga diskon, formula ongkos kirim kumulatif, rule Form Request. Frontend: format mata uang IDR, Zustand cart reducer. |
| **Integration Testing** | Pest PHP / PHPUnit | Laravel API Routes (`/api/v1/checkout`, verifikasi signature Midtrans SHA-512, Redis locking, transaksi database atomik). |
| **End-to-End (E2E)** | Playwright | Skenario lengkap: Pembeli mencari buku $\rightarrow$ menambahkan ke keranjang $\rightarrow$ mengisi form ongkir $\rightarrow$ memicu pembayaran. |
| **Manual QA** | Browser DevTools & Real Devices | Pengujian responsivitas mobile Android/iOS, interaksi link template pesan WhatsApp, dan sinkronisasi status webhook sandbox. |

---

## 5. Kriteria Definition of Done (DoD)

Sebuah fitur dianggap selesai (*Done*) dan siap dimerge ke branch `main` jika memenuhi kriteria berikut:
1. **Lolos Uji Kompilasi & Lint**: Lolos linting PHP Laravel Pint, tidak ada error TypeScript (`tsc --noEmit`), dan lolos ESLint tanpa warning kritis.
2. **Pengujian Berhasil**: Semua test case unit dan integrasi yang relevan berstatus hijau (*passed*).
3. **Responsif**: Tampilan telah diverifikasi pada breakpoint mobile ($375\text{px}$) hingga desktop ($1440\text{px}$).
4. **Keamanan Data**: Semua payload divalidasi via Laravel Form Request di backend dan Zod di frontend, tidak ada secret key yang bocor ke client.
5. **Performa**: Halaman tidak menghasilkan layout shift signifikan (CLS $< 0.1$) dan gambar cover teroptimasi dengan format WebP.

---

## 6. Manajemen Risiko & Mitigasi Teknis

| Potensi Masalah | Probabilitas / Dampak | Solusi Mitigasi |
| :--- | :---: | :--- |
| **Keterlambatan/Downtime API Ongkir** | Sedang / Tinggi | Pasang caching Redis dengan TTL 24 jam untuk rute ekspedisi populer; sediakan fallback tarif flat sementara jika API eksternal gagal. |
| **Pemesanan Stok Ganda (Race Condition)** | Rendah / Tinggi | Gunakan transaksi database MySQL InnoDB dengan pesimistik lock (`DB::transaction` dan Eloquent `lockForUpdate()`), atau penyesuaian stok atomik. |
| **Notifikasi Webhook Tertunda** | Sedang / Sedang | Buat worker terjadwal (*cron job*) setiap 10 menit untuk mengecek status pembayaran ke API Midtrans untuk pesanan berstatus *pending* lebih dari 15 menit. |