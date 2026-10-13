import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  BookMarked, 
  ShieldCheck, 
  Truck, 
  MessageCircle, 
  CheckCircle2, 
  Building2,
  GraduationCap
} from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import BookCard from '@/components/cards/BookCard';
import CategoryCard from '@/components/cards/CategoryCard';
import { Book, Category } from '@/types';

// Server-side data fetching with graceful fallback for build-time safety
async function getHomeData(): Promise<{ categories: Category[]; bestSellers: Book[]; latestBooks: Book[] }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  try {
    const [catRes, bestRes, latestRes] = await Promise.all([
      fetch(`${apiUrl}/categories`, { next: { revalidate: 60 } }),
      fetch(`${apiUrl}/books?sort=bestseller&limit=8`, { next: { revalidate: 60 } }),
      fetch(`${apiUrl}/books?sort=newest&limit=4`, { next: { revalidate: 60 } }),
    ]);

    if (!catRes.ok || !bestRes.ok) {
      throw new Error('API response not ok');
    }

    const categoriesData = await catRes.json();
    const bestData = await bestRes.json();
    const latestData = latestRes.ok ? await latestRes.json() : { data: [] };

    return {
      categories: categoriesData.data || [],
      bestSellers: bestData.data || [],
      latestBooks: latestData.data || [],
    };
  } catch {
    // Fallback static data if backend is offline during build
    return {
      categories: [
        { id: 1, name: 'Komputer & Teknologi', slug: 'komputer-teknologi', description: 'Informatika, rekayasa perangkat lunak, dan kecerdasan buatan.', books_count: 7 },
        { id: 2, name: 'Teknik & Sains', slug: 'teknik-sains', description: 'Teknik sipil, mesin, elektro, dan ilmu rekayasa terapan.', books_count: 6 },
        { id: 3, name: 'Kedokteran & Kesehatan', slug: 'kedokteran-kesehatan', description: 'Literatur medis, keperawatan, farmasi, dan kesehatan.', books_count: 6 },
        { id: 4, name: 'Ekonomi & Bisnis', slug: 'ekonomi-bisnis', description: 'Manajemen, akuntansi, perpajakan, dan kewirausahaan.', books_count: 6 },
        { id: 5, name: 'Hukum & Sosial', slug: 'hukum-sosial', description: 'Hukum perdata, pidana, korupsi, dan kontrak bisnis.', books_count: 4 },
        { id: 6, name: 'Pendidikan & Humaniora', slug: 'pendidikan-humaniora', description: 'Metode riset ilmiah, statistika, dan artikel Scopus.', books_count: 4 },
      ],
      bestSellers: [
        {
          id: 1,
          category_id: 1,
          title: 'Pemrograman Python Modern untuk Pemula dan Akademisi',
          slug: 'pemrograman-python-modern-untuk-pemula-dan-akademisi',
          author: 'Dr. Ir. Hendra Gunawan, S.Kom., M.T.',
          publisher: 'Penerbit Deepublish',
          isbn: '978-623-02-8101-2',
          pages: 280,
          format: 'paperback',
          regular_price: 110000,
          sale_price: 93500,
          final_price: 93500,
          discount_percentage: 15,
          stock: 45,
          weight_grams: 380,
          cover_image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
          description: 'Panduan lengkap bahasa Python dari dasar hingga riset komputasi.',
          is_best_seller: true,
          is_active: true,
        },
        {
          id: 2,
          category_id: 1,
          title: 'Kecerdasan Buatan dan Deep Learning: Teori dan Implementasi PyTorch',
          slug: 'kecerdasan-buatan-dan-deep-learning-teori-dan-implementasi-pytorch',
          author: 'Prof. Dr. Aries Setiawan, M.Sc.',
          publisher: 'Penerbit Deepublish',
          isbn: '978-623-02-8102-9',
          pages: 340,
          format: 'paperback',
          regular_price: 135000,
          sale_price: 114750,
          final_price: 114750,
          discount_percentage: 15,
          stock: 30,
          weight_grams: 450,
          cover_image_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80',
          description: 'Prinsip neural networks dan deep learning terapan.',
          is_best_seller: true,
          is_active: true,
        },
        {
          id: 3,
          category_id: 2,
          title: 'Perancangan Struktur Beton Bertulang Berdasarkan SNI 2847:2019',
          slug: 'perancangan-struktur-beton-bertulang-berdasarkan-sni-28472019',
          author: 'Prof. Dr. Ir. Suyono, M.S.CE',
          publisher: 'Penerbit Deepublish',
          isbn: '978-623-02-8201-9',
          pages: 410,
          format: 'paperback',
          regular_price: 155000,
          sale_price: 131750,
          final_price: 131750,
          discount_percentage: 15,
          stock: 18,
          weight_grams: 580,
          cover_image_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80',
          description: 'Analisis struktur beton bertulang sesuai SNI terbaru.',
          is_best_seller: true,
          is_active: true,
        },
        {
          id: 4,
          category_id: 3,
          title: 'Buku Ajar Keperawatan Gawat Darurat dan Manajemen Bencana',
          slug: 'buku-ajar-keperawatan-gawat-darurat-dan-manajemen-bencana',
          author: 'Ns. Siti Rahmawati, M.Kep., Sp.Kep.MB',
          publisher: 'Penerbit Deepublish',
          isbn: '978-623-02-8301-6',
          pages: 310,
          format: 'paperback',
          regular_price: 125000,
          sale_price: 106250,
          final_price: 106250,
          discount_percentage: 15,
          stock: 40,
          weight_grams: 410,
          cover_image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
          description: 'Panduan klinis asuhan gawat darurat dan bencana.',
          is_best_seller: true,
          is_active: true,
        },
      ],
      latestBooks: [],
    };
  }
}

export default async function HomePage() {
  const { categories, bestSellers } = await getHomeData();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0f2942] via-[#1a446c] to-[#0f2942] text-white py-16 lg:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-orange-300 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  Penerbit Resmi Deepublish Partner Store
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
                  Pusat Buku Referensi <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-200">
                    &amp; Karya Ilmiah Kampus
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-200 max-w-2xl font-normal leading-relaxed">
                  Menyediakan buku ajar, monograf, buku panduan kuliah, dan metode penelitian terlengkap. Setiap buku terverifikasi ISBN resmi dengan kemudahan order via web checkout mandiri atau pesan kilat via WhatsApp CS.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/katalog"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-bold shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02]"
                  >
                    <BookMarked className="w-4 h-4" />
                    <span>Jelajahi Katalog Buku</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>

                  <a
                    href="https://wa.me/6281234567890?text=Halo%20Admin%20Jendela%20Buku%2C%20saya%20ingin%20konsultasi%20pembelian%20buku"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold backdrop-blur-md transition-all hover:scale-[1.02]"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Konsultasi via WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Hero Banner Feature Card */}
              <div className="lg:col-span-5">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative">
                  <div className="absolute -top-4 -right-4 bg-[#f97316] text-white text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl shadow-md rotate-3">
                    Diskon s/d 20%
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-400">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">Promo Awal Semester</h3>
                      <p className="text-xs text-slate-300">Untuk Mahasiswa, Dosen &amp; Peneliti</p>
                    </div>
                  </div>

                  <ul className="space-y-3.5 text-xs sm:text-sm text-slate-200">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Katalog 30+ bidang keilmuan spesifik &amp; terstruktur</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Kalkulasi ongkir otomatis kurir JNE, SiCepat, J&amp;T &amp; POS</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Spesifikasi lengkap: ISBN, jumlah halaman, dan sinopsis</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Tersedia pembayaran otomatis (QRIS, VA) &amp; pesanan WhatsApp</span>
                    </li>
                  </ul>

                  <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                    <span>Pengiriman dari:</span>
                    <span className="font-bold text-white">Yogyakarta &bull; Jakarta</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-[#f97316] uppercase tracking-wider">
                Navigasi Keilmuan
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2942] tracking-tight mt-1">
                Kategori Buku Populer
              </h2>
            </div>
            <Link
              href="/katalog"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563eb] hover:text-[#1a446c] transition-colors"
            >
              <span>Lihat Semua Bidang Ilmu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        {/* Best Seller Section */}
        <section className="py-16 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider bg-orange-50 px-2.5 py-1 rounded-md">
                  Paling Banyak Dicari
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2942] tracking-tight mt-2">
                  Buku Akademik Terlaris (Best Seller)
                </h2>
              </div>
              <Link
                href="/katalog?sort=bestseller"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563eb] hover:text-[#1a446c] transition-colors"
              >
                <span>Lihat Koleksi Terlaris</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
              {bestSellers.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>

        {/* Institutional / B2B Section */}
        <section className="py-16 bg-[#f1f5f9]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-[#0f2942] to-[#1a446c] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
              <div className="max-w-2xl space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-orange-300">
                  <Building2 className="w-3.5 h-3.5" />
                  Layanan Khusus Instansi &amp; Kampus
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  Pengadaan Buku Perpustakaan &amp; Hibah Riset B2B
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed font-light">
                  Kami melayani pengadaan buku dalam jumlah besar (*bulk order*) untuk perpustakaan perguruan tinggi, fakultas, laboratorium, dan instansi penelitian dengan faktur pajak dan invoice resmi.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <a
                    href="https://wa.me/6281234567890?text=Halo%20Admin%20Jendela%20Buku%2C%20kami%20ingin%20mengajukan%20pengadaan%20buku%20perpustakaan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold transition-all shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Hubungi CS Pengadaan Kampus</span>
                  </a>
                  <Link
                    href="/katalog"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
                  >
                    <span>Jelajahi Judul Tersedia</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
