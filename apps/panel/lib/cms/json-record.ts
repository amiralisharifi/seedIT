/**
 * Build a CMS record from a JSON payload (the n8n content API).
 *
 * The admin form action has its own FormData path — see the note in
 * `field-mapping.ts` about why only the mapping is shared, not the coercion.
 *
 * This module also carries the validation the rest of the stack doesn't do:
 * the `max` / `required` options in `config/collections.ts` are consumed by the
 * form UI, but nothing enforces them server-side, and every CMS text column is
 * unbounded `text` in Postgres. A machine caller needs a real gate, so the
 * field schema is treated as the contract here.
 */

import type { CollectionDefinition, FieldDef, SelectField } from '@seed-panel/core';
import { colName, isLocalizedField } from './field-mapping';

export interface FieldError {
  field: string;
  message: string;
}

export type BuildJsonResult =
  | { ok: true; record: Record<string, unknown> }
  | { ok: false; errors: FieldError[] };

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Normalize `options` — a select can declare bare strings or {value,label}. */
function selectValues(field: SelectField): string[] {
  return field.options.map((o) => (typeof o === 'string' ? o : o.value));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Coerce one JSON value for one field. Pushes to `errors` and returns
 * `undefined` when the value is unusable; `undefined` also means "caller sent
 * nothing", which the required-check below handles separately.
 */
function coerceValue(
  name: string,
  field: FieldDef,
  value: unknown,
  errors: FieldError[],
): unknown {
  const reject = (message: string): undefined => {
    errors.push({ field: name, message });
    return undefined;
  };

  const asString = (max?: number): unknown => {
    if (typeof value !== 'string') return reject('expected a string');
    if (max !== undefined && value.length > max) {
      return reject(`is ${value.length} characters, maximum is ${max}`);
    }
    return value;
  };

  switch (field.type) {
    case 'text':
    case 'url':
    case 'email':
    case 'icon':
      return asString('max' in field ? field.max : undefined);

    case 'textarea':
      return asString(field.max);

    case 'richText':
      return asString();

    case 'slug': {
      const slug = asString();
      if (typeof slug !== 'string') return undefined;
      if (!SLUG_PATTERN.test(slug)) {
        return reject('must be lowercase kebab-case, e.g. "my-post-title"');
      }
      // `slug` columns are varchar(200) — the one length Postgres enforces.
      if (slug.length > 200) return reject(`is ${slug.length} characters, maximum is 200`);
      return slug;
    }

    case 'image':
    case 'file':
      return asString();

    case 'reference':
      // Resolution (email → id, existence check) is the caller's job — it needs
      // a database round-trip. Here we only require something non-empty.
      return asString();

    case 'number': {
      if (typeof value !== 'number' || Number.isNaN(value)) return reject('expected a number');
      if (field.min !== undefined && value < field.min) return reject(`must be >= ${field.min}`);
      if (field.max !== undefined && value > field.max) return reject(`must be <= ${field.max}`);
      return value;
    }

    case 'boolean':
      if (typeof value !== 'boolean') return reject('expected true or false');
      return value;

    case 'select': {
      const allowed = selectValues(field);
      if (typeof value !== 'string' || !allowed.includes(value)) {
        return reject(`must be one of: ${allowed.join(', ')}`);
      }
      return value;
    }

    case 'date':
    case 'datetime': {
      if (typeof value !== 'string') return reject('expected an ISO 8601 date string');
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return reject(`"${value}" is not a valid date`);
      return parsed;
    }

    case 'tags':
    case 'imageGallery': {
      if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) {
        return reject('expected an array of strings');
      }
      if (field.max !== undefined && value.length > field.max) {
        return reject(`has ${value.length} entries, maximum is ${field.max}`);
      }
      return value;
    }

    case 'blocks':
    case 'repeater': {
      if (!Array.isArray(value)) return reject('expected an array');
      if (field.max !== undefined && value.length > field.max) {
        return reject(`has ${value.length} entries, maximum is ${field.max}`);
      }
      return value;
    }
  }
}

/** Is a coerced value "present" for the purposes of a required check? */
function isPresent(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function buildRecordFromJson(
  collection: CollectionDefinition,
  input: Record<string, unknown>,
  columns: Set<string>,
  options: { passthrough?: readonly string[] } = {},
): BuildJsonResult {
  const errors: FieldError[] = [];
  const record: Record<string, unknown> = {};
  const contentEn: Record<string, unknown> = {};
  const passthrough = options.passthrough ?? [];

  // Reject unknown keys rather than dropping them silently. A machine caller
  // that thinks it set `contentMarkdown` should hear about it, not discover
  // months later that half its payload went nowhere.
  const known = new Set([...Object.keys(collection.fields), ...passthrough]);
  const unknown = Object.keys(input).filter((k) => !known.has(k));
  if (unknown.length > 0) {
    errors.push({
      field: unknown[0]!,
      message: `unknown field${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}. Accepted: ${[...known].sort().join(', ')}`,
    });
  }

  for (const [name, field] of Object.entries(collection.fields)) {
    const raw = input[name];
    const localized = isLocalizedField(collection, name, field, columns);
    const column = colName(name, field);

    // An explicit null clears a nullable column. Required fields can't be
    // cleared, which the check below catches.
    if (raw === null) {
      if (!localized) record[column] = null;
      continue;
    }

    if (raw === undefined) {
      if (field.required) {
        errors.push({ field: name, message: 'is required' });
      }
      continue;
    }

    const value = coerceValue(name, field, raw, errors);
    if (value === undefined) continue;

    if (field.required && !isPresent(value)) {
      errors.push({ field: name, message: 'is required' });
      continue;
    }

    if (localized) {
      contentEn[name] = value;
    } else {
      record[column] = value;
    }
  }

  for (const key of passthrough) {
    const raw = input[key];
    if (raw === undefined) continue;
    if (!isPlainObject(raw)) {
      errors.push({ field: key, message: 'expected an object' });
      continue;
    }
    record[key] = raw;
  }

  if (errors.length > 0) return { ok: false, errors };

  if (Object.keys(contentEn).length > 0) {
    // English-only for now. When Arabic arrives this must merge with the
    // existing `content` on update rather than replacing it — see the same
    // hazard in the admin form action.
    record.content = { en: contentEn, ar: {} };
  }

  return { ok: true, record };
}
