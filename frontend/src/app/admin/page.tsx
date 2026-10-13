'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  ShoppingCart, 
  BookOpen, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ArrowRight, 
  Plus, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatRupiah, formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await api.getAdminDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        <p className="text-sm text-gray-500">Memuat data metrik analitik dashboard...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {
    total_revenue: 0,
    total_orders: 0,
    pending_orders: 0,
    paid_orders: 0,
    shipped_orders: 0,
    total_books: 0,
    active_books: 0,
    low_stock_count: 0,
  };

  const recentOrders = data?.recent_orders || [];
  const lowStockBooks = data?.low_stock_books || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
            Ringkasan Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Pantau kinerja penjualan, status pemenuhan pesanan, dan peringatan inventaris gudang.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Perbarui Data
          </button>

          <Link
            href="/admin/books"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-900 hover:bg-primary-800 text-white text-xs font-bold shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Buku
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Omset */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Pendapatan
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-serif font-extrabold text-gray-900">
            {formatRupiah(metrics.total_revenue)}
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            Dari seluruh pesanan lunas & terverifikasi
          </p>
        </div>

        {/* Metric 2: Total Pesanan */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Pesanan Masuk
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-serif font-extrabold text-gray-900">
            {metrics.total_orders} <span className="text-sm font-normal text-gray-500">transaksi</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span className="text-amber-600 font-semibold">{metrics.pending_orders} pending</span> • 
            <span className="text-emerald-600 font-semibold">{metrics.paid_orders} lunas</span> • 
            <span className="text-purple-600 font-semibold">{metrics.shipped_orders} dikirim</span>
          </div>
        </div>

        {/* Metric 3: Buku Aktif */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Koleksi Buku
            </span>
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-serif font-extrabold text-gray-900">
            {metrics.total_books} <span className="text-sm font-normal text-gray-500">judul</span>
          </div>
          <p className="text-xs text-primary-700 font-medium mt-1">
            {metrics.active_books} judul aktif tayang di katalog
          </p>
        </div>

        {/* Metric 4: Peringatan Stok Rendah */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Peringatan Stok
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-serif font-extrabold text-amber-600">
            {metrics.low_stock_count} <span className="text-sm font-normal text-gray-500">judul</span>
          </div>
          <p className="text-xs text-amber-700 font-medium mt-1">
            Stok kritis tersisa ≤ 5 eksemplar
          </p>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Low Stock Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Pesanan Pelanggan Terbaru</h2>
              <p className="text-xs text-gray-500">Daftar transaksi pesanan masuk terakhir.</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-primary-800 hover:text-primary-900 flex items-center gap-1"
            >
              Lihat Semua
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500">
              Belum ada pesanan yang tercatat dalam sistem.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3.5">No. Pesanan</th>
                    <th className="px-6 py-3.5">Pelanggan</th>
                    <th className="px-6 py-3.5">Nilai Transaksi</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((ord: any) => {
                    const isPaid = ord.payment_status === 'paid' || ord.status === 'paid';
                    const isShipped = ord.status === 'shipped';

                    return (
                      <tr key={ord.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-xs text-primary-900">
                          <Link href={`/order/${ord.order_number}`} target="_blank" className="hover:underline">
                            {ord.order_number}
                          </Link>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 text-xs">
                          {ord.customer_name}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900 text-xs">
                          {formatRupiah(ord.grand_total)}
                        </td>
                        <td className="px-6 py-4">
                          {isShipped ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800">
                              <Truck className="w-3 h-3" /> Dikirim
                            </span>
                          ) : isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Lunas
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3" /> Menunggu
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(ord.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Warning (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Peringatan Stok Rendah</h2>
              <p className="text-xs text-gray-500">Prioritas pengadaan ulang gudang.</p>
            </div>
            <Link
              href="/admin/books?stock_status=low"
              className="text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              Lihat Semua
            </Link>
          </div>

          <div className="p-6 divide-y divide-gray-100">
            {lowStockBooks.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">
                Semua stok buku dalam batas aman ({'>'} 5 eksemplar).
              </div>
            ) : (
              lowStockBooks.map((b: any) => (
                <div key={b.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {b.title}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {b.category} • {b.author}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${
                    b.stock <= 2 
                      ? 'bg-red-100 text-red-800 border border-red-200' 
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    Sisa {b.stock} eks
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
