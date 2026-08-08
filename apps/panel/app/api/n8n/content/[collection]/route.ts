/**
 * Content ingestion endpoint for n8n.
 *
 *   POST /api/n8n/content/<collection-slug>
 *   headers: X-Seed-Panel-Secret: <N8N_SHARED_SECRET>
 *   body:    JSON keyed by collection *field* names (not column names, not f_*)
 *
 * Collection-agnostic: it reads `config/collections.ts` the same way the admin
 * form does, so a new CMS collection is ingestible without touching this file.
 *
 * Every response is JSON, including 401/404/405 — a POST to a path Next can't
 * match renders the not-found page and throws, which surfaces as an HTML error
 * shell instead of a parseable body on the caller's side.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyN8nRequest } from '@seed-panel/integrations/n8n';
import { queries } from '@seed-panel/db';
import type { FieldDef } from '@seed-panel/core';
import { collections } from '@/config';
import { buildRecordFromJson, type FieldError } from '@/lib/cms/json-record';
import { revalidatePublicContent } from '@/lib/cms/revalidate';

/**
 * Real table columns writable through this API that aren't modelled as admin
 * form fields. Anything not listed here and not in the collection's `fields` is
 * rejected as unknown.
 */
const PASSTHROUGH_COLUMNS: Record<string, readonly string[]> = {
  blog_posts: ['seo'],
};

/** Postgres unique-constraint violation. */
const PG_UNIQUE_VIOLATION = '23505';

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === PG_UNIQUE_VIOLATION
  );
}

function publicUrlFor(collectionSlug: string, slug: unknown): string | null {
  if (collectionSlug !== 'blog_posts' || typeof slug !== 'string') return null;
  const base = process.env.PUBLIC_SITE_URL;
  if (!base) return null;
  try {
    return new URL(`/blog/${slug}`, base).toString();
  } catch {
    return null;
  }
}

/**
 * Turn reference field values into real ids. Callers may send either a UUID or
 * an email for a `users` reference, because a workflow author knows their own
 * address but not their row id.
 */
async function resolveReferences(
  collectionFields: Record<string, FieldDef>,
  record: Record<string, unknown>,
): Promise<FieldError[]> {
  const errors: FieldError[] = [];

  for (const [name, field] of Object.entries(collectionFields)) {
    if (field.type !== 'reference') continue;

    const column = `${name}Id`;
    const value = record[column];
    if (typeof value !== 'string' || value.length === 0) continue;

    if (field.to !== 'users') {
      // Other reference targets aren't resolvable yet — pass the value through
      // and let the foreign key reject it if it's wrong.
      continue;
    }

    if (value.includes('@')) {
      const id = await queries.findUserIdByEmail(value);
      if (!id) {
        errors.push({ field: name, message: `no user found with email "${value}"` });
        continue;
      }
      record[column] = id;
    } else if (!(await queries.userIdExists(value))) {
      errors.push({ field: name, message: `no user found with id "${value}"` });
    }
  }

  return errors;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> },
) {
  if (!verifyN8nRequest(request.headers)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { collection: collectionSlug } = await params;
  const collection = collections.find((c) => c.slug === collectionSlug);
  if (!collection) {
    return NextResponse.json(
      {
        error: 'unknown_collection',
        message: `No collection "${collectionSlug}". Available: ${collections.map((c) => c.slug).join(', ')}`,
      },
      { status: 404 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { error: 'invalid_body', message: 'Expected a JSON object.' },
      { status: 400 },
    );
  }

  const columns = new Set(queries.getCmsColumnNames(collection.table));
  const built = buildRecordFromJson(collection, body as Record<string, unknown>, columns, {
    passthrough: PASSTHROUGH_COLUMNS[collection.table],
  });

  if (!built.ok) {
    return NextResponse.json({ error: 'validation_failed', errors: built.errors }, { status: 400 });
  }

  const referenceErrors = await resolveReferences(collection.fields, built.record);
  if (referenceErrors.length > 0) {
    return NextResponse.json(
      { error: 'reference_not_found', errors: referenceErrors },
      { status: 422 },
    );
  }

  let inserted: { id: string };
  try {
    inserted = (await queries.createCmsRecord(collection.table, built.record)) as { id: string };
  } catch (error) {
    if (isUniqueViolation(error)) {
      // Almost always a re-run against a slug that already exists. 409 lets the
      // caller branch instead of treating it as a server fault.
      return NextResponse.json(
        {
          error: 'duplicate',
          message: error instanceof Error ? error.message : 'A record with these values exists.',
          slug: built.record.slug ?? null,
        },
        { status: 409 },
      );
    }
    const message = error instanceof Error ? error.message : String(error);
    console.error(`n8n content insert failed for ${collectionSlug}:`, message);
    return NextResponse.json({ error: 'database_error', message }, { status: 500 });
  }

  await revalidatePublicContent(collectionSlug, built.record.slug);

  return NextResponse.json(
    {
      id: inserted.id,
      slug: built.record.slug ?? null,
      url: publicUrlFor(collectionSlug, built.record.slug),
    },
    { status: 201 },
  );
}

export async function GET() {
  return NextResponse.json(
    { error: 'method_not_allowed', message: 'This endpoint accepts POST only.' },
    { status: 405, headers: { allow: 'POST' } },
  );
}
