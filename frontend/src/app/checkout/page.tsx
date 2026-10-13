import { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout & Pembayaran | Jendela Buku',
  description: 'Selesaikan transaksi pesanan buku akademik Anda secara aman dengan kalkulasi ongkos kirim real-time dan payment gateway Midtrans.',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
