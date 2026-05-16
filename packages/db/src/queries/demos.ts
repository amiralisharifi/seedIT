import { and, eq, isNull, sql } from 'drizzle-orm';
import { db } from '../client';
import { demos, demoViews, businesses } from '../schema';

/**
 * Fetch a demo by its public slug, joined with the underlying business
 * so the public demo page can render contact info, name, address, etc.
 * Returns null when the slug doesn't exist or the business has been soft-deleted.
 */
export async function getDemoBySlug(slug: string) {
  const [row] = await db
    .select({ demo: demos, business: businesses })
    .from(demos)
    .innerJoin(businesses, eq(demos.businessId, businesses.id))
    .where(
      and(
        eq(demos.slug, slug),
        isNull(demos.archivedAt),
        isNull(businesses.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

/**
 * Record a demo view: insert an audit row in demo_views and bump the
 * denormalized counter on demos. Both are fire-and-forget safe — failures
 * never block the page render.
 */
export async function recordDemoView(
  demoId: string,
  meta: {
    visitorHash?: string;
    locale?: string;
    referrer?: string;
    userAgent?: string;
  } = {},
) {
  await db.insert(demoViews).values({
    demoId,
    visitorHash: meta.visitorHash,
    locale: meta.locale,
    referrer: meta.referrer,
    userAgent: meta.userAgent,
  });
  await db
    .update(demos)
    .set({
      viewCount: sql`${demos.viewCount} + 1`,
      lastViewedAt: new Date(),
      firstViewedAt: sql`coalesce(${demos.firstViewedAt}, now())`,
    })
    .where(eq(demos.id, demoId));
}
