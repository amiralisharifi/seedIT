import { and, asc, desc, eq, isNull, sql } from 'drizzle-orm';
import { db } from '../client';
import { demos, demoViews, businesses, templates, type TemplateContent } from '../schema';

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

/* ─────────── Admin / generator queries ─────────── */

export async function listDemos(limit = 100) {
  return db
    .select({
      id: demos.id,
      slug: demos.slug,
      status: demos.status,
      viewCount: demos.viewCount,
      lastViewedAt: demos.lastViewedAt,
      createdAt: demos.createdAt,
      businessName: businesses.name,
      businessAreaZone: businesses.areaZone,
    })
    .from(demos)
    .innerJoin(businesses, eq(demos.businessId, businesses.id))
    .where(isNull(demos.archivedAt))
    .orderBy(desc(demos.createdAt))
    .limit(limit);
}

export async function getDemoById(id: string) {
  const [row] = await db
    .select({ demo: demos, business: businesses })
    .from(demos)
    .innerJoin(businesses, eq(demos.businessId, businesses.id))
    .where(eq(demos.id, id))
    .limit(1);
  return row ?? null;
}

export async function listBusinessesForPicker() {
  return db
    .select({
      id: businesses.id,
      name: businesses.name,
      areaZone: businesses.areaZone,
      category: businesses.category,
    })
    .from(businesses)
    .where(isNull(businesses.deletedAt))
    .orderBy(asc(businesses.name))
    .limit(500);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function isSlugTaken(slug: string): Promise<boolean> {
  const [row] = await db
    .select({ id: demos.id })
    .from(demos)
    .where(eq(demos.slug, slug))
    .limit(1);
  return !!row;
}

export async function generateUniqueDemoSlug(businessName: string): Promise<string> {
  const base = slugify(businessName) || 'demo';
  if (!(await isSlugTaken(base))) return base;
  for (let i = 0; i < 5; i++) {
    const suffix = Math.random().toString(36).slice(2, 6);
    const candidate = `${base}-${suffix}`;
    if (!(await isSlugTaken(candidate))) return candidate;
  }
  throw new Error('Could not generate a unique slug after 5 attempts');
}

/**
 * Lazily creates a default salon template if none exist, then returns its id.
 * Demos require a template_id (FK, not null) but we ship one design today,
 * so picking is implicit until we add more templates.
 */
export async function getOrCreateDefaultTemplateId(): Promise<string> {
  const [existing] = await db
    .select({ id: templates.id })
    .from(templates)
    .where(eq(templates.slug, 'salon-basic-v1'))
    .limit(1);
  if (existing) return existing.id;

  const [created] = await db
    .insert(templates)
    .values({
      slug: 'salon-basic-v1',
      name: 'Salon Basic',
      description: 'SEED IT styled salon demo — hero, services, about, contact.',
      componentPath: 'salon-basic-v1',
      suitableCategories: ['salon_ladies', 'salon_mens_barber', 'salon_brow_lash'],
    })
    .returning({ id: templates.id });
  return created!.id;
}

export type DemoContentInput = TemplateContent;

export async function createDemo(input: {
  businessId: string;
  templateId: string;
  slug: string;
  content: DemoContentInput;
  status?: 'draft' | 'approved' | 'sent' | 'viewed' | 'multi_viewed' | 'replied' | 'archived';
  internalNotes?: string;
}) {
  const [row] = await db
    .insert(demos)
    .values({
      businessId: input.businessId,
      templateId: input.templateId,
      slug: input.slug,
      content: input.content,
      status: input.status ?? 'draft',
      internalNotes: input.internalNotes,
    })
    .returning({ id: demos.id });
  return row!;
}

export async function updateDemo(
  id: string,
  input: {
    slug?: string;
    content?: DemoContentInput;
    status?: 'draft' | 'approved' | 'sent' | 'viewed' | 'multi_viewed' | 'replied' | 'archived';
    internalNotes?: string;
  },
) {
  const updates: Record<string, unknown> = {};
  if (input.slug !== undefined) updates.slug = input.slug;
  if (input.content !== undefined) updates.content = input.content;
  if (input.status !== undefined) updates.status = input.status;
  if (input.internalNotes !== undefined) updates.internalNotes = input.internalNotes;
  if (Object.keys(updates).length === 0) return;
  await db.update(demos).set(updates).where(eq(demos.id, id));
}
