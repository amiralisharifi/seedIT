/**
 * Shared field → column mapping for the schema-driven CMS.
 *
 * Two callers write CMS records and they must agree on shape:
 *   - the admin form server action (FormData in)
 *   - the n8n content API (JSON in)
 *
 * The value coercion differs between them (FormData is all strings, JSON has
 * real types), but *where* a field lands is identical — so that part lives
 * here rather than being duplicated.
 */

import type { CollectionDefinition, FieldDef } from '@seed-panel/core';

// Field types whose values are human-language content — eligible to live in the
// localized `content` jsonb on a localized collection. Every other type maps to
// a real top-level column.
export const LOCALIZABLE_TYPES = new Set(['text', 'textarea', 'richText']);

/** The Drizzle property name a field writes to on its table. */
export function colName(name: string, field: FieldDef): string {
  if (field.type === 'image') return name + 'Url';
  if (field.type === 'reference') return name + 'Id';
  return name;
}

/**
 * Whether a field's value belongs in the localized `content` jsonb rather than
 * a top-level column.
 *
 * A content field goes into `content` — but ONLY when it isn't backed by a real
 * column. Fields like `path`, `clientName`, or `seoTitle` have their own column,
 * so they must write there even on a localized collection; otherwise the column
 * stays null and NOT-NULL constraints fail (e.g. pages.path).
 */
export function isLocalizedField(
  collection: CollectionDefinition,
  name: string,
  field: FieldDef,
  columns: Set<string>,
): boolean {
  return (
    Boolean(collection.localized) &&
    LOCALIZABLE_TYPES.has(field.type) &&
    !columns.has(colName(name, field))
  );
}
