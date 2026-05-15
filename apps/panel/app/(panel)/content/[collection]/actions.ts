'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { collections } from '@/config';
import { queries } from '@seed-panel/db';
import type { CollectionDefinition, FieldDef } from '@seed-panel/core';

const TOP_LEVEL_TYPES = new Set([
  'slug', 'select', 'boolean', 'datetime', 'date',
  'image', 'imageGallery', 'tags', 'reference',
  'number', 'url', 'email', 'file', 'icon', 'blocks', 'repeater',
]);

function isLocalized(name: string, field: FieldDef, col: CollectionDefinition) {
  if (!col.localized) return false;
  if (TOP_LEVEL_TYPES.has(field.type)) return false;
  if (name.startsWith('seo')) return false;
  return true;
}

function colName(name: string, field: FieldDef): string {
  if (field.type === 'image') return name + 'Url';
  if (field.type === 'reference') return name + 'Id';
  return name;
}

function buildRecord(col: CollectionDefinition, fd: FormData): Record<string, unknown> {
  const contentEn: Record<string, unknown> = {};
  const record: Record<string, unknown> = {};

  for (const [name, field] of Object.entries(col.fields)) {
    const raw = fd.get(`f_${name}`);

    if (isLocalized(name, field, col)) {
      if (raw !== null) contentEn[name] = raw as string;
      continue;
    }

    const col_ = colName(name, field);
    if (raw === null || raw === '') continue;

    if (field.type === 'boolean') {
      record[col_] = raw === 'true' || raw === 'on';
    } else if (field.type === 'number') {
      record[col_] = raw ? Number(raw) : null;
    } else if (field.type === 'datetime' || field.type === 'date') {
      record[col_] = raw ? new Date(raw as string) : null;
    } else if (field.type === 'tags') {
      record[col_] = (raw as string).split(',').map((t) => t.trim()).filter(Boolean);
    } else {
      record[col_] = raw;
    }
  }

  if (Object.keys(contentEn).length > 0) {
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

  const data = buildRecord(collection, fd);

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

  const data = buildRecord(collection, fd);

  try {
    await queries.updateCmsRecord(collection.table, id, data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Database error: ${msg}` };
  }

  revalidatePath(`/content/${collectionSlug}`);
  revalidatePath(`/content/${collectionSlug}/${id}`);
  return { id };
}
