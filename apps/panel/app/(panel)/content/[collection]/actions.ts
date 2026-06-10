'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { collections } from '@/config';
import { queries } from '@seed-panel/db';
import type { CollectionDefinition, FieldDef } from '@seed-panel/core';

// Field types whose values are human-language content — eligible to live in the
// localized `content` jsonb on a localized collection. Every other type maps to a
// real top-level column.
const LOCALIZABLE_TYPES = new Set(['text', 'textarea', 'richText']);

// The Drizzle property name a field writes to on its table.
function colName(name: string, field: FieldDef): string {
  if (field.type === 'image') return name + 'Url';
  if (field.type === 'reference') return name + 'Id';
  return name;
}

function buildRecord(
  col: CollectionDefinition,
  fd: FormData,
  columns: Set<string>,
): Record<string, unknown> {
  const contentEn: Record<string, unknown> = {};
  const record: Record<string, unknown> = {};

  for (const [name, field] of Object.entries(col.fields)) {
    const raw = fd.get(`f_${name}`);
    const column = colName(name, field);

    // A content field goes into the localized `content` jsonb — but ONLY when
    // it isn't backed by a real top-level column. Fields like `path`,
    // `clientName`, or `seoTitle` have their own column, so they must write
    // there even on a localized collection; otherwise the column stays null and
    // NOT-NULL constraints fail (e.g. pages.path).
    if (col.localized && LOCALIZABLE_TYPES.has(field.type) && !columns.has(column)) {
      if (raw !== null) contentEn[name] = raw as string;
      continue;
    }

    if (raw === null || raw === '') continue;

    if (field.type === 'boolean') {
      record[column] = raw === 'true' || raw === 'on';
    } else if (field.type === 'number') {
      record[column] = raw ? Number(raw) : null;
    } else if (field.type === 'datetime' || field.type === 'date') {
      record[column] = raw ? new Date(raw as string) : null;
    } else if (field.type === 'tags') {
      record[column] = (raw as string).split(',').map((t) => t.trim()).filter(Boolean);
    } else if (field.type === 'blocks' || field.type === 'repeater') {
      // The editor submits these as a JSON array string → store as jsonb.
      try {
        const parsed: unknown = JSON.parse(raw as string);
        record[column] = Array.isArray(parsed) ? parsed : [];
      } catch {
        record[column] = [];
      }
    } else {
      record[column] = raw;
    }
  }

  if (Object.keys(contentEn).length > 0) {
    record.content = { en: contentEn, ar: {} };
  }

  return record;
}

export type ActionResult = { error: string } | { id: string };

function getPublicRevalidateUrl() {
  const publicSiteUrl = process.env.PUBLIC_SITE_URL;
  if (!publicSiteUrl) return null;

  try {
    return new URL('/api/revalidate', publicSiteUrl).toString();
  } catch {
    console.warn('PUBLIC_SITE_URL is not a valid URL; skipping public site revalidation.');
    return null;
  }
}

async function revalidatePublicContent(collectionSlug: string, slug?: unknown) {
  if (collectionSlug !== 'blog_posts') return;

  const revalidateUrl = getPublicRevalidateUrl();
  const secret = process.env.REVALIDATE_SECRET;
  if (!revalidateUrl || !secret) return;

  const paths = ['/blog'];
  if (typeof slug === 'string' && slug.length > 0) {
    paths.push(`/blog/${slug}`);
  }

  await Promise.allSettled(
    paths.map(async (path) => {
      const response = await fetch(revalidateUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-revalidate-secret': secret,
        },
        body: JSON.stringify({ path }),
        signal: AbortSignal.timeout(5_000),
      });

      if (!response.ok) {
        console.warn(`Public site revalidation failed for ${path}: ${response.status}`);
      }
    }),
  );
}

export async function createRecord(
  collectionSlug: string,
  _prev: ActionResult | null,
  fd: FormData,
): Promise<ActionResult> {
  const collection = collections.find((c) => c.slug === collectionSlug);
  if (!collection) return { error: `Collection not found: ${collectionSlug}` };

  const columns = new Set(queries.getCmsColumnNames(collection.table));
  const data = buildRecord(collection, fd, columns);

  // Validate required top-level fields
  const slugField = Object.entries(collection.fields).find(([, f]) => f.type === 'slug');
  if (slugField && !data[slugField[0]]) {
    return { error: 'Slug is required. Type a title first so it auto-fills, or enter one manually.' };
  }

  let inserted: { id: string };
  try {
    inserted = (await queries.createCmsRecord(collection.table, data)) as { id: string };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Database error: ${msg}` };
  }

  revalidatePath(`/content/${collectionSlug}`);
  await revalidatePublicContent(collectionSlug, data.slug);
  redirect(`/content/${collectionSlug}/${inserted.id}`);
}

export async function updateRecord(
  collectionSlug: string,
  id: string,
  _prev: ActionResult | null,
  fd: FormData,
): Promise<ActionResult> {
  const collection = collections.find((c) => c.slug === collectionSlug);
  if (!collection) return { error: `Collection not found: ${collectionSlug}` };

  const columns = new Set(queries.getCmsColumnNames(collection.table));
  const data = buildRecord(collection, fd, columns);

  try {
    await queries.updateCmsRecord(collection.table, id, data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Database error: ${msg}` };
  }

  revalidatePath(`/content/${collectionSlug}`);
  revalidatePath(`/content/${collectionSlug}/${id}`);
  await revalidatePublicContent(collectionSlug, data.slug);
  return { id };
}
