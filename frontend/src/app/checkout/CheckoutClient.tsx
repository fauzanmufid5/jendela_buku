'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  MapPin, 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  BookOpen,
  MessageCircle,
  Clock
} from 'lucide-react';
import { useCartStore } from '@/stores/useCartStore';
import { api } from '@/lib/api';
import { DestinationProvince, DestinationCity, ShippingRate } from '@/types';
import { formatRupiah } from '@/lib/utils';

declare global {
  interface Window {
    snap?: {
      pay: (token: string, callbacks: {
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (result: any) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

export default function CheckoutClient() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, getTotalPrice, getTotalWeight, clearCart } = useCartStore();

  // Form states
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Destination cascading states
  const [provinces, setProvinces] = useState<DestinationProvince[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [availableCities, setAvailableCities] = useState<DestinationCity[]>([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');

  // Shipping states
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedCourierRate, setSelectedCourierRate] = useState<ShippingRate | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setMounted(true);
    // Fetch available destinations
    api.getDestinations()
      .then((data) => {
        setProvinces(data);
      })
      .catch((err) => {
        console.error('Failed to load destinations:', err);
      });
  }, []);

  // Handle province change
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provId = e.target.value;
    setSelectedProvinceId(provId);
    setSelectedCityId('');
    setSelectedDistrictId('');
    setShippingRates([]);
    setSelectedCourierRate(null);

    const prov = provinces.find((p) => p.province_id === provId);
    setAvailableCities(prov ? prov.cities : []);
  };

  // Handle city change
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value;
    setSelectedCityId(cityId);

    const city = availableCities.find((c) => c.city_id === cityId);
    if (city) {
      setSelectedDistrictId(city.district_id);
      setPostalCode(city.postal_code || '');
      // Auto trigger shipping calculation
      fetchShippingRates(city.district_id);
    } else {
      setSelectedDistrictId('');
      setShippingRates([]);
      setSelectedCourierRate(null);
    }
  };

  const totalWeightGrams = getTotalWeight();
  const booksPrice = getTotalPrice();

  // Fetch shipping rates
  const fetchShippingRates = async (districtId: string) => {
    if (!districtId || totalWeightGrams <= 0) return;

    setLoadingShipping(true);
    setShippingError('');
    setSelectedCourierRate(null);

    try {
      const res = await api.calculateShipping({
        destination_district_id: districtId,
        total_weight_grams: totalWeightGrams,
      });

      if (res && res.rates && res.rates.length > 0) {
        setShippingRates(res.rates);
        // Default select first courier rate (usually regular)
        setSelectedCourierRate(res.rates[0]);
      } else {
        setShippingRates([]);
        setShippingError('Tidak ada layanan kurir yang tersedia untuk area ini.');
      }
    } catch (err: any) {
      console.error('Error calculating shipping:', err);
      setShippingError(err.response?.data?.message || 'Gagal menghitung ongkos kirim. Silakan coba lagi.');
    } finally {
      setLoadingShipping(false);
    }
  };

  const shippingCost = selectedCourierRate ? selectedCourierRate.cost : 0;
  const grandTotal = booksPrice + shippingCost;

  // Handle Checkout submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!recipientName || !phone || !email || !streetAddress || !selectedDistrictId) {
      setErrorMessage('Harap lengkapi semua data penerima dan alamat pengiriman.');
      return;
    }

    if (!selectedCourierRate) {
      setErrorMessage('Harap pilih layanan kurir ekspedisi terlebih dahulu.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Keranjang belanja Anda kosong.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        guest_info: {
          name: recipientName,
          email,
          phone,
        },
        address: {
          recipient_name: recipientName,
          phone,
          street_address: streetAddress,
          province_id: selectedProvinceId,
          city_id: selectedCityId,
          district_id: selectedDistrictId,
          postal_code: postalCode,
          email,
        },
        courier: {
          code: selectedCourierRate.courier,
          service: selectedCourierRate.service,
          cost: selectedCourierRate.cost,
        },
        items: items.map((i) => ({
          book_id: i.book.id,
          qty: i.quantity,
        })),
      };

      const result = await api.checkout(payload);

      // If Snap is available, trigger Snap popup
      if (typeof window !== 'undefined' && window.snap && result.snap_token && !result.snap_token.startsWith('SNAP_SIM_')) {
        window.snap.pay(result.snap_token, {
          onSuccess: (paymentResult: any) => {
            clearCart();
            router.push(`/order/${result.order_number}?status=success`);
          },
          onPending: (paymentResult: any) => {
            clearCart();
            router.push(`/order/${result.order_number}?status=pending`);
          },
          onError: (paymentError: any) => {
            router.push(`/order/${result.order_number}?status=failed`);
          },
          onClose: () => {
            clearCart();
            router.push(`/order/${result.order_number}`);
          },
        });
      } else {
        // Direct navigation to order invoice page (with simulation support)
        clearCart();
        router.push(`/order/${result.order_number}`);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.response?.data?.message || 'Gagal memproses pesanan. Silakan periksa kembali formulir Anda.');
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Keranjang Belanja Kosong</h2>
        <p className="text-gray-600 mb-6 text-sm">Tidak ada buku yang dapat diproses untuk checkout.</p>
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-900 text-white rounded-xl font-medium hover:bg-primary-800 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Lihat Katalog Buku
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Midtrans Snap JS Script */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-test'}
        strategy="lazyOnload"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Beranda</Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-primary-600">Keranjang</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Checkout Pembayaran</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-2">
          Checkout & Pembayaran
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          Isi detail pengiriman Anda dan pilih layanan ekspedisi kurir untuk menyelesaikan pesanan.
        </p>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Perhatian</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left Column: Recipient Form & Courier Selection */}
            <div className="lg:col-span-8 space-y-8">
              {/* Step 1: Data Penerima */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-900 font-bold flex items-center justify-center text-sm">
                    1
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Informasi Penerima & Kontak</h2>
                    <p className="text-xs text-gray-500">Invoice dan resi pengiriman akan dikirimkan ke kontak ini.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Nama Lengkap Penerima <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Dr. Fauzan Ahmad, M.Kom"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Nomor WhatsApp / Telepon <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Alamat Email (Untuk Bukti Nota & Resi) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Contoh: fauzan@kampus.ac.id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Alamat Pengiriman */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-900 font-bold flex items-center justify-center text-sm">
                    2
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Alamat Pengiriman Buku</h2>
                    <p className="text-xs text-gray-500">Pilih provinsi & kota untuk kalkulasi otomatis tarif ongkos kirim.</p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Provinsi Tujuan <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={selectedProvinceId}
                        onChange={handleProvinceChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      >
                        <option value="">-- Pilih Provinsi --</option>
                        {provinces.map((prov) => (
                          <option key={prov.province_id} value={prov.province_id}>
                            {prov.province_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Kota / Kabupaten Tujuan <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        disabled={!selectedProvinceId}
                        value={selectedCityId}
                        onChange={handleCityChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        <option value="">-- Pilih Kota / Kabupaten --</option>
                        {availableCities.map((city) => (
                          <option key={city.city_id} value={city.city_id}>
                            {city.city_name} ({city.district_name})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Alamat Lengkap (Jalan, No., Gedung/Kampus, RT/RW) <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Contoh: Jl. Kaliurang KM 9.3 No. 42, Pogung Lor, Lab Komputer Gedung B"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Kode Pos <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="55281"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Pilihan Ekspedisi Kurir */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-900 font-bold flex items-center justify-center text-sm">
                    3
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Layanan Ekspedisi Pengiriman</h2>
                    <p className="text-xs text-gray-500">
                      Pengiriman resmi dari Gudang Penerbit di Sleman, D.I. Yogyakarta (Total Berat: {(totalWeightGrams / 1000).toFixed(2)} kg).
                    </p>
                  </div>
                </div>

                {!selectedCityId ? (
                  <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-sm text-gray-500">
                    <Truck className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    Pilih provinsi dan kota tujuan terlebih dahulu untuk melihat opsi tarif kurir ekspedisi.
                  </div>
                ) : loadingShipping ? (
                  <div className="p-8 text-center space-y-3">
                    <Loader2 className="w-7 h-7 text-primary-600 animate-spin mx-auto" />
                    <p className="text-sm font-medium text-gray-600">Menghitung tarif ongkos kirim resmi...</p>
                  </div>
                ) : shippingError ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                    {shippingError}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {shippingRates.map((rate, idx) => {
                      const isSelected = 
                        selectedCourierRate?.courier === rate.courier && 
                        selectedCourierRate?.service === rate.service;

                      return (
                        <div
                          key={`${rate.courier}-${rate.service}-${idx}`}
                          onClick={() => setSelectedCourierRate(rate)}
                          className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex flex-col justify-between ${
                            isSelected 
                              ? 'border-primary-600 bg-primary-50/40 shadow-sm ring-1 ring-primary-600' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-gray-900 uppercase">
                                  {rate.courier_name || rate.courier}
                                </span>
                                <span className="text-[11px] font-semibold bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                                  {rate.service}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {rate.service_name || 'Layanan Reguler'}
                              </p>
                            </div>
                            <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isSelected ? 'border-primary-600' : 'border-gray-300'
                            }">
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />}
                            </div>
                          </div>

                          <div className="flex items-end justify-between pt-2 border-t border-gray-100 text-xs">
                            <span className="text-gray-500 inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              Estimasi: {rate.etd}
                            </span>
                            <span className="font-bold text-sm text-primary-900">
                              {formatRupiah(rate.cost)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout Button */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sticky top-24 space-y-6">
                <h3 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">
                  Ringkasan Pesanan
                </h3>

                {/* Items preview */}
                <div className="max-h-60 overflow-y-auto pr-1 space-y-3 divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item.book.id} className="pt-3 first:pt-0 flex items-center gap-3">
                      <div className="relative w-12 aspect-[3/4] bg-gray-100 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                        {item.book.cover_image_url ? (
                          <Image
                            src={item.book.cover_image_url}
                            alt={item.book.title}
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
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 line-clamp-1">
                          {item.book.title}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {item.quantity} eks × {formatRupiah(item.book.final_price || item.book.sale_price || item.book.regular_price)}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-gray-900">
                        {formatRupiah((item.book.final_price || item.book.sale_price || item.book.regular_price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Costs breakdown */}
                <div className="space-y-3 pt-3 border-t border-gray-100 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal Buku ({items.length} judul)</span>
                    <span className="font-semibold text-gray-900">{formatRupiah(booksPrice)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Ongkos Kirim</span>
                    <span className="font-semibold text-gray-900">
                      {selectedCourierRate ? formatRupiah(selectedCourierRate.cost) : '-'}
                    </span>
                  </div>

                  {selectedCourierRate && (
                    <div className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-lg">
                      Kurir: <span className="font-semibold text-gray-800 uppercase">{selectedCourierRate.courier} {selectedCourierRate.service}</span> ({selectedCourierRate.etd})
                    </div>
                  )}
                </div>

                {/* Grand Total */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-baseline mb-6">
                    <span className="text-base font-bold text-gray-900">Grand Total</span>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-primary-900">
                        {formatRupiah(grandTotal)}
                      </span>
                      <p className="text-[11px] text-emerald-600 font-medium">Bebas Biaya Admin Transaksi</p>
                    </div>
                  </div>

                  {/* Primary Pay Action */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedCourierRate}
                    className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Memproses Pesanan...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Bayar Sekarang
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-gray-400 mt-2.5">
                    Mendukung QRIS, GoPay, OVO, ShopeePay, Virtual Account BCA, BRI, BNI, Mandiri & Kartu Kredit.
                  </p>
                </div>

                {/* Trust guarantee */}
                <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Garansi uang kembali 100% jika buku cacat cetak</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" />
                    <span>Transaksi aman terenkripsi Midtrans</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
