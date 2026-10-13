'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, 
  Check, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  BookOpen, 
  Star, 
  Layers, 
  FileText, 
  Package, 
  Calendar,
  CreditCard,
  Minus,
  Plus,
  Share2
} from 'lucide-react';
import { Book } from '@/types';
import { formatRupiah, formatWeight, createWhatsAppOrderUrl } from '@/lib/utils';
import { useCartStore } from '@/stores/useCartStore';
import BookCard from '@/components/cards/BookCard';

interface BookDetailClientProps {
  book: Book;
  relatedBooks: Book[];
}

export default function BookDetailClient({ book, relatedBooks }: BookDetailClientProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'synopsis' | 'specs' | 'toc'>('synopsis');
  const [isAdded, setIsAdded] = useState(false);
  const [copied, setCopied] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (book.stock > 0 && quantity < book.stock) {
      setQuantity(quantity + 1);
    } else if (book.stock === 0) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    addItem(book, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(book, quantity);
    router.push('/cart');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const whatsappUrl = createWhatsAppOrderUrl(book.title, book.slug, book.final_price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 overflow-x-auto whitespace-nowrap pb-1">
        <Link href="/" className="hover:text-[#0f2942] transition-colors">Beranda</Link>
        <span>/</span>
        <Link href="/katalog" className="hover:text-[#0f2942] transition-colors">Katalog</Link>
        {book.category && (
          <>
            <span>/</span>
            <Link 
              href={`/katalog?category=${book.category.slug}`}
              className="hover:text-[#f97316] font-medium transition-colors"
            >
              {book.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="font-bold text-slate-800 truncate max-w-xs">{book.title}</span>
      </nav>

      {/* Main 2-Column Product Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
        {/* Left Column: Book Cover Gallery */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-md">
            <div className="relative aspect-3/4 w-full rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
              <Image
                src={book.cover_image_url}
                alt={book.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />

              {/* Badges on cover */}
              <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                {book.discount_percentage > 0 && (
                  <span className="bg-[#f97316] text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md">
                    Hemat {book.discount_percentage}%
                  </span>
                )}
                {book.is_best_seller && (
                  <span className="bg-[#0f2942] text-amber-300 text-xs font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    Best Seller
                  </span>
                )}
              </div>
            </div>

            {/* Share and packaging assurance */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Produk Original Ber-ISBN</span>
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1 hover:text-[#0f2942] transition-colors font-medium"
                title="Salin Tautan Buku"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? 'Tautan Disalin!' : 'Bagikan'}</span>
              </button>
            </div>
          </div>

          {/* Value Guarantee Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-orange-500 shrink-0" />
              <span>Pengemasan aman berlapis kardus tebal &amp; bubble wrap</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Pilihan kurir lengkap: JNE, SiCepat, J&amp;T Express &amp; POS</span>
            </div>
          </div>
        </div>

        {/* Right Column: Book Metadata, Price & Dual Checkout Actions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Metadata */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-blue-50 text-blue-700 font-bold text-xs px-2.5 py-1 rounded-lg">
                {book.category?.name || 'Katalog Akademik'}
              </span>
              <span className="bg-slate-100 text-slate-600 font-medium text-xs px-2.5 py-1 rounded-lg">
                Format: {book.format === 'paperback' ? 'Buku Cetak (Paperback)' : book.format}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0f2942] tracking-tight leading-tight">
              {book.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-600">
              <p>
                <span className="text-slate-400">Penulis: </span>
                <strong className="text-slate-900">{book.author}</strong>
              </p>
              <p>
                <span className="text-slate-400">Penerbit: </span>
                <strong className="text-slate-900">{book.publisher}</strong>
              </p>
              {book.published_year && (
                <p>
                  <span className="text-slate-400">Tahun: </span>
                  <strong className="text-slate-900">{book.published_year}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-[#ea580c]">
                {formatRupiah(book.final_price)}
              </span>
              {book.sale_price && (
                <span className="text-base text-slate-400 line-through">
                  {formatRupiah(book.regular_price)}
                </span>
              )}
            </div>

            {book.discount_percentage > 0 && (
              <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md inline-block">
                Hemat {formatRupiah(book.regular_price - book.final_price)} ({book.discount_percentage}% OFF)
              </p>
            )}

            {/* Stock indicator */}
            <div className="pt-2 flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {book.stock > 0 ? (
                <span className="text-emerald-700 font-bold">
                  Stok Tersedia di Gudang ({book.stock} eksemplar)
                </span>
              ) : (
                <span className="text-rose-600 font-bold">Stok Habis / Hubungi CS</span>
              )}
            </div>
          </div>

          {/* Quantity Selector & Dual Actions */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5">
            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">Jumlah Pesanan:</span>
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                  className="p-2.5 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                >
                  <Minus className="w-4 h-4 text-slate-700" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={book.stock > 0 && quantity >= book.stock}
                  className="p-2.5 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-4 h-4 text-slate-700" />
                </button>
              </div>
              <span className="text-xs text-slate-400">
                Total Berat: {formatWeight(book.weight_grams * quantity)}
              </span>
            </div>

            {/* Dual CTAs (Web Checkout & Direct WhatsApp) */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#f97316] hover:bg-[#ea580c] text-white hover:shadow-md'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Berhasil Ditambahkan!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>+ Tambah ke Keranjang</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-3.5 px-4 rounded-xl bg-[#0f2942] hover:bg-[#1a446c] text-white text-sm font-bold transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-orange-400" />
                  <span>Beli Sekarang</span>
                </button>
              </div>

              {/* Direct WhatsApp Order Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow"
              >
                <MessageCircle className="w-5 h-5 fill-white text-[#16a34a]" />
                <span>Pesan Cepat via WhatsApp CS</span>
              </a>
              <p className="text-[11px] text-center text-slate-400">
                Layanan CS WhatsApp siap membantu konfirmasi stok, ongkir, dan transfer rekening manual.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Information Section (Sinopsis, Spesifikasi Teknis, Daftar Isi) */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 mb-16">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 gap-4 sm:gap-8 overflow-x-auto whitespace-nowrap mb-6">
          <button
            onClick={() => setActiveTab('synopsis')}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === 'synopsis'
                ? 'text-[#0f2942] border-b-2 border-[#0f2942]'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-orange-500" />
              Sinopsis &amp; Deskripsi
            </span>
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === 'specs'
                ? 'text-[#0f2942] border-b-2 border-[#0f2942]'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Detail Spesifikasi Teknis
            </span>
          </button>

          <button
            onClick={() => setActiveTab('toc')}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === 'toc'
                ? 'text-[#0f2942] border-b-2 border-[#0f2942]'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              Daftar Isi Buku
            </span>
          </button>
        </div>

        {/* Tab Content: Synopsis */}
        {activeTab === 'synopsis' && (
          <div className="prose max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
            <p className="whitespace-pre-line font-normal">{book.description}</p>
          </div>
        )}

        {/* Tab Content: Technical Specifications Grid */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="flex justify-between py-2.5 px-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500">Judul Buku</span>
              <strong className="text-slate-900 text-right">{book.title}</strong>
            </div>
            <div className="flex justify-between py-2.5 px-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500">Penulis Utama</span>
              <strong className="text-slate-900 text-right">{book.author}</strong>
            </div>
            <div className="flex justify-between py-2.5 px-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500">Penerbit</span>
              <strong className="text-slate-900">{book.publisher}</strong>
            </div>
            <div className="flex justify-between py-2.5 px-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500">Nomor ISBN</span>
              <strong className="text-slate-900">{book.isbn || 'Tersedia di Versi Cetak'}</strong>
            </div>
            <div className="flex justify-between py-2.5 px-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500">Jumlah Halaman</span>
              <strong className="text-slate-900">{book.pages} Halaman</strong>
            </div>
            <div className="flex justify-between py-2.5 px-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500">Dimensi / Ukuran</span>
              <strong className="text-slate-900">{book.dimensions || '15.5 x 23 cm (UNESCO)'}</strong>
            </div>
            <div className="flex justify-between py-2.5 px-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500">Berat Barang</span>
              <strong className="text-slate-900">{formatWeight(book.weight_grams)}</strong>
            </div>
            <div className="flex justify-between py-2.5 px-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500">Jenis Kertas</span>
              <strong className="text-slate-900">Bookpaper 72 GSM Premium</strong>
            </div>
            <div className="flex justify-between py-2.5 px-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500">Tahun Terbit</span>
              <strong className="text-slate-900">{book.published_year || 2026}</strong>
            </div>
            <div className="flex justify-between py-2.5 px-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500">Format Jilid</span>
              <strong className="text-slate-900 capitalize">{book.format} (Softcover)</strong>
            </div>
          </div>
        )}

        {/* Tab Content: Table of Contents */}
        {activeTab === 'toc' && (
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 font-mono text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
            {book.table_of_contents || (
              <p className="text-slate-400 italic">Daftar isi sedang dimuat atau dapat diminta langsung via WhatsApp CS.</p>
            )}
          </div>
        )}
      </section>

      {/* Related Books Section */}
      {relatedBooks && relatedBooks.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Koleksi Terkait
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0f2942] tracking-tight mt-1">
                Rekomendasi Buku Sejenis
              </h2>
            </div>
            {book.category && (
              <Link
                href={`/katalog?category=${book.category.slug}`}
                className="text-xs font-bold text-[#2563eb] hover:underline"
              >
                Lihat Kategori {book.category.name} &rarr;
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedBooks.map((relBook) => (
              <BookCard key={relBook.id} book={relBook} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 z-40 shadow-2xl flex items-center gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-[35%] py-3 px-2 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shrink-0"
        >
          <MessageCircle className="w-4 h-4 fill-white text-[#16a34a]" />
          <span>WhatsApp</span>
        </a>

        <button
          onClick={handleAddToCart}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            isAdded
              ? 'bg-emerald-600 text-white'
              : 'bg-[#f97316] hover:bg-[#ea580c] text-white shadow-md'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span>Ditambahkan</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>+ Keranjang ({formatRupiah(book.final_price)})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
