'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { collections } from '@/config';
import { queries } from '@seed-panel/db';
import type { CollectionDefinition } from '@seed-panel/core';
import { colName, isLocalizedField } from '@/lib/cms/field-mapping';
import { revalidatePublicContent } from '@/lib/cms/revalidate';

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

    // Localized content goes into the `content` jsonb, but only when it isn't
    // backed by a real column — see isLocalizedField for why.
    if (isLocalizedField(col, name, field, columns)) {
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
    // NOTE: this replaces `content` wholesale, so `ar` is reset on every save.
    // Harmless while the site is English-only, but it MUST become a merge with
    // the existing row before any Arabic translation is entered — otherwise the
    // first edit to a bilingual post silently drops its Arabic side.
    record.content = { en: contentEn, ar: {} };
  }

  return record;
}

export type ActionResult = { error: string } | { id: string };

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
