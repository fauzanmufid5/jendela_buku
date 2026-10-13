import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1)} kg`;
  }
  return `${grams} gram`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function createWhatsAppOrderUrl(
  bookTitle: string,
  bookSlug: string,
  price: number,
  phone: string = '6281234567890'
): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://jendelabuku.com';
  const productUrl = `${baseUrl}/buku/${bookSlug}`;
  
  const text = encodeURIComponent(
    `Halo Admin Jendela Buku,\n\nSaya ingin memesan buku:\n` +
    `📖 *${bookTitle}*\n` +
    `💰 Harga: ${formatRupiah(price)}\n` +
    `🔗 Link: ${productUrl}\n\n` +
    `Mohon info estimasi ongkos kirim dan total pembayarannya. Terima kasih!`
  );

  return `https://wa.me/${phone}?text=${text}`;
}
