'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Filter, 
  Search, 
  X, 
  SlidersHorizontal, 
  Layers, 
  ArrowUpDown, 
  BookX, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import BookCard from '@/components/cards/BookCard';
import { api } from '@/lib/api';
import { Book, Category, PaginatedMeta } from '@/types';

export default function CatalogClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>({
    current_page: 1,
    from: 1,
    last_page: 1,
    per_page: 12,
    to: 12,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract query filters from URL
  const currentCategory = searchParams.get('category') || '';
  const currentQuery = searchParams.get('q') || '';
  const currentSort = (searchParams.get('sort') || 'newest') as 'newest' | 'price_asc' | 'price_desc' | 'bestseller';
  const currentFormat = searchParams.get('format') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Search input state
  const [searchTerm, setSearchTerm] = useState(currentQuery);

  // Function to push updated params to URL
  const updateParams = useCallback((newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset page to 1 if filter other than page changes
    if (!('page' in newParams)) {
      params.delete('page');
    }

    router.push(`/katalog?${params.toString()}`);
  }, [router, searchParams]);

  // Load Categories once
  useEffect(() => {
    api.getCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchTerm(currentQuery);
  }, [currentQuery]);

  // Fetch Books whenever URL filters change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.getBooks({
      page: currentPage,
      limit: 12,
      category: currentCategory || undefined,
      sort: currentSort,
      q: currentQuery || undefined,
    })
      .then((res) => {
        if (isMounted) {
          setBooks(res.data);
          setMeta(res.meta);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching books:', err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, currentCategory, currentSort, currentQuery]);

  // Handle Search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchTerm.trim() || null });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    router.push('/katalog');
    setMobileFilterOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link href="/" className="hover:text-[#0f2942] transition-colors">Beranda</Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">Katalog Buku</span>
          {currentCategory && (
            <>
              <span>/</span>
              <span className="text-[#f97316] font-bold capitalize">
                {currentCategory.replace('-', ' ')}
              </span>
            </>
          )}
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0f2942] tracking-tight">
              Katalog Buku Akademik
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Menampilkan {meta.total} judul buku referensi dan ajar ber-ISBN resmi
            </p>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#0f2942]" />
            <span>Filter &amp; Urutkan</span>
            {(currentCategory || currentQuery || currentFormat) && (
              <span className="w-2 h-2 rounded-full bg-[#f97316]"></span>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters (Left) + Book Grid (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filter */}
        <aside className="hidden lg:block lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs sticky top-28 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0f2942]">
              <Filter className="w-4 h-4 text-[#f97316]" />
              <span>Filter Katalog</span>
            </div>
            {(currentCategory || currentQuery || currentSort !== 'newest') && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Reset
              </button>
            )}
          </div>

          {/* Search in sidebar */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Pencarian Kata Kunci</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Judul, Penulis, ISBN..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl pl-3 pr-8 py-2.5 outline-hidden focus:bg-white focus:border-[#0f2942]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => { setSearchTerm(''); updateParams({ q: null }); }}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Category Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Bidang Keilmuan</span>
              {currentCategory && (
                <button
                  onClick={() => updateParams({ category: null })}
                  className="text-[11px] text-[#2563eb] hover:underline"
                >
                  Semua
                </button>
              )}
            </label>

            <div className="space-y-1 max-h-72 overflow-y-auto pr-1 text-xs">
              <button
                onClick={() => updateParams({ category: null })}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                  !currentCategory 
                    ? 'bg-[#0f2942] text-white font-bold' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>Semua Kategori</span>
                <span>{meta.total}</span>
              </button>

              {categories.map((cat) => (
                <div key={cat.id} className="space-y-0.5">
                  <button
                    onClick={() => updateParams({ category: cat.slug })}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                      currentCategory === cat.slug
                        ? 'bg-[#0f2942] text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {cat.books_count !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        currentCategory === cat.slug ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {cat.books_count}
                      </span>
                    )}
                  </button>

                  {/* Subcategories */}
                  {cat.children && cat.children.length > 0 && (
                    <div className="pl-3 space-y-0.5 border-l border-slate-100 ml-2">
                      {cat.children.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => updateParams({ category: sub.slug })}
                          className={`w-full text-left px-2 py-1 rounded text-[11px] transition-colors flex items-center justify-between ${
                            currentCategory === sub.slug
                              ? 'bg-[#f97316] text-white font-bold'
                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">&bull; {sub.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Filter: Best Seller only */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => updateParams({ sort: currentSort === 'bestseller' ? 'newest' : 'bestseller' })}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                currentSort === 'bestseller'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Hanya Buku Terlaris (Best Seller)</span>
            </button>
          </div>
        </aside>

        {/* Catalog Main Content */}
        <section className="lg:col-span-9 space-y-6">
          {/* Top Filter Bar: Active filters & Sorting Selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Active Filters Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Filter Aktif:</span>

              {currentQuery && (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                  Kata Kunci: &ldquo;{currentQuery}&rdquo;
                  <button onClick={() => updateParams({ q: null })} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {currentCategory && (
                <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 font-semibold px-2.5 py-1 rounded-lg">
                  Kategori: {currentCategory}
                  <button onClick={() => updateParams({ category: null })} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {!currentQuery && !currentCategory && (
                <span className="text-slate-500 italic text-[11px]">Semua Koleksi</span>
              )}
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <label htmlFor="sort-select" className="text-xs font-semibold text-slate-600">Urutkan:</label>
              <select
                id="sort-select"
                value={currentSort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 py-1.5 px-3 focus:outline-hidden focus:border-[#0f2942]"
              >
                <option value="newest">Terbitan Terbaru</option>
                <option value="bestseller">Paling Populer (Best Seller)</option>
                <option value="price_asc">Harga: Termurah</option>
                <option value="price_desc">Harga: Tertinggi</option>
              </select>
            </div>
          </div>

          {/* Book Cards Grid */}
          {loading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse">
                  <div className="aspect-3/4 bg-slate-200 rounded-xl"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-5 bg-slate-200 rounded w-1/3 pt-2"></div>
                </div>
              ))}
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#f97316] flex items-center justify-center mx-auto">
                <BookX className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Buku Tidak Ditemukan</h3>
                <p className="text-xs text-slate-500">
                  Maaf, tidak ada buku yang cocok dengan kriteria pencarian Anda. Silakan coba kata kunci lain atau reset filter.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0f2942] hover:bg-[#1a446c] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <span>Tampilkan Semua Buku</span>
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {meta.last_page > 1 && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <button
                disabled={currentPage <= 1}
                onClick={() => updateParams({ page: String(currentPage - 1) })}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <div className="flex items-center gap-1 text-xs">
                {[...Array(meta.last_page)].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => updateParams({ page: String(pageNum) })}
                      className={`w-8 h-8 rounded-lg font-bold transition-colors ${
                        pageNum === currentPage
                          ? 'bg-[#0f2942] text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={currentPage >= meta.last_page}
                onClick={() => updateParams({ page: String(currentPage + 1) })}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Mobile Bottom Filter Modal / Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm bg-white h-full p-6 overflow-y-auto space-y-6 shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-900 text-base">Filter &amp; Urutkan</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Categories */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Kategori</label>
              <div className="space-y-1">
                <button
                  onClick={() => { updateParams({ category: null }); setMobileFilterOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                    !currentCategory ? 'bg-[#0f2942] text-white' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  Semua Kategori
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { updateParams({ category: cat.slug }); setMobileFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                      currentCategory === cat.slug ? 'bg-[#0f2942] text-white' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    {cat.name} ({cat.books_count})
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#0f2942] text-white text-xs font-bold"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
