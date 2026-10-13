# Product Requirement Document (PRD) - Toko Buku Online

| Metadata | Keterangan |
| :--- | :--- |
| **Nama Produk** | Platform Toko Buku Online |
| **Status Dokumen** | Draft v1.0 |
| **Target Rilis MVP** | Fase 1 |
| **Referensi Utama** | Deepublish Store (`deepublishstore.com`) |

---

## 1. Ikhtisar & Latar Belakang

Banyak pembeli buku, terutama segmen akademisi (dosen, mahasiswa, peneliti) dan pembaca umum, memerlukan platform yang memudahkan pencarian buku referensi spesifik, perbandingan edisi/harga, serta kemudahan transaksi baik melalui sistem checkout mandiri maupun pemesanan cepat via WhatsApp/CS.

Platform ini bertujuan menghadirkan toko buku online dengan katalog terstruktur berdasarkan bidang keilmuan, spesifikasi buku yang lengkap, kalkulasi biaya kirim otomatis, serta integrasi multi-kanal (web checkout & direct CS).

---

## 2. Tujuan & Metrik Keberhasilan (OKRs / KPIs)

### 2.1 Tujuan Produk
* Mempermudah pengguna menemukan buku sesuai kategori akademis dan umum dalam maksimal 3 klik dari halaman utama.
* Menyediakan alur pemesanan ganda: checkout otomatis berbasis payment gateway lokal dan checkout cepat via WhatsApp.
* Memberikan transparansi informasi produk (ISBN, jumlah halaman, ukuran, sinopsis, daftar isi).

### 2.2 Metrik Kunci (KPIs)
* **Conversion Rate**: $\ge 2.5\%$ dari kunjungan katalog hingga transaksi selesai.
* **Cart Abandonment Rate**: Di bawah $65\%$.
* **Page Load Speed**: Waktu muat halaman katalog dan detail produk $< 2$ detik.
* **Search Success Rate**: $\ge 85\%$ pengguna menemukan produk relevan melalui kolom pencarian.

---

## 3. Persona Pengguna

1. **Mahasiswa / Dosen (Akademisi)**:
   * *Kebutuhan*: Mencari buku pegangan kuliah, buku ajar, atau referensi riset berdasarkan mata kuliah/bidang ilmu spesifik.
   * *Karakteristik*: Meneliti keaslian buku, nama penulis/dosen, ISBN, dan mencari opsi harga diskon.
2. **Pembaca Umum**:
   * *Kebutuhan*: Mencari buku motivasi, fiksi, self-improvement, atau buku bisnis populer.
   * *Karakteristik*: Mengandalkan ulasan, rekomendasi *Best Seller*, dan proses checkout cepat tanpa registrasi rumit.
3. **Admin Toko & Tim Gudang**:
   * *Kebutuhan*: Mengelola inventaris fisik/ebook, memperbarui diskon, mencetak label pengiriman, dan memantau status pembayaran.

---

## 4. Cakupan Rilis (MVP vs Fase Selanjutnya)

| Fitur | MVP (Fase 1) | Fase 2 |
| :--- | :---: | :---: |
| Katalog & Multi-Kategori Hierarkis | **Ya** | Ditingkatkan |
| Pencarian & Filter (Harga, Kategori, Best Seller) | **Ya** | Filter Penulis & Format |
| Halaman Detail Buku + Tab Sinopsis & Daftar Isi | **Ya** | Preview PDF Sample |
| Checkout Mandiri (Payment Gateway Midtrans/Xendit) | **Ya** | Pembayaran Cicilan / PayLater |
| Kalkulasi Ongkir Otomatis (RajaOngkir / Biteship) | **Ya** | Pick-up di Lokasi Fisik |
| Tombol Order Cepat via WhatsApp | **Ya** | Integrasi WA Business API Bot |
| Manajemen Stok & Pesanan di Panel Admin | **Ya** | Integrasi Akuntansi / ERP |
| Program Afiliasi & Reseller | Tidak | **Ya** |
| Pembelian & Pembaca E-book Terintegrasi | Tidak | **Ya** |

---

## 5. Kebutuhan Fungsional (Functional Requirements)

### 5.1 Navigasi & Pencarian
* **FR-01**: Pengguna dapat mencari buku menggunakan kata kunci judul, nama penulis, atau nomor ISBN.
* **FR-02**: Sistem menyediakan menu drop-down kategori multi-level (misal: *Kesehatan > Keperawatan*, *Teknik > Komputer*).
* **FR-03**: Sistem menampilkan penanda badge (*Best Seller*, *Diskon %*, *E-book*).

### 5.2 Halaman Katalog & Produk
* **FR-04**: Menampilkan perbandingan harga normal (coret) dan harga diskon secara jelas.
* **FR-05**: Menampilkan spesifikasi teknis lengkap: Penulis, Penerbit, Tahun Terbit, Jumlah Halaman, Dimensi, Berat (gram), dan ISBN.
* **FR-06**: Terdapat tombol ganda pada halaman produk:
  * Tombol **"Tambah ke Keranjang"** / **"Beli Sekarang"**.
  * Tombol **"Beli via WhatsApp"** (menghasilkan pesan otomatis berisi link produk, judul, dan format pesanan).

### 5.3 Keranjang & Checkout
* **FR-07**: Pengguna dapat melakukan pembelian sebagai tamu (*Guest Checkout*) atau dengan login akun.
* **FR-08**: Sistem menghitung total berat barang dalam gram dan mengambil tarif ekspedisi (JNE, SiCepat, J&T, POS) berdasarkan kecamatan tujuan.
* **FR-09**: Integrasi pembayaran otomatis (Virtual Account, QRIS, e-Wallet) dengan batas waktu pembayaran (*expiry timer*).
* **FR-10**: Notifikasi invoice otomatis dikirimkan ke email pembeli setelah pesanan dibuat dan setelah pembayaran terverifikasi.

### 5.4 Panel Administrasi (Back-Office)
* **FR-11**: CRUD (Create, Read, Update, Delete) data buku, kategori, dan stok barang.
* **FR-12**: Manajemen promosi: pengaturan diskon nominal atau persentase, kode kupon voucher, dan penanda *Best Seller*.
* **FR-13**: Manajemen pesanan: update status (*Menunggu Pembayaran*, *Diproses*, *Dikirim*, *Selesai*), input nomor resi pengiriman, serta cetak slip order.

---

## 6. Kebutuhan Non-Fungsional (Non-Functional Requirements)

* **Performa**: Waktu respon API backend rata-rata di bawah 300ms. Asset gambar cover buku harus dioptimasi otomatis (format WebP/AVIF dengan kompresi terukur).
* **Responsivitas**: Desain antarmuka *mobile-first* yang adaptif untuk perangkat smartphone, tablet, dan desktop.
* **Keamanan**:
  * Enkripsi HTTPS/TLS wajib di seluruh halaman.
  * Penyimpanan password menggunakan hashing kuat (Argon2 / Bcrypt).
  * Sanitasi input untuk mencegah serangan SQL Injection dan Cross-Site Scripting (XSS).
* **SEO & Metadata**: Menggunakan Open Graph tags dan Schema.org type `Book` agar informasi judul, harga, dan rating terindeks optimal di mesin pencari.

---

## 7. Desain & Alur Pengguna (User Flow)

### 7.1 Pembelian Mandiri (Web Checkout)
1. Pembeli membuka katalog $\rightarrow$ Menggunakan filter/pencarian $\rightarrow$ Memilih buku.
2. Membaca detail spesifikasi & sinopsis $\rightarrow$ Menekan **Tambah ke Keranjang**.
3. Membuka keranjang $\rightarrow$ Klik **Checkout**.
4. Mengisi data penerima & alamat lengkap $\rightarrow$ Memilih ekspedisi dan layanan pengiriman.
5. Memilih metode pembayaran (QRIS/VA) $\rightarrow$ Melakukan transfer sesuai nominal.
6. Webhook memvalidasi pembayaran $\rightarrow$ Status pesanan berubah menjadi *Lunas/Diproses* $\rightarrow$ Email notifikasi terkirim.

### 7.2 Pembelian Alternatif (Direct WhatsApp)
1. Pembeli membuka halaman buku $\rightarrow$ Klik **Tanya / Pesan via WhatsApp**.
2. Aplikasi dialihkan ke WhatsApp CS dengan pesan otomatis:
   > *"Halo Admin, saya ingin memesan buku: [Judul Buku] (ID: [ID Buku]). Mohon info total harga dan ongkir ke [Kecamatan, Kota]."*
3. Admin CS melanjutkan konfirmasi manual dan memberikan no. rekening toko.