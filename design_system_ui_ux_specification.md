# Design Specification - Platform Toko Buku Online

*Referensi Visual & Pola Interaksi: Deepublish Store (`deepublishstore.com`)*  
*Dokumen Terkait: `blueprint_toko_buku.md`, `prd_toko_buku.md`, `technical_plan.md`*

---

## 1. Filosofi Desain & Arah Visual

1. **Credible & Academic**: Memberikan kesan penerbit yang kredibel dan tepercaya untuk kalangan dosen, mahasiswa, dan peneliti.
2. **Scannable Catalog**: Informasi esensial (judul buku, penulis, harga coret, rating, status stok) harus langsung terbaca dalam pandangan sekilas.
3. **High-Conversion Frictionless Checkout**: Pilihan aksi jelas (Beli Cepat via WhatsApp vs. Tambah ke Keranjang), tombol CTA mencolok, serta alur checkout yang ringkas.

---

## 2. Design Tokens & Palet Warna

Skema warna mengambil inspirasi dari nuansa penerbit Deepublish: kombinasi biru akademis tua/elegan, aksen oranye terang untuk promo dan CTA, serta latar belakang netral yang bersih.

### 2.1 Palet Warna (Color System)

| Token Nama | Hex Code | Penggunaan Utama |
| :--- | :--- | :--- |
| `primary-900` | `#0f2942` | Header navbar, footer background, judul utama (h1/h2) |
| `primary-700` | `#1a446c` | Tombol sekunder, hover menu navigasi, active link |
| `primary-500` | `#2563eb` | Tautan reguler, tab aktif, ikon informasi |
| `accent-500` | `#f97316` | Tombol CTA utama ("Beli Sekarang", Diskon Badge) |
| `accent-600` | `#ea580c` | Hover state CTA utama |
| `success-500` | `#16a34a` | Tombol "Pesan via WhatsApp", badge "In Stock" |
| `success-600` | `#15803d` | Hover state tombol WhatsApp |
| `neutral-50` | `#f8fafc` | Latar belakang halaman toko, card inner tint |
| `neutral-100` | `#f1f5f9` | Border divider, latar badge non-aktif |
| `neutral-400` | `#94a3b8` | Teks harga coret, icon muted, placeholder |
| `neutral-700` | `#334155` | Teks paragraf, spesifikasi teknis |
| `neutral-900` | `#0f172a` | Judul buku, teks harga utama |

### 2.2 Tipografi (Typography)

* **Font Utama (Body & UI)**: `Plus Jakarta Sans` atau `Inter` (Sans-Serif, mudah dibaca di mobile).
* **Font Judul / Editorial (Opsional)**: `Merriweather` atau `Lora` untuk sinopsis/sampul editorial.

| Skala Tipografi | Ukuran (px / rem) | Weight | Line Height | Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| `Display` | 36px / 2.25rem | Bold (700) | 1.2 | Hero Banner Headline |
| `Heading 1` | 28px / 1.75rem | Bold (700) | 1.3 | Judul Halaman & Detail Buku |
| `Heading 2` | 22px / 1.375rem | Semi-Bold (600) | 1.35 | Section Title (Buku Terlaris) |
| `Heading 3` | 16px / 1.0rem | Semi-Bold (600) | 1.4 | Judul Kartu Buku |
| `Body Regular` | 14px / 0.875rem | Regular (400) | 1.5 | Teks Deskripsi, Sinopsis |
| `Body Small` | 12px / 0.75rem | Medium (500) | 1.4 | Penulis, Badge, Kategori |
| `Price Big` | 20px / 1.25rem | Bold (700) | 1.2 | Harga Diskon Halaman Detail |

---

## 3. Komponen Inti Antarmuka (Core UI Components)

### 3.1 Kartu Buku (Book Product Card)
* **Thumbnail Cover**: Aspek rasio buku 3:4 dengan rounded-md dan border halus. Terdapat badge diskon di sudut kiri atas (`-15%`) dan badge `Best Seller` jika berlaku.
* **Metadata**: Kategori singkat (misal: *Teknik Sipil*), Judul Buku (maksimal 2 baris truncated `line-clamp-2`), dan Nama Penulis.
* **Harga**:
  * Harga coret: `text-xs text-neutral-400 line-through`
  * Harga diskon/aktif: `text-base font-bold text-accent-600`
* **Interaksi Cepat**: Tombol ikon keranjang kecil (*quick add*) atau tombol *Detail*.

### 3.2 Tombol Aksi Transaksi (Dual CTA System)
* **Tombol 1 (Keranjang / Web Checkout)**:
  * Warna: `accent-500` (Oranye).
  * Label: *"Tambah ke Keranjang"* / *"Beli Sekarang"*.
* **Tombol 2 (Direct WhatsApp Order)**:
  * Warna: `success-500` (Hijau WhatsApp).
  * Label: *"Beli Cepat via WhatsApp"* lengkap dengan icon WA.

---

## 4. Rancang Tata Letak Kawat (Wireframe)

### 4.1 Beranda (Homepage Layout)

```
+------------------------------------------------------------------------+
| Top Bar: Hotline CS | Pengumuman Promo Gratis Ongkir s/d 50rb          |
+------------------------------------------------------------------------+
| [LOGO]   [ Search Input: Cari Judul/Penulis/ISBN...   [Q] ]  [Cart: 2] |
+------------------------------------------------------------------------+
| Menu: [Semua Kategori v] | Promo | Terlaris | E-Book | Pengadaan B2B    |
+------------------------------------------------------------------------+
| [ HERO BANNER SLIDER: Diskon Buku Akademik Awal Semester s/d 30% ]      |
+------------------------------------------------------------------------+
| KATEGORI POPULER:                                                      |
| [ Kedokteran ] [ Teknik & Sains ] [ Ekonomi ] [ Hukum ] [ Pertanian ]  |
+------------------------------------------------------------------------+
| SECTION: BUKU BEST SELLER                                              |
| +-------------+  +-------------+  +-------------+  +-------------+     |
| | [Cover 3:4] |  | [Cover 3:4] |  | [Cover 3:4] |  | [Cover 3:4] |     |
| | Diskon -15% |  | Diskon -20% |  | Best Seller |  |             |     |
| | Judul Buku  |  | Judul Buku  |  | Judul Buku  |  | Judul Buku  |     |
| | Penulis     |  | Penulis     |  | Penulis     |  | Penulis     |     |
| | Rp 85.000   |  | Rp 110.000  |  | Rp 95.000   |  | Rp 75.000   |     |
| | [+ Beli]    |  | [+ Beli]    |  | [+ Beli]    |  | [+ Beli]    |     |
| +-------------+  +-------------+  +-------------+  +-------------+     |
+------------------------------------------------------------------------+
| VALUE PROPOSITION: [100% Asli] [Pengiriman Cepat] [Pilihan Lengkap]    |
+------------------------------------------------------------------------+
| FOOTER: Alamat Penerbit | Jam Layanan | Sertifikasi & Partner Logistik |
+------------------------------------------------------------------------+
```

### 4.2 Halaman Detail Produk (`/buku/:slug`)

```
+------------------------------------------------------------------------+
| Breadcrumb: Beranda > Teknik Komputer > Pemrograman Python Terapan     |
+------------------------------------------------------------------------+
|                                                                        |
|  [ FOTO COVER ]      JUDUL BUKU LENGKAP                                |
|  - Gambar Sampul     Penulis: Prof. Dr. Andi, M.T.                     |
|  - Thumbnail         Penerbit: Deepublish | Tahun: 2026                |
|    alternatif        ------------------------------------------------  |
|                      Harga Normal : ~~Rp 120.000~~                     |
|                      Harga Spesial: Rp 99.000 (Hemat 18%)              |
|                      Status Stok  : [ V Tersedia di Gudang ]           |
|                      ------------------------------------------------  |
|                      Jumlah: [- 1 +]                                   |
|                      [ + Tambah ke Keranjang ] [ Beli Sekarang ]       |
|                      [ 💬 Pesan Cepat via WhatsApp ]                   |
|                                                                        |
+------------------------------------------------------------------------+
| TAB INFORMASI: [ Sinopsis ] | [ Detail Spesifikasi ] | [ Daftar Isi ]   |
|                                                                        |
| Spesifikasi Teknis:                                                    |
| • ISBN         : 978-623-02-XXXX-X                                     |
| • Jumlah Hal   : 240 Halaman                                           |
| • Ukuran       : 15.5 x 23 cm (UNESCO)                                 |
| • Berat        : 350 gram                                              |
| • Jenis Kertas : Bookpaper 72 GSM                                      |
+------------------------------------------------------------------------+
| SECTION: BUKU TERKAIT / REKOMENDASI                                    |
| [ Card Buku 1 ]  [ Card Buku 2 ]  [ Card Buku 3 ]  [ Card Buku 4 ]     |
+------------------------------------------------------------------------+
```

### 4.3 Keranjang & Alur Checkout Mandiri

```
+------------------------------------------------------------------------+
| CHECKOUT: 1. Keranjang > 2. Pengiriman > 3. Pembayaran > 4. Selesai    |
+------------------------------------------------------------------------+
| [Kiri: Formulir Data & Pengiriman]      | [Kanan: Ringkasan Pesanan]   |
|                                         |                              |
| Data Pembeli:                           | • Pemrograman Python  x1     |
| - Nama Lengkap                          |   Rp 99.000                  |
| - No. WhatsApp (Aktif)                  | • Dasar Jaringan Komp x1     |
| - Email (Notifikasi Invoice)            |   Rp 85.000                  |
|                                         | ---------------------------- |
| Alamat Tujuan:                          | Subtotal Buku   : Rp 184.000 |
| - Provinsi, Kota/Kabupaten, Kecamatan   | Berat (650g)    :              |
| - Kode Pos & Alamat Lengkap             | Ongkir (JNE REG): Rp  15.000 |
|                                         | ---------------------------- |
| Pilihan Ekspedisi:                      | TOTAL TAGIHAN   : Rp 199.000 |
| (o) JNE Regular (2-3 hari) - Rp 15.000  |                              |
| ( ) SiCepat Best (1 hari) - Rp 22.000   | [ Tombol: Bayar Sekarang ]   |
| ( ) J&T Express (2-3 hari) - Rp 16.000  |                              |
+------------------------------------------------------------------------+
```

---

## 5. Responsivitas & Pola Interaksi Mobile

1. **Sticky Bottom Action Bar pada Detail Produk**:
   * Saat layar dibuka di smartphone, tombol CTA melayang di bagian bawah layar:
     `[ 💬 WhatsApp ]` (35% lebar) dan `[ + Keranjang / Beli ]` (65% lebar).
2. **Filter & Sort via Bottom Sheet Drawer**:
   * Pada halaman katalog mobile, filter kategori dan urutan harga dibuka sebagai sheet modal dari bawah layar agar mudah dijangkau ibu jari (*thumb zone*).
3. **Optimasi Gambar Lazy-Load**:
   * Placeholder skeleton berbentuk rasio buku 3:4 berwarna abu-abu netral (`bg-neutral-200 animate-pulse`) dimuat sebelum gambar sampul siap.