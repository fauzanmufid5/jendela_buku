'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';
import { Book, Category } from '@/types';
import { formatRupiah } from '@/lib/utils';

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockStatus, setStockStatus] = useState<'all' | 'low' | 'out_of_stock'>('all');
  const [page, setPage] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    author: '',
    publisher: 'Deepublish',
    isbn: '',
    pages: 200,
    published_year: 2026,
    dimensions: '15.5 x 23 cm',
    format: 'paperback' as 'paperback' | 'hardcover' | 'ebook',
    regular_price: 95000,
    sale_price: '',
    stock: 20,
    weight_grams: 350,
    cover_image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
    description: '',
    table_of_contents: '',
    is_best_seller: false,
    is_active: true,
  });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminBooks({
        page,
        limit: 10,
        q: search || undefined,
        category_id: selectedCategory || undefined,
        stock_status: stockStatus !== 'all' ? stockStatus : undefined,
      });

      setBooks(res.data);
      if (res.meta) {
        setPagination({
          current_page: res.meta.current_page,
          last_page: res.meta.last_page,
          total: res.meta.total,
        });
      }
    } catch (err) {
      console.error('Failed to load books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [page, selectedCategory, stockStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBooks();
  };

  // Open Add Modal
  const openAddModal = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      category_id: categories[0]?.id?.toString() || '1',
      author: '',
      publisher: 'Deepublish',
      isbn: '',
      pages: 250,
      published_year: 2026,
      dimensions: '15.5 x 23 cm',
      format: 'paperback',
      regular_price: 98000,
      sale_price: '',
      stock: 25,
      weight_grams: 350,
      cover_image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
      description: 'Buku teks komprehensif untuk perkuliahan dan referensi ilmiah.',
      table_of_contents: 'BAB 1: Pendahuluan\nBAB 2: Landasan Teori\nBAB 3: Metodologi\nBAB 4: Implementasi & Evaluasi',
      is_best_seller: false,
      is_active: true,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      category_id: book.category_id.toString(),
      author: book.author,
      publisher: book.publisher || 'Deepublish',
      isbn: book.isbn || '',
      pages: book.pages || 200,
      published_year: book.published_year || 2026,
      dimensions: book.dimensions || '15.5 x 23 cm',
      format: book.format || 'paperback',
      regular_price: book.regular_price,
      sale_price: book.sale_price ? book.sale_price.toString() : '',
      stock: book.stock,
      weight_grams: book.weight_grams,
      cover_image_url: book.cover_image_url,
      description: book.description,
      table_of_contents: book.table_of_contents || '',
      is_best_seller: book.is_best_seller,
      is_active: book.is_active,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  // Save Book
  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setModalError('');

    try {
      const payload: any = {
        ...formData,
        category_id: Number(formData.category_id),
        pages: Number(formData.pages),
        published_year: Number(formData.published_year),
        regular_price: Number(formData.regular_price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        stock: Number(formData.stock),
        weight_grams: Number(formData.weight_grams),
      };

      if (editingBook) {
        await api.updateAdminBook(editingBook.id, payload);
      } else {
        await api.createAdminBook(payload);
      }

      setIsModalOpen(false);
      fetchBooks();
    } catch (err: any) {
      console.error('Error saving book:', err);
      setModalError(err.response?.data?.message || 'Gagal menyimpan buku. Pastikan seluruh input valid.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Book
  const handleDeleteBook = async (id: number, title: string) => {
    if (confirm(`Yakin ingin menghapus buku "${title}" dari inventaris?`)) {
      try {
        await api.deleteAdminBook(id);
        fetchBooks();
      } catch (err) {
        alert('Gagal menghapus buku.');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
            Inventaris Buku & Katalog
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Kelola data buku teks, harga jual, tingkat stok gudang, dan status penerbitan.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-900 hover:bg-primary-800 text-white text-sm font-bold shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Buku Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
          <form onSubmit={handleSearchSubmit} className="sm:col-span-6 relative">
            <input
              type="text"
              placeholder="Cari berdasarkan judul, penulis, atau ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </form>

          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={stockStatus}
              onChange={(e: any) => {
                setStockStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              <option value="all">Semua Status Stok</option>
              <option value="low">Stok Menipis (≤ 5)</option>
              <option value="out_of_stock">Stok Habis (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto" />
            <p className="text-sm text-gray-500">Memuat inventaris buku...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">
            Tidak ada buku yang cocok dengan kriteria pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Buku & Penulis</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Harga Jual</th>
                  <th className="px-6 py-4">Stok</th>
                  <th className="px-6 py-4">Berat</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {books.map((book) => {
                  const isLow = book.stock <= 5 && book.stock > 0;
                  const isOut = book.stock <= 0;

                  return (
                    <tr key={book.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-10 aspect-[3/4] bg-gray-100 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                            {book.cover_image_url ? (
                              <Image
                                src={book.cover_image_url}
                                alt={book.title}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <BookOpen className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="text-xs font-bold text-gray-900 truncate">
                              {book.title}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate">
                              {book.author}
                            </p>
                            {book.isbn && (
                              <p className="text-[10px] text-gray-400 font-mono">
                                ISBN: {book.isbn}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-700">
                        {book.category?.name || '-'}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-gray-900">
                          {formatRupiah(book.final_price || book.sale_price || book.regular_price)}
                        </div>
                        {book.sale_price && (
                          <div className="text-[10px] text-gray-400 line-through">
                            {formatRupiah(book.regular_price)}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isOut
                              ? 'bg-red-100 text-red-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {book.stock} eks
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-600">
                        {book.weight_grams} g
                      </td>

                      <td className="px-6 py-4">
                        {book.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Tayang
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            Draft
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(book)}
                            className="p-1.5 text-gray-500 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit data buku"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id, book.title)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus buku"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.last_page > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <span>
              Menampilkan Halaman <span className="font-bold">{pagination.current_page}</span> dari <span className="font-bold">{pagination.last_page}</span> (Total: {pagination.total} buku)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.current_page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Book */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-gray-900">
                  {editingBook ? 'Edit Data Buku' : 'Tambah Buku Baru ke Inventaris'}
                </h3>
                <p className="text-xs text-gray-500">
                  Pastikan informasi spesifikasi teknis dan harga buku akurat.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveBook} className="p-6 overflow-y-auto space-y-4 flex-1">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  {modalError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Judul Buku <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Metodologi Penelitian Kualitatif & Kuantitatif"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Kategori Disiplin Ilmu <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Nama Penulis / Akademisi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Contoh: Prof. Dr. Sugiyono"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Penerbit Resmi
                  </label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    placeholder="Deepublish"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Nomor ISBN
                  </label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="978-623-02-XXXX-X"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Jumlah Halaman <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.pages}
                    onChange={(e) => setFormData({ ...formData, pages: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Format Buku
                  </label>
                  <select
                    value={formData.format}
                    onChange={(e: any) => setFormData({ ...formData, format: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="paperback">Paperback (Buku Fisik Lem)</option>
                    <option value="hardcover">Hardcover (Edisi Khusus)</option>
                    <option value="ebook">Ebook (PDF Digital)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Harga Reguler (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.regular_price}
                    onChange={(e) => setFormData({ ...formData, regular_price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Harga Coret / Promo (Rp) (Opsional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Kosongkan jika harga normal"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Stok Tersedia (Eksemplar) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Berat Kirim (Gram) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={formData.weight_grams}
                    onChange={(e) => setFormData({ ...formData, weight_grams: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    URL Gambar Sampul (Cover Image) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.cover_image_url}
                    onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Sinopsis & Deskripsi Lengkap <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Daftar Isi Buku (Table of Contents)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.table_of_contents}
                    onChange={(e) => setFormData({ ...formData, table_of_contents: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-xs"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.is_best_seller}
                      onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    Tandai Buku Best Seller
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    Aktifkan & Tayangkan di Katalog
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-primary-900 hover:bg-primary-800 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingBook ? 'Simpan Perubahan' : 'Terbitkan Buku'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
