import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jendela Buku | Toko Buku Akademik & Referensi Terpercaya',
  description:
    'Platform toko buku online terlengkap untuk akademisi, mahasiswa, dan profesional. Tersedia buku ajar, monograf, dan referensi riset dengan pengiriman cepat ke seluruh Indonesia.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-[#0f172a] antialiased">
        {children}
      </body>
    </html>
  );
}
