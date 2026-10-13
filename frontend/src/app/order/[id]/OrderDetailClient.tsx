'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck, 
  CreditCard, 
  AlertCircle, 
  Printer, 
  MessageCircle, 
  ArrowLeft, 
  BookOpen,
  Loader2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { api } from '@/lib/api';
import { Order } from '@/types';
import { formatRupiah, formatDate } from '@/lib/utils';

interface OrderDetailClientProps {
  orderNumber: string;
}

export default function OrderDetailClient({ orderNumber }: OrderDetailClientProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [simulationSuccess, setSimulationSuccess] = useState('');

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await api.getOrder(orderNumber);
      setOrder(data);
    } catch (err: any) {
      console.error('Failed to fetch order:', err);
      setError(err.response?.data?.message || 'Pesanan tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderNumber]);

  // Handle instant sandbox payment simulation
  const handleSimulatePayment = async () => {
    setSimulating(true);
    setSimulationSuccess('');
    try {
      await api.simulatePayment(orderNumber);
      setSimulationSuccess('Pembayaran berhasil disimulasikan! Status pesanan kini LUNAS.');
      await fetchOrder();
    } catch (err: any) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  // Re-open Snap Payment
  const handleOpenSnapPayment = () => {
    if (!order) return;
    const snapToken = (order.payment_payload as any)?.snap_token;
    const snapRedirectUrl = (order.payment_payload as any)?.snap_redirect_url;

    if (typeof window !== 'undefined' && window.snap && snapToken && !snapToken.startsWith('SNAP_SIM_')) {
      window.snap.pay(snapToken, {
        onSuccess: () => fetchOrder(),
        onPending: () => fetchOrder(),
        onError: () => fetchOrder(),
        onClose: () => fetchOrder(),
      });
    } else if (snapRedirectUrl) {
      window.open(snapRedirectUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        <p className="text-sm text-gray-500">Memuat rincian invoice pesanan...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold font-serif text-gray-900 mb-2">Pesanan Tidak Ditemukan</h1>
        <p className="text-gray-600 text-sm mb-6">{error || 'Nomor pesanan yang Anda cari tidak terdaftar dalam sistem.'}</p>
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-900 text-white rounded-xl text-sm font-medium hover:bg-primary-800 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Katalog Buku
        </Link>
      </div>
    );
  }

  const isPending = order.payment_status === 'unpaid';
  const isPaid = order.payment_status === 'paid';

  // Status badge config
  const getStatusBadge = () => {
    if (order.status === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          <AlertCircle className="w-3.5 h-3.5" /> Dibatalkan / Kadaluarsa
        </span>
      );
    }
    if (order.status === 'shipped') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
          <Truck className="w-3.5 h-3.5" /> Sedang Dikirim
        </span>
      );
    }
    if (isPaid) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5" /> Pembayaran Berhasil (Lunas)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
        <Clock className="w-3.5 h-3.5" /> Menunggu Pembayaran
      </span>
    );
  };

  const waInvoiceUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(
    `Halo CS Jendela Buku, saya ingin konfirmasi pesanan No: ${order.order_number} atas nama ${order.shipping_address?.recipient_name || 'Pembeli'} (Total: Rp ${order.grand_total.toLocaleString('id-ID')}). Mohon informasi proses selanjutnya.`
  )}`;

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-test'}
        strategy="lazyOnload"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Beranda</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Invoice #{order.order_number}</span>
        </nav>

        {simulationSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{simulationSuccess}</span>
          </div>
        )}

        {/* Invoice Header Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden mb-8">
          <div className="p-6 sm:p-8 bg-gradient-to-r from-primary-900 to-primary-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
                  Invoice #{order.order_number}
                </h1>
                {getStatusBadge()}
              </div>
              <p className="text-xs sm:text-sm text-primary-200">
                Waktu Transaksi: {formatDate(order.created_at)}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-medium transition-colors"
              >
                <Printer className="w-4 h-4" />
                Cetak Invoice
              </button>
            </div>
          </div>

          {/* Pending Payment Alert Box */}
          {isPending && (
            <div className="p-6 bg-amber-50/70 border-b border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-900">Menunggu Pembayaran Anda</h3>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Silakan selesaikan pembayaran sebesar <span className="font-bold">{formatRupiah(order.grand_total)}</span> untuk memproses pengiriman buku.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleOpenSnapPayment}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Bayar Sekarang
                </button>

                {/* Developer / Sandbox Simulation Button */}
                <button
                  type="button"
                  disabled={simulating}
                  onClick={handleSimulatePayment}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                  title="Simulasi otomatis pembayaran lunas untuk pengujian sandbox"
                >
                  {simulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Simulasikan Bayar (Sandbox)
                </button>
              </div>
            </div>
          )}

          {/* Customer & Shipping Summary Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 border-b border-gray-100">
            {/* Recipient & Address */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Alamat Tujuan Pengiriman
              </h3>
              <p className="text-sm font-bold text-gray-900">
                {order.shipping_address?.recipient_name || 'Pembeli'}
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                {order.shipping_address?.street_address}<br />
                Kode Pos: {order.shipping_address?.postal_code || '-'}
              </p>
              <p className="text-xs text-gray-500 pt-1">
                WhatsApp: <span className="text-gray-800 font-medium">{order.shipping_address?.phone || order.guest_phone || '-'}</span>
              </p>
            </div>

            {/* Courier & Logistic */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ekspedisi & Status Logistik
              </h3>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase">
                <Truck className="w-4 h-4 text-primary-600" />
                {order.courier_code} - {order.courier_service}
              </div>
              <p className="text-xs text-gray-600">
                Asal Pengiriman: Sleman, D.I. Yogyakarta (Gudang Penerbit)
              </p>
              {order.tracking_number ? (
                <div className="pt-1">
                  <span className="text-xs text-gray-500">Nomor Resi: </span>
                  <span className="text-xs font-mono font-bold text-primary-900 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                    {order.tracking_number}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">
                  Nomor resi akan diperbarui setelah pesanan selesai dikemas.
                </p>
              )}
            </div>
          </div>

          {/* Book Items Table */}
          <div className="p-6 sm:p-8">
            <h3 className="text-sm font-bold text-gray-900 mb-4">
              Daftar Buku Pesanan
            </h3>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
              {order.items?.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4 bg-white hover:bg-gray-50/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 aspect-[3/4] bg-gray-100 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                      {item.cover_image ? (
                        <Image
                          src={item.cover_image}
                          alt={item.title || 'Buku'}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <BookOpen className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1">
                        {item.title}
                      </p>
                      {item.author && (
                        <p className="text-[11px] text-gray-500">Penulis: {item.author}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-0.5">
                        {item.quantity} eks × {formatRupiah(item.price_unit)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="mt-6 max-w-sm ml-auto space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal Buku</span>
                <span className="font-semibold text-gray-900">{formatRupiah(order.total_books_price)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Ongkos Kirim ({order.courier_code?.toUpperCase()})</span>
                <span className="font-semibold text-gray-900">{formatRupiah(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-primary-900 pt-3 border-t border-gray-200">
                <span>Total Pembayaran</span>
                <span>{formatRupiah(order.grand_total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action and Support Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Lanjut Belanja Buku Lainnya
          </Link>

          <a
            href={waInvoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Konfirmasi Pesanan via WhatsApp CS
          </a>
        </div>
      </div>
    </>
  );
}
