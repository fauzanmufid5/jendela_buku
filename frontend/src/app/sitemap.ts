import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/katalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  try {
    const res = await fetch(`${apiUrl}/books?limit=100`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const books = data.data || [];

      const bookRoutes: MetadataRoute.Sitemap = books.map((book: any) => ({
        url: `${baseUrl}/buku/${book.slug}`,
        lastModified: new Date(book.updated_at || book.created_at || new Date()),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));

      return [...staticRoutes, ...bookRoutes];
    }
  } catch (error) {
    console.error('Failed to load books for sitemap:', error);
  }

  return staticRoutes;
}
