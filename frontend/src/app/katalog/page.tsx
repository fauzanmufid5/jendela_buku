import { Suspense } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import CatalogClient from './CatalogClient';

export const metadata = {
  title: 'Katalog Buku Akademik & Referensi | Jendela Buku',
  description:
    'Jelajahi seluruh koleksi buku referensi, buku ajar, dan monograf riset berdasarkan bidang ilmu. Filter berdasarkan kategori, harga, format, dan buku terlaris.',
};

export default function KatalogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="w-10 h-10 border-4 border-[#0f2942] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-semibold text-slate-600">Memuat katalog buku...</p>
          </div>
        }>
          <CatalogClient />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
