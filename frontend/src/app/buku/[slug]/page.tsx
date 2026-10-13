import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import BookDetailClient from './BookDetailClient';
import { Book } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBookDetail(slug: string): Promise<{ book: Book; relatedBooks: Book[] } | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  try {
    const res = await fetch(`${apiUrl}/books/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    return {
      book: json.data,
      relatedBooks: json.related_books || [],
    };
  } catch (error) {
    console.error('Error fetching book detail:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getBookDetail(slug);

  if (!detail) {
    return {
      title: 'Buku Tidak Ditemukan | Jendela Buku',
    };
  }

  const { book } = detail;
  return {
    title: `${book.title} | Jendela Buku`,
    description: book.description.substring(0, 160),
    openGraph: {
      title: `${book.title} - ${book.author}`,
      description: book.description.substring(0, 160),
      images: [
        {
          url: book.cover_image_url,
          width: 800,
          height: 1067,
          alt: book.title,
        },
      ],
    },
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = await getBookDetail(slug);

  if (!detail) {
    notFound();
  }

  const { book, relatedBooks } = detail;

  // Schema.org JSON-LD structured data for Google Search
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: {
      '@type': 'Person',
      name: book.author,
    },
    publisher: {
      '@type': 'Organization',
      name: book.publisher,
    },
    isbn: book.isbn,
    numberOfPages: book.pages,
    image: book.cover_image_url,
    description: book.description,
    offers: {
      '@type': 'Offer',
      price: book.final_price,
      priceCurrency: 'IDR',
      availability: book.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="flex-1 pb-16 md:pb-0">
        <BookDetailClient book={book} relatedBooks={relatedBooks} />
      </main>

      <Footer />
    </div>
  );
}
