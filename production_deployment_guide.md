# Panduan Deployment Produksi & Operasional: Jendela Buku
**Website Toko Buku Akademik & Referensi Ilmiah**

Dokumen ini merupakan panduan teknis langkah-demi-langkah untuk melakukan peluncuran dan *deployment* website **Jendela Buku** ke lingkungan produksi (*production*).

---

## 1. Arsitektur Lingkungan Produksi

* **Frontend Storefront**: Next.js 14+ (App Router, SSR, TypeScript, Tailwind CSS, Zustand)
  - *Platform Rekomendasi*: Vercel / Cloudflare Pages / VPS Ubuntu dengan Node.js standalone & PM2.
  - *Domain Target*: `https://jendelabuku.com`
* **Backend REST API**: Laravel 11 (PHP 8.2+, Eloquent ORM, Laravel Sanctum, Midtrans SDK)
  - *Platform Rekomendasi*: VPS Ubuntu 24.04 LTS (Nginx, PHP-FPM, Supervisor, UFW Firewall).
  - *Domain Target*: `https://api.jendelabuku.com`
* **Basis Data**: MySQL 8.0+ / Managed Cloud Database (RDS / DigitalOcean Managed DB)
  - *Collation*: `utf8mb4_unicode_ci`

---

## 2. Panduan Setup Backend (Laravel 11)

### 2.1 Persyaratan Server VPS
Pastikan dependensi server terpasang:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nginx mysql-server php8.2 php8.2-fpm php8.2-mysql php8.2-mbstring \
php8.2-xml php8.2-bcmath php8.2-curl php8.2-zip php8.2-intl supervisor git unzip curl -y
```

### 2.2 Clone Repositori & Konfigurasi File `.env`
```bash
cd /var/www
git clone <URL_REPOSITORY> jendela_buku
cd jendela_buku/backend

# Salin template environment produksi
cp .env.example .env
nano .env
```
Pastikan variabel kunci berikut terisi:
```ini
APP_NAME="Jendela Buku"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.jendelabuku.com
FRONTEND_URL=https://jendelabuku.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=jendela_buku_prod
DB_USERNAME=jendela_prod_user
DB_PASSWORD=PasswordKuatAcakAnda123!
DB_COLLATION=utf8mb4_unicode_ci

# Kredensial Produksi Midtrans
MIDTRANS_SERVER_KEY=Mid-server-xxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=true
```

### 2.3 Instalasi Dependensi & Optimalisasi Cache
```bash
composer install --no-dev --optimize-autoloader
php artisan key:generate --force
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link

# Optimalisasi performa Laravel di produksi
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 2.4 Hak Akses Direktori
```bash
sudo chown -R www-data:www-data /var/www/jendela_buku/backend/storage /var/www/jendela_buku/backend/bootstrap/cache
sudo chmod -R 775 /var/www/jendela_buku/backend/storage /var/www/jendela_buku/backend/bootstrap/cache
```

### 2.5 Konfigurasi Nginx untuk Backend API
Buat file konfigurasi `/etc/nginx/sites-available/api.jendelabuku.com`:
```nginx
server {
    listen 80;
    server_name api.jendelabuku.com;
    root /var/www/jendela_buku/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    index index.php;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```
Aktifkan dan pasang sertifikat SSL:
```bash
sudo ln -s /etc/nginx/sites-available/api.jendelabuku.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d api.jendelabuku.com
```

---

## 3. Panduan Setup Frontend (Next.js 14+)

### 3.1 Opsi A: Deployment via Vercel (Rekomendasi)
1. Hubungkan repositori GitHub ke akun Vercel.
2. Atur **Root Directory** ke `frontend`.
3. Tambahkan **Environment Variables** di dashboard Vercel:
   - `NEXT_PUBLIC_APP_NAME`: `Jendela Buku`
   - `NEXT_PUBLIC_APP_URL`: `https://jendelabuku.com`
   - `NEXT_PUBLIC_API_URL`: `https://api.jendelabuku.com/api/v1`
   - `NEXT_PUBLIC_STORAGE_URL`: `https://api.jendelabuku.com/storage`
   - `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`: `Mid-client-xxxxxxxxxxxx`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`: `6281234567890`
4. Klik **Deploy**. Vercel akan otomatis meng-compile dan mengaktifkan CDN edge global.

### 3.2 Opsi B: Deployment via VPS (Node.js & PM2)
```bash
cd /var/www/jendela_buku/frontend
cp .env.example .env.production
# Sesuaikan variabel URL di file .env.production
npm install --production=false
npm run build
pm2 start npm --name "jendela-buku-fe" -- start -- -p 3000
pm2 save
pm2 startup
```

---

## 4. Konfigurasi Midtrans Payment Gateway (Mode Produksi)

1. Masuk ke portal **Midtrans Merchant Dashboard** (`https://dashboard.midtrans.com`).
2. Pastikan akun telah aktif (*Live Mode*).
3. Buka menu **Settings > Access Keys**:
   - Salin **Server Key** ke `MIDTRANS_SERVER_KEY` di `backend/.env`.
   - Salin **Client Key** ke `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` di `frontend/.env`.
4. Buka menu **Settings > Configuration**:
   - Masukkan **Payment Notification URL**: `https://api.jendelabuku.com/api/v1/webhooks/payment`
   - Masukkan **Finish Redirect URL**: `https://jendelabuku.com/order`
   - Aktifkan metode pembayaran yang diinginkan (QRIS, BCA VA, BNI VA, BRI VA, Mandiri Bill, ShopeePay, GoPay, Kartu Kredit).

---

## 5. Pemeliharaan, Keamanan & Pencadangan Rutin

### 5.1 Skrip Backup Otomatis Basis Data MySQL
Tambahkan cron job (`crontab -e`):
```bash
# Backup database setiap pukul 02:00 dini hari
0 2 * * * mysqldump -u jendela_prod_user -p'PasswordKuatAcakAnda123!' jendela_buku_prod | gzip > /var/backups/db_jendela_$(date +\%F).sql.gz
```

### 5.2 Checklist Verifikasi Pasca-Peluncuran (Smoke Testing)
- [x] Akses `https://jendelabuku.com` (Homepage memuat katalog, header, dan footer tanpa jeda).
- [x] Pengujian fitur pencarian buku dan navigasi kategori perguruan tinggi.
- [x] Transaksi uji coba checkout dengan metode pembayaran QRIS Midtrans.
- [x] Verifikasi notifikasi webhook pelunasan instan dan pengurangan stok buku.
- [x] Akses panel admin `https://jendelabuku.com/admin/login` dengan akun resmi administrator.
- [x] Pengujian input nomor resi kurir dan pencetakan faktur/surat jalan.
