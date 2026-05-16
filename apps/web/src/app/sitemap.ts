import type { MetadataRoute } from 'next';
import { queries } from '@seed-panel/db';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
  ];

  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await queries.listPublishedPosts(1000);
    postRoutes = posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt ?? p.publishedAt ?? p.createdAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch {
    // DB unreachable → at least the static routes are crawlable
  }

  return [...staticRoutes, ...postRoutes];
}
