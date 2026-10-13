# Blueprint Pengembangan Website Toko Buku Online
*Referensi: Deepublish Store (deepublishstore.com)*

---

## 1. Ikhtisar & Tujuan Sistem

Website ini bertujuan untuk menyediakan platform penjualan buku (fokus akademisi, profesional, dan umum) dengan pengalaman berbelanja yang intuitif, navigasi kategori terstruktur, dan dukungan transaksi ganda (checkout otomatis via payment gateway serta pemesanan cepat via WhatsApp).

---

## 2. Profil Pengguna (User Persona)

1. **Pembeli Mandiri / Mahasiswa / Dosen**:
   - Membutuhkan fitur pencarian cepat berdasarkan judul, penulis, bidang ilmu, atau ISBN.
   - Menginginkan preview detail buku (sinopsis, spesifikasi jumlah halaman, dimensi, tahun terbit).
   - Menginginkan transparansi ongkos kirim dan verifikasi pembayaran instan.
2. **Pembeli B2B / Instansi / Perpustakaan**:
   - Membutuhkan kanal komunikasi langsung (WhatsApp / CS) untuk pengadaan buku dalam jumlah banyak (*bulk order*).
3. **Administrator / Pengelola Toko**:
   - Memerlukan dashboard untuk mengelola katalog, stok, diskon/harga coret, pesanan masuk, serta resi pengiriman.

---

## 3. Peta Situs (Sitemap & Arsitektur Informasi)

```
[ Beranda (/) ]
│
├── [ Katalog & Kategori (/katalog, /kategori/:slug) ]
│    ├── Filter: Kategori / Bidang Ilmu
│    ├── Filter: Format (Buku Cetak / E-Book)
│    ├── Filter: Rentang Harga & Diskon
│    └── Urutan: Terpopuler, Terbaru, Harga Terendah/Tertinggi
│
├── [ Detail Buku (/buku/:slug) ]
│    ├── Galeri Sampul & Preview Isi
│    ├── Informasi Harga Coret, Diskon, & Stok
│    ├── Spesifikasi Teknis (ISBN, Penulis, Halaman, Tahun)
│    ├── Sinopsis & Daftar Isi
│    ├── Tombol Beli Cepat via WhatsApp
│    └── Rekomendasi Buku Terkait
│
├── [ Keranjang Belanja (/cart) ]
│    └── Manajemen Kuantitas & Hitung Subtotal
│
├── [ Checkout & Pembayaran (/checkout) ]
│    ├── Formulir Alamat Pengiriman
│    ├── Kalkulasi Ongkir Otomatis (Integrasi Kurir)
│    └── Pilihan Metode Bayar (VA, QRIS, E-Wallet)
│
├── [ Pelacakan & Riwayat Pesanan (/order/:id) ]
│    └── Status Pesanan & Nomor Resi
│
└── [ Halaman Tambahan ]
     ├── Layanan Pengadaan & B2B (/pengadaan)
     ├── Blog / Artikel Bedah Buku (/blog)
     └── Hubungi Kami & FAQ (/kontak)
```

---

## 4. Alur Transaksi & Checkout (Transaction Flow)

```
                      +-------------------+
                      |   Halaman Buku    |
                      +---------+---------+
                                |
               +----------------+----------------+
               |                                 |
               v                                 v
      [Beli via WhatsApp]             [Tambah ke Keranjang]
               |                                 |
        Redirect ke CS                           v
      (Pesan otomatis isi             [Halaman Keranjang]
       Judul, Link, Alamat)                      |
                                                 v
                                        [Halaman Checkout]
                                                 |
                               +-----------------+-----------------+
                               |                                   |
                               v                                   v
                      Input Alamat Lengkap              Pilih Kurir & Layanan
                      (Provinsi, Kota, Kec.)            (JNE, J&T, SiCepat, dll.)
                               |                                   |
                               +-----------------+-----------------+
                                                 |
                                                 v
                                        [Pilih Pembayaran]
                                    (Midtrans / Xendit / Duitku)
                                                 |
                                                 v
                                      [Webhook Notifikasi]
                                                 |
                               +-----------------+-----------------+
                               |                                   |
                               v                                   v
                       Update Status Order             Kirim Notifikasi Invoice
                       & Kurangi Stok                   (Email / WhatsApp)
```

---

## 5. Skema Basis Data Relasional (ERD Blueprint)

### `users`
* `id` (PK, UUID / INT AUTO_INCREMENT)
* `name` (VARCHAR)
* `email` (VARCHAR, UNIQUE)
* `phone` (VARCHAR)
* `password_hash` (VARCHAR, NULLABLE untuk guest)
* `role` (ENUM: 'customer', 'admin')
* `created_at` (TIMESTAMP)

### `addresses`
* `id` (PK)
* `user_id` (FK -> users.id)
* `recipient_name` (VARCHAR)
* `phone` (VARCHAR)
* `street_address` (TEXT)
* `province_id` (VARCHAR)
* `city_id` (VARCHAR)
* `district_id` (VARCHAR)
* `postal_code` (VARCHAR)

### `categories`
* `id` (PK)
* `name` (VARCHAR)
* `slug` (VARCHAR, UNIQUE)
* `parent_id` (FK -> categories.id, NULLABLE untuk sub-kategori)

### `books`
* `id` (PK)
* `category_id` (FK -> categories.id)
* `title` (VARCHAR)
* `slug` (VARCHAR, UNIQUE)
* `author` (VARCHAR)
* `publisher` (VARCHAR, DEFAULT 'Penerbit')
* `isbn` (VARCHAR)
* `pages` (INT)
* `published_year` (INT)
* `dimensions` (VARCHAR)
* `regular_price` (DECIMAL)
* `sale_price` (DECIMAL, NULLABLE)
* `stock` (INT)
* `weight_grams` (INT)
* `cover_image` (VARCHAR)
* `description` (TEXT)
* `table_of_contents` (TEXT, NULLABLE)
* `is_best_seller` (BOOLEAN, DEFAULT FALSE)
* `is_active` (BOOLEAN, DEFAULT TRUE)

### `orders`
* `id` (PK)
* `order_number` (VARCHAR, UNIQUE)
* `user_id` (FK -> users.id, NULLABLE)
* `total_books_price` (DECIMAL)
* `shipping_cost` (DECIMAL)
* `grand_total` (DECIMAL)
* `courier_code` (VARCHAR)
* `courier_service` (VARCHAR)
* `tracking_number` (VARCHAR, NULLABLE)
* `status` (ENUM: 'pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled')
* `payment_channel` (VARCHAR)
* `payment_status` (ENUM: 'unpaid', 'paid', 'expired', 'failed')
* `created_at` (TIMESTAMP)

### `order_items`
* `id` (PK)
* `order_id` (FK -> orders.id)
* `book_id` (FK -> books.id)
* `quantity` (INT)
* `price_unit` (DECIMAL)
* `subtotal` (DECIMAL)

---

## 6. Integrasi Eksternal (Third-Party Services)

1. **Logistik & Ekspedisi**:
   - Pilihan: **RajaOngkir**, **Biteship**, atau API kurir langsung.
   - Kebutuhan data: Kode kecamatan asal & tujuan, berat produk akumulatif dalam gram (`weight_grams * quantity`).
2. **Payment Gateway**:
   - Pilihan: **Midtrans**, **Xendit**, atau **Duitku**.
   - Kanal utama: QRIS (GoPay, OVO, ShopeePay), BCA/Mandiri/BRI Virtual Account.
3. **Notifikasi & CS**:
   - Integrasi WhatsApp Business API atau link `wa.me` berformat teks terisi otomatis untuk *direct-order*.
   - Email transactional (SMTP / Resend / SendGrid) untuk invoice otomatis.

---

## 7. Rekomendasi Tech Stack

| Opsi | Frontend | Backend & DB | Kelebihan |
| :--- | :--- | :--- | :--- |
| **Pilihan Utama (Decoupled Modern)** | Next.js 14+ (React, Tailwind CSS, TypeScript) | Laravel 11 (PHP 8.2+, Eloquent ORM) + MySQL 8.0+ | Pemisahan concern yang bersih (*clean separation*), performa SEO katalog maksimal via SSR Next.js, keandalan backend enterprise (Sanctum, Eloquent, Queue, Event), serta ekosistem logistik & payment gateway Indonesia yang sangat matang di Laravel. |
| **Opsi Alternatif (CMS Instan)** | WordPress + WooCommerce | MySQL | Siap pakai dengan plugin ongkir & Midtrans bawaan, namun kustomisasi UI, integrasi multi-kanal, dan skalabilitas arsitektur lebih terbatas. |