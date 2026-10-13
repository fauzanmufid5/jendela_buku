import { Metadata } from 'next';
import OrderDetailClient from './OrderDetailClient';

interface OrderPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Invoice #${id} | Jendela Buku`,
    description: `Rincian nota pembayaran dan status pengiriman pesanan #${id} di Jendela Buku.`,
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  return <OrderDetailClient orderNumber={id} />;
}
