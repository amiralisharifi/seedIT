import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '../client';
import { blogPosts } from '../schema';

export async function listPublishedPosts(limit = 20) {
  return db
    .select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.status, 'published'),
        isNull(blogPosts.deletedAt),
      ),
    )
    .orderBy(desc(blogPosts.createdAt))
    .limit(limit);
}

export async function getPostBySlug(slug: string) {
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.slug, slug),
        eq(blogPosts.status, 'published'),
        isNull(blogPosts.deletedAt),
      ),
    )
    .limit(1);
  return post ?? null;
}

export async function incrementPostViewCount(id: string) {
  const { sql } = await import('drizzle-orm');
  await db
    .update(blogPosts)
    .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
    .where(eq(blogPosts.id, id));
}
