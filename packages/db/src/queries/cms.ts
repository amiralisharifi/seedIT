/**
 * Generic CMS query helpers.
 *
 * The schema-driven content collections (defined in config/collections.ts)
 * use these to provide list/detail/create/update without bespoke code per
 * collection. The trick is that all CMS tables follow the same shape:
 *
 *   id, content (jsonb localized), status, ..., createdAt, updatedAt, deletedAt
 *
 * So one set of generic queries handles all of them. The `table` parameter
 * comes from the collection definition.
 */

import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { db } from '../client';
import {
  blogPosts,
  pages,
  caseStudies,
  services,
  teamMembers,
  contentStatusEnum,
} from '../schema';

// Map from collection table name (in config) to actual Drizzle table object.
// Adding a new CMS collection? Add the table to schema.ts and register it here.
const cmsTables = {
  blog_posts: blogPosts,
  pages: pages,
  case_studies: caseStudies,
  services: services,
  team_members: teamMembers,
} as const;

export type CmsTableName = keyof typeof cmsTables;

export function getCmsTable(name: string) {
  if (!(name in cmsTables)) {
    throw new Error(
      `Unknown CMS table "${name}". Registered tables: ${Object.keys(cmsTables).join(', ')}`,
    );
  }
  return cmsTables[name as CmsTableName];
}

export interface CmsListOptions {
  status?: (typeof contentStatusEnum.enumValues)[number];
  limit?: number;
  offset?: number;
}

export async function listCmsRecords(tableName: string, opts: CmsListOptions = {}) {
  const table = getCmsTable(tableName);

  // We can't statically know which columns exist beyond the common ones.
  // Drizzle returns the row shape per table — fine at runtime, narrowed at call sites.
  let query = db.select().from(table).where(isNull(table.deletedAt));

  if (opts.status) {
    query = db
      .select()
      .from(table)
      // @ts-expect-error — status exists on most CMS tables but not all; safe at runtime because callers only pass status for collections that have it
      .where(and(isNull(table.deletedAt), eq(table.status, opts.status)));
  }

  return query
    .orderBy(desc(table.createdAt))
    .limit(opts.limit ?? 50)
    .offset(opts.offset ?? 0);
}

export async function getCmsRecordById(tableName: string, id: string) {
  const table = getCmsTable(tableName);
  const [row] = await db.select().from(table).where(eq(table.id, id)).limit(1);
  return row;
}

export async function createCmsRecord(tableName: string, data: Record<string, unknown>) {
  const table = getCmsTable(tableName);
  const [inserted] = await db.insert(table).values(data).returning();
  return inserted;
}

export async function updateCmsRecord(
  tableName: string,
  id: string,
  data: Record<string, unknown>,
) {
  const table = getCmsTable(tableName);
  const [updated] = await db.update(table).set(data).where(eq(table.id, id)).returning();
  return updated;
}

export async function softDeleteCmsRecord(tableName: string, id: string) {
  const table = getCmsTable(tableName);
  return db.update(table).set({ deletedAt: new Date() }).where(eq(table.id, id));
}
