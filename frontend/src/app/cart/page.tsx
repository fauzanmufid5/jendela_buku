import { Metadata } from 'next';
import CartClient from './CartClient';

export const metadata: Metadata = {
  title: 'Keranjang Belanja | Jendela Buku',
  description: 'Tinjau daftar buku pesanan Anda, periksa kuantitas dan estimasi berat kirim sebelum melanjutkan pembayaran di Jendela Buku.',
};

export default function CartPage() {
  return <CartClient />;
}
