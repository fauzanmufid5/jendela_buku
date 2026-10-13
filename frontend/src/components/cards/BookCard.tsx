'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Check, MessageCircle, Star } from 'lucide-react';
import { Book } from '@/types';
import { formatRupiah, createWhatsAppOrderUrl } from '@/lib/utils';
import { useCartStore } from '@/stores/useCartStore';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(book, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const whatsappUrl = createWhatsAppOrderUrl(book.title, book.slug, book.final_price);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Thumbnail Aspect Ratio 3:4 */}
      <Link href={`/buku/${book.slug}`} className="relative aspect-3/4 bg-slate-100 overflow-hidden block">
        <Image
          src={book.cover_image_url}
          alt={book.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Badges Container */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {book.discount_percentage > 0 && (
            <span className="bg-[#f97316] text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
              -{book.discount_percentage}%
            </span>
          )}
          {book.is_best_seller && (
            <span className="bg-[#0f2942] text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-amber-300" />
              Best Seller
            </span>
          )}
        </div>

        {/* Hover Quick WhatsApp Action Pill */}
        <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-center z-10">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-[#16a34a]/95 hover:bg-[#15803d] text-white text-xs font-bold py-2 px-3 rounded-xl shadow-lg flex items-center justify-center gap-1.5 backdrop-blur-xs transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Pesan Cepat via WA</span>
          </a>
        </div>
      </Link>

      {/* Book Metadata & Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span className="truncate">{book.category?.name || 'Buku Akademik'}</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
              {book.format === 'paperback' ? 'Cetak' : book.format}
            </span>
          </div>

          {/* Title */}
          <Link href={`/buku/${book.slug}`}>
            <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-[#2563eb] transition-colors" title={book.title}>
              {book.title}
            </h3>
          </Link>

          {/* Author */}
          <p className="text-xs text-slate-500 line-clamp-1 mt-1" title={book.author}>
            {book.author}
          </p>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="pt-2 border-t border-slate-100 flex items-end justify-between gap-2">
          <div>
            {book.sale_price && (
              <span className="text-[11px] text-slate-400 line-through block">
                {formatRupiah(book.regular_price)}
              </span>
            )}
            <span className="text-base font-extrabold text-[#ea580c]">
              {formatRupiah(book.final_price)}
            </span>
          </div>

          {/* Quick Cart Button */}
          <button
            onClick={handleAddToCart}
            className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center shrink-0 ${
              added
                ? 'bg-emerald-600 text-white scale-105'
                : 'bg-slate-100 hover:bg-[#0f2942] text-slate-700 hover:text-white'
            }`}
            title={added ? 'Tersimpan di keranjang' : 'Tambah ke Keranjang'}
          >
            {added ? (
              <Check className="w-4 h-4 animate-scale-in" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
