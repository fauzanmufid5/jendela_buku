'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  HelpCircle,
  BookOpen,
  ArrowLeft,
  MessageCircle
} from 'lucide-react';
import { useCartStore } from '@/stores/useCartStore';
import { formatRupiah } from '@/lib/utils';

export default function CartClient() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalWeight, getTotalItems } = useCartStore();

  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const totalWeightGrams = getTotalWeight();
  const totalWeightKg = (totalWeightGrams / 1000).toFixed(2);

  // Generate WhatsApp text for cart
  const waCartText = `Halo CS Jendela Buku, saya ingin memesan buku berikut dari keranjang belanja:%0A%0A` +
    items.map((i, idx) => `${idx + 1}. ${i.book.title} (${i.quantity} eks) - Rp ${(i.book.final_price * i.quantity).toLocaleString('id-ID')}`).join('%0A') +
    `%0A%0ATotal Buku: ${totalItems} eks%0ATotal Harga: Rp ${totalPrice.toLocaleString('id-ID')}%0AEstimasi Berat: ${totalWeightKg} kg%0A%0AMohon bantu proses pesanannya. Terima kasih!`;
  const waCartUrl = `https://wa.me/6281234567890?text=${waCartText}`;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-serif font-bold text-gray-900 mb-3">
          Keranjang Belanja Anda Masih Kosong
        </h1>
        <p className="text-gray-600 max-w-md mx-auto mb-8 text-sm lg:text-base leading-relaxed">
          Temukan ribuan referensi ilmiah, buku ajar perguruan tinggi, monograf, dan literatur akademik terbaik untuk mendukung riset dan studi Anda.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/katalog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary-900 hover:bg-primary-800 text-white font-medium rounded-xl shadow-md transition-all duration-200"
          >
            <BookOpen className="w-5 h-5" />
            Jelajahi Katalog Buku
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Breadcrumb & Header */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Beranda</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Keranjang Belanja</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
            Keranjang Belanja
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Anda memiliki <span className="font-semibold text-primary-900">{totalItems} item</span> dalam keranjang
          </p>
        </div>

        <button
          onClick={clearCart}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium py-1.5 px-3 rounded-lg border border-red-200 hover:bg-red-50 transition-colors self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          Kosongkan Keranjang
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {items.map((item) => {
                const book = item.book;
                const price = book.final_price || book.sale_price || book.regular_price;
                const hasDiscount = book.sale_price && book.sale_price < book.regular_price;
                const subtotal = price * item.quantity;

                return (
                  <div key={book.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between hover:bg-gray-50/50 transition-colors">
                    {/* Book Thumbnail & Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <Link 
                        href={`/buku/${book.slug}`}
                        className="relative w-20 sm:w-24 aspect-[3/4] flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm group"
                      >
                        {book.cover_image_url ? (
                          <Image
                            src={book.cover_image_url}
                            alt={book.title}
                            fill
                            sizes="(max-width: 640px) 80px, 96px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <BookOpen className="w-8 h-8" />
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0 space-y-1">
                        {book.category && (
                          <span className="inline-block text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-primary-50 text-primary-700">
                            {book.category.name}
                          </span>
                        )}
                        <Link 
                          href={`/buku/${book.slug}`}
                          className="block text-sm sm:text-base font-semibold text-gray-900 hover:text-primary-700 transition-colors line-clamp-2"
                        >
                          {book.title}
                        </Link>
                        <p className="text-xs text-gray-500">
                          Penulis: <span className="text-gray-700">{book.author}</span>
                        </p>
                        <p className="text-xs text-gray-400">
                          Berat: {book.weight_grams} g/eks • Stok: {book.stock}
                        </p>

                        {/* Price on mobile */}
                        <div className="sm:hidden pt-2 flex items-baseline gap-2">
                          <span className="text-sm font-bold text-gray-900">
                            {formatRupiah(price)}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatRupiah(book.regular_price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Unit Price (Desktop) */}
                    <div className="hidden sm:block text-right min-w-[100px]">
                      <div className="text-sm font-bold text-gray-900">
                        {formatRupiah(price)}
                      </div>
                      {hasDiscount && (
                        <div className="text-xs text-gray-400 line-through">
                          {formatRupiah(book.regular_price)}
                        </div>
                      )}
                    </div>

                    {/* Quantity Selector & Item Subtotal */}
                    <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                        <button
                          type="button"
                          onClick={() => updateQuantity(book.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                          aria-label="Kurangi kuantitas"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs sm:text-sm font-semibold text-gray-800 min-w-[32px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(book.id, item.quantity + 1)}
                          disabled={book.stock > 0 && item.quantity >= book.stock}
                          className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                          aria-label="Tambah kuantitas"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[110px]">
                        <div className="text-sm sm:text-base font-bold text-primary-900">
                          {formatRupiah(subtotal)}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {(book.weight_grams * item.quantity)} g
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(book.id)}
                        className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Hapus buku"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick link back */}
          <div className="pt-2">
            <Link
              href="/katalog"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-800 hover:text-primary-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Lanjut Pilih Buku Lainnya
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sticky top-24 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">
              Ringkasan Pesanan
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Total Buku</span>
                <span className="font-semibold text-gray-900">{totalItems} eksemplar</span>
              </div>

              <div className="flex justify-between text-gray-600 items-center">
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-gray-400" />
                  Estimasi Berat Total
                </span>
                <span className="font-semibold text-gray-900">
                  {totalWeightKg} kg ({totalWeightGrams} g)
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Subtotal Harga Buku</span>
                <span className="font-semibold text-gray-900">{formatRupiah(totalPrice)}</span>
              </div>

              <div className="pt-2 text-xs text-gray-400 border-t border-dashed border-gray-200">
                * Ongkos kirim dihitung otomatis pada langkah Checkout berdasarkan alamat tujuan & kurir pilihan.
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-base font-bold text-gray-900">Estimasi Total</span>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-primary-900">
                    {formatRupiah(totalPrice)}
                  </span>
                  <p className="text-[11px] text-gray-400">+ Ongkos kirim di checkout</p>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={() => router.push('/checkout')}
                className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all duration-200 text-base"
              >
                Lanjut ke Pembayaran
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Direct WhatsApp CS Option */}
              <a
                href={waCartUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors text-xs sm:text-sm text-center"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                Pesan Cepat via WhatsApp CS
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 border-t border-gray-100 space-y-2.5 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>100% Buku Asli Terbitan Deepublish / Penerbit Resmi</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary-600 flex-shrink-0" />
                <span>Pengiriman ke Seluruh Indonesia (JNE, SiCepat, J&T, POS)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
