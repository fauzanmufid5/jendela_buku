'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  BookOpen, 
  Search, 
  ShoppingCart, 
  MessageCircle, 
  Menu, 
  X, 
  ChevronDown,
  Layers,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { useCartStore } from '@/stores/useCartStore';
import { api } from '@/lib/api';
import { Category } from '@/types';

function NavbarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const cartTotalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    setIsMounted(true);
    // Fetch categories for menu
    api.getCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error('Failed to load categories in navbar:', err));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/katalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    } else {
      router.push('/katalog');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-[#0f2942] text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="bg-[#f97316] text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
              Promo
            </span>
            <span className="text-slate-200">
              Diskon Buku Akademik s/d 20% &bull; Gratis Konsultasi Pengadaan Buku Kampus
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <a 
              href="https://wa.me/6281234567890" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hotline CS: +62 812-3456-7890</span>
            </a>
            <span className="hidden sm:inline text-slate-600">|</span>
            <Link href="/katalog?sort=bestseller" className="hover:text-orange-400 transition-colors">
              Buku Terlaris
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between gap-4 sm:gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0f2942] to-[#1a446c] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6 text-[#f97316]" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-[#0f2942]">
                Jendela<span className="text-[#f97316]">Buku</span>
              </span>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest -mt-1">
                Toko Buku Akademik
              </p>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex flex-1 max-w-xl relative items-center"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul buku, nama penulis, atau nomor ISBN..."
              className="w-full bg-slate-50 border border-slate-300 focus:border-[#0f2942] focus:bg-white text-slate-900 text-sm rounded-xl pl-4 pr-12 py-2.5 transition-all outline-hidden focus:ring-2 focus:ring-[#0f2942]/10"
            />
            <button
              type="submit"
              className="absolute right-1.5 p-2 rounded-lg bg-[#0f2942] hover:bg-[#1a446c] text-white transition-colors"
              title="Cari Buku"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 shrink-0">
            {/* WhatsApp Quick Order Button */}
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Jendela%20Buku%2C%20saya%20ingin%20menanyakan%20katalog%20buku"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#16a34a] border border-emerald-200 text-xs font-bold transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-500 text-emerald-50" />
              <span>Beli via WA</span>
            </a>

            {/* Cart Icon & Counter */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors"
              title="Keranjang Belanja"
            >
              <ShoppingCart className="w-5 h-5 text-[#0f2942]" />
              <span className="hidden sm:inline text-xs font-semibold">Keranjang</span>
              {isMounted && cartTotalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#f97316] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-scale-in">
                  {cartTotalItems}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Category Navigation Bar */}
      <nav className="hidden md:block bg-[#0f2942] text-white text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            {/* Category Mega Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                onBlur={() => setTimeout(() => setIsCategoryOpen(false), 200)}
                className="flex items-center gap-2 px-4 py-3 bg-[#1a446c] hover:bg-[#2563eb] text-white font-bold transition-colors"
              >
                <Layers className="w-4 h-4 text-[#f97316]" />
                <span>Semua Kategori</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Category Dropdown Menu */}
              {isCategoryOpen && (
                <div className="absolute top-full left-0 w-80 bg-white text-slate-900 rounded-b-xl shadow-2xl border border-slate-200 z-50 py-2 divide-y divide-slate-100 animate-fade-in">
                  {categories.map((cat) => (
                    <div key={cat.id} className="p-2">
                      <Link
                        href={`/katalog?category=${cat.slug}`}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-[#0f2942] hover:bg-slate-50 transition-colors"
                        onClick={() => setIsCategoryOpen(false)}
                      >
                        <span>{cat.name}</span>
                        {cat.books_count !== undefined && (
                          <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {cat.books_count}
                          </span>
                        )}
                      </Link>
                      {cat.children && cat.children.length > 0 && (
                        <div className="pl-4 pr-2 py-1 space-y-1">
                          {cat.children.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/katalog?category=${sub.slug}`}
                              className="block px-2 py-1 text-xs text-slate-600 hover:text-[#f97316] hover:bg-orange-50/50 rounded transition-colors"
                              onClick={() => setIsCategoryOpen(false)}
                            >
                              &bull; {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="p-2 bg-slate-50">
                    <Link
                      href="/katalog"
                      className="block text-center text-xs font-bold text-[#2563eb] hover:underline py-1"
                      onClick={() => setIsCategoryOpen(false)}
                    >
                      Lihat Semua Kategori &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="flex items-center gap-1 pl-4">
              <Link 
                href="/katalog" 
                className="px-3 py-3 text-slate-200 hover:text-white hover:bg-white/5 font-medium transition-colors"
              >
                Katalog Lengkap
              </Link>
              <Link 
                href="/katalog?sort=bestseller" 
                className="px-3 py-3 text-slate-200 hover:text-orange-300 hover:bg-white/5 font-medium transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                Best Seller
              </Link>
              <Link 
                href="/katalog?category=komputer-teknologi" 
                className="px-3 py-3 text-slate-200 hover:text-white hover:bg-white/5 font-medium transition-colors"
              >
                Informatika &amp; AI
              </Link>
              <Link 
                href="/katalog?category=teknik-sains" 
                className="px-3 py-3 text-slate-200 hover:text-white hover:bg-white/5 font-medium transition-colors"
              >
                Teknik &amp; Sains
              </Link>
              <Link 
                href="/katalog?category=kedokteran-kesehatan" 
                className="px-3 py-3 text-slate-200 hover:text-white hover:bg-white/5 font-medium transition-colors"
              >
                Kedokteran
              </Link>
              <Link 
                href="/katalog?category=ekonomi-bisnis" 
                className="px-3 py-3 text-slate-200 hover:text-white hover:bg-white/5 font-medium transition-colors"
              >
                Ekonomi
              </Link>
            </div>
          </div>

          <div className="text-slate-400 text-[11px] font-medium hidden xl:block">
            Penerbit Deepublish Partner Store
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-xl">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari buku atau penulis..."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl pl-4 pr-10 py-2.5 outline-hidden"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 p-1.5 bg-[#0f2942] text-white rounded-lg"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Mobile Navigation Links */}
          <div className="space-y-1 text-sm font-semibold text-slate-800">
            <Link
              href="/katalog"
              className="block px-3 py-2 rounded-lg hover:bg-slate-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Semua Katalog Buku
            </Link>
            <Link
              href="/katalog?sort=bestseller"
              className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-[#f97316]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Buku Best Seller
            </Link>
            <div className="pt-2 border-t border-slate-100">
              <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Kategori Populer
              </p>
              {categories.slice(0, 5).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/katalog?category=${cat.slug}`}
                  className="block px-3 py-1.5 text-xs text-slate-600 hover:text-[#0f2942]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  &bull; {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs h-20" />
    }>
      <NavbarContent />
    </Suspense>
  );
}
