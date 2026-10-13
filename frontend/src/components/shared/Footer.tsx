import Link from 'next/link';
import { BookOpen, Mail, Phone, MapPin, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0f2942] text-slate-300 text-xs border-t border-slate-800">
      {/* Upper Footer: Value Props Banner */}
      <div className="border-b border-slate-800/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-orange-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">100% Original</p>
                <p className="text-[11px] text-slate-400">Garansi buku asli langsung dari penerbit resmi.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Layanan CS Ramah</p>
                <p className="text-[11px] text-slate-400">Konsultasi judul &amp; pemesanan cepat via WhatsApp.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-blue-400 shrink-0">
                <span className="font-bold text-sm">EXP</span>
              </div>
              <div>
                <p className="font-bold text-white text-sm">Kurir Terpercaya</p>
                <p className="text-[11px] text-slate-400">JNE, SiCepat, J&amp;T &amp; POS menjangkau seluruh pelosok.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
                <span className="font-bold text-sm">PAY</span>
              </div>
              <div>
                <p className="font-bold text-white text-sm">Pembayaran Aman</p>
                <p className="text-[11px] text-slate-400">QRIS instan dan Virtual Account bank nasional.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a446c] to-[#2563eb] flex items-center justify-center text-white shadow-md">
                <BookOpen className="w-5 h-5 text-[#f97316]" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Jendela<span className="text-[#f97316]">Buku</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              Platform toko buku referensi akademis terkemuka di Indonesia. Bekerja sama dengan penerbit terpercaya Deepublish untuk menyediakan buku ajar, modul kuliah, dan monograf riset berkualitas tinggi.
            </p>
            <div className="space-y-2 text-slate-300 text-xs pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Yogyakarta &bull; DKI Jakarta, Indonesia</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WhatsApp: +62 812-3456-7890 (Senin - Sabtu 08:00 - 17:00 WIB)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>cs@jendelabuku.com</span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">Navigasi Toko</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/" className="hover:text-white transition-colors">Beranda</Link></li>
              <li><Link href="/katalog" className="hover:text-white transition-colors">Semua Buku</Link></li>
              <li><Link href="/katalog?sort=bestseller" className="hover:text-white transition-colors">Buku Terlaris</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Keranjang Belanja</Link></li>
              <li><Link href="/katalog?sort=price_asc" className="hover:text-white transition-colors">Buku Promo Diskon</Link></li>
            </ul>
          </div>

          {/* Bidang Keilmuan */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">Bidang Ilmu</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/katalog?category=komputer-teknologi" className="hover:text-white transition-colors">Teknologi &amp; Informatika</Link></li>
              <li><Link href="/katalog?category=teknik-sains" className="hover:text-white transition-colors">Teknik Sipil &amp; Rekayasa</Link></li>
              <li><Link href="/katalog?category=kedokteran-kesehatan" className="hover:text-white transition-colors">Kedokteran &amp; Farmasi</Link></li>
              <li><Link href="/katalog?category=ekonomi-bisnis" className="hover:text-white transition-colors">Ekonomi &amp; Akuntansi</Link></li>
              <li><Link href="/katalog?category=hukum-sosial" className="hover:text-white transition-colors">Hukum &amp; Sosial Politik</Link></li>
              <li><Link href="/katalog?category=metodologi-penelitian" className="hover:text-white transition-colors">Metode Penelitian Skripsi</Link></li>
            </ul>
          </div>

          {/* Layanan & B2B */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">Layanan Pengadaan</h4>
            <p className="text-slate-400 text-xs">
              Menerima pesanan pengadaan perpustakaan kampus, hibah penelitian B2B, dan cetak khusus.
            </p>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Jendela%20Buku%2C%20saya%20ingin%20info%20pengadaan%20buku%20perpustakaan%2Fkampus"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold text-center transition-colors"
            >
              Hubungi Tim B2B / Kampus &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 bg-[#0a1b2c] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>&copy; {new Date().getFullYear()} Jendela Buku. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Next.js 14 Frontend</span>
            <span>&bull;</span>
            <span>Laravel 11 REST API</span>
            <span>&bull;</span>
            <span>MySQL 8.0+ Database</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
