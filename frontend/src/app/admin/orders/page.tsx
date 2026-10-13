'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  ShoppingCart, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer, 
  Eye, 
  X, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  MapPin,
  Send
} from 'lucide-react';
import { api } from '@/lib/api';
import { Order } from '@/types';
import { formatRupiah, formatDate } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modal Detail states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminOrders({
        page,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        q: search || undefined,
      });

      setOrders(res.data);
      if (res.meta) {
        setPagination({
          current_page: res.meta.current_page,
          last_page: res.meta.last_page,
          total: res.meta.total,
        });
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  // Open Order Detail Modal
  const openDetailModal = async (orderId: number) => {
    setIsModalOpen(true);
    setLoadingDetail(true);
    try {
      const order = await api.getAdminOrder(orderId);
      setSelectedOrder(order);
      setTrackingNumberInput(order.tracking_number || '');
    } catch (err) {
      console.error('Failed to load order detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Update Status
  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const updated = await api.updateAdminOrderStatus(selectedOrder.id, newStatus);
      setSelectedOrder(updated);
      fetchOrders();
    } catch (err) {
      alert('Gagal memperbarui status pesanan.');
    } finally {
      setUpdating(false);
    }
  };

  // Update Resi Tracking Number
  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !trackingNumberInput.trim()) return;

    setUpdating(true);
    try {
      const updated = await api.updateAdminOrderTracking(
        selectedOrder.id,
        trackingNumberInput.trim(),
        selectedOrder.courier_code
      );
      setSelectedOrder(updated);
      fetchOrders();
      alert(`Nomor resi berhasil disimpan. Status pesanan kini: ${updated.status}.`);
    } catch (err) {
      alert('Gagal menyimpan nomor resi.');
    } finally {
      setUpdating(false);
    }
  };

  const statusTabs = [
    { id: 'all', label: 'Semua Pesanan' },
    { id: 'pending', label: 'Menunggu Bayar' },
    { id: 'paid', label: 'Lunas (Perlu Dikemas)' },
    { id: 'shipped', label: 'Sedang Dikirim' },
    { id: 'completed', label: 'Selesai' },
    { id: 'cancelled', label: 'Dibatalkan' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
            Manajemen Pesanan Pelanggan
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Verifikasi status pembayaran, cetak label pengiriman, dan input nomor resi ekspedisi kurir.
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-primary-900 text-white shadow-sm'
                  : 'bg-white border border-gray-200/80 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200/80 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Cari berdasarkan No. Pesanan (JB-...), Nama Penerima, atau Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto" />
            <p className="text-sm text-gray-500">Memuat data pesanan...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">
            Tidak ada pesanan yang sesuai dengan filter ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">No. Pesanan</th>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Pelanggan & Kontak</th>
                  <th className="px-6 py-4">Ekspedisi Kurir</th>
                  <th className="px-6 py-4">Total Nilai</th>
                  <th className="px-6 py-4">Status Pesanan</th>
                  <th className="px-6 py-4">No. Resi</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((ord) => {
                  const isPaid = ord.payment_status === 'paid' || ord.status === 'paid';
                  const isShipped = ord.status === 'shipped';
                  const isCancelled = ord.status === 'cancelled';

                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-primary-900">
                        {ord.order_number}
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(ord.created_at)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-gray-900">
                          {ord.shipping_address?.recipient_name || 'Pembeli Tamu'}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {ord.shipping_address?.phone || ord.guest_phone || ord.guest_email || '-'}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs uppercase font-semibold text-gray-800">
                        {ord.courier_code} ({ord.courier_service})
                      </td>

                      <td className="px-6 py-4 text-xs font-bold text-primary-900">
                        {formatRupiah(ord.grand_total)}
                      </td>

                      <td className="px-6 py-4">
                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            <AlertCircle className="w-3 h-3" /> Batal
                          </span>
                        ) : isShipped ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                            <Truck className="w-3 h-3" /> Dikirim
                          </span>
                        ) : isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Lunas
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" /> Menunggu
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs font-mono">
                        {ord.tracking_number ? (
                          <span className="font-semibold text-primary-900 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                            {ord.tracking_number}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Belum ada</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openDetailModal(ord.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-900 text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Kelola
                        </button>
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
              Halaman <span className="font-bold">{pagination.current_page}</span> dari <span className="font-bold">{pagination.last_page}</span>
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

      {/* Order Detail & Fulfillment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-gray-900">
                  Rincian & Pemenuhan Pesanan #{selectedOrder?.order_number}
                </h3>
                <p className="text-xs text-gray-500">
                  Waktu Pemesanan: {selectedOrder ? formatDate(selectedOrder.created_at) : '-'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 text-xs font-semibold inline-flex items-center gap-1.5"
                  title="Cetak Packing Slip"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Surat Jalan
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loadingDetail || !selectedOrder ? (
              <div className="p-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto" />
                <p className="text-xs text-gray-500">Mengambil data transaksi...</p>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
                {/* Status & Tracking Section */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                        Ubah Status Pesanan
                      </span>
                      <select
                        value={selectedOrder.status}
                        disabled={updating}
                        onChange={(e) => handleUpdateStatus(e.target.value)}
                        className="px-3.5 py-2 rounded-xl border border-gray-300 bg-white font-semibold text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="pending">Menunggu Pembayaran (pending)</option>
                        <option value="paid">Lunas / Siap Diproses (paid)</option>
                        <option value="processing">Sedang Dikemas (processing)</option>
                        <option value="shipped">Sedang Dikirim (shipped)</option>
                        <option value="completed">Pesanan Selesai (completed)</option>
                        <option value="cancelled">Dibatalkan (cancelled)</option>
                      </select>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                        Status Pembayaran
                      </span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        selectedOrder.payment_status === 'paid' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {selectedOrder.payment_status?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Resi Tracking Form */}
                  <form onSubmit={handleSaveTracking} className="pt-3 border-t border-gray-200">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Input Nomor Resi Kurir ({selectedOrder.courier_code?.toUpperCase()})
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Contoh: JNE0123456789 / SOCAG00123..."
                        value={trackingNumberInput}
                        onChange={(e) => setTrackingNumberInput(e.target.value)}
                        className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        type="submit"
                        disabled={updating}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                      >
                        {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        Simpan Resi & Kirim
                      </button>
                    </div>
                  </form>
                </div>

                {/* Recipient and Logistic Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-1">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Alamat Pengiriman
                    </h4>
                    <p className="text-sm font-bold text-gray-900">
                      {selectedOrder.shipping_address?.recipient_name}
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {selectedOrder.shipping_address?.street_address}<br />
                      Kode Pos: {selectedOrder.shipping_address?.postal_code || '-'}
                    </p>
                    <p className="text-xs text-gray-500 pt-1">
                      Kontak: <span className="font-semibold text-gray-800">{selectedOrder.shipping_address?.phone || selectedOrder.guest_phone || '-'}</span>
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-1">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Logistik & Ekspedisi
                    </h4>
                    <p className="text-sm font-bold text-gray-900 uppercase">
                      {selectedOrder.courier_code} - {selectedOrder.courier_service}
                    </p>
                    <p className="text-xs text-gray-600">
                      Ongkos Kirim: {formatRupiah(selectedOrder.shipping_cost)}
                    </p>
                    <p className="text-xs text-gray-500 pt-1">
                      Nomor Resi: <span className="font-mono font-bold text-primary-900">{selectedOrder.tracking_number || '(Belum diinput)'}</span>
                    </p>
                  </div>
                </div>

                {/* Ordered Items Table */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Daftar Buku Pesanan ({selectedOrder.items?.length || 0} judul)
                  </h4>
                  <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 bg-white">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-10 aspect-[3/4] bg-gray-100 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                            {item.cover_image ? (
                              <Image
                                src={item.cover_image}
                                alt={item.title || 'Buku'}
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
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {item.quantity} eks × {formatRupiah(item.price_unit)}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-gray-900">
                          {formatRupiah(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="mt-4 max-w-xs ml-auto space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal Buku</span>
                      <span className="font-semibold text-gray-900">{formatRupiah(selectedOrder.total_books_price)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Ongkos Kirim</span>
                      <span className="font-semibold text-gray-900">{formatRupiah(selectedOrder.shipping_cost)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-primary-900 pt-2 border-t border-gray-200">
                      <span>Grand Total</span>
                      <span>{formatRupiah(selectedOrder.grand_total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
