# Add a typed query helper

Use this when the user needs a new database query that will be used in
more than one place. One-off queries can stay inline in their page.

## When to add a helper vs inline query

- **Inline (in the page/component)**: query is used exactly once and is
  unlikely to grow more complex
- **As a helper in `packages/db/src/queries/`**: query is used 2+ places,
  has interesting filtering logic, or wraps a complex join

## Steps to follow

1. **Decide which file.** Existing query files:
   - `queries/businesses.ts` — lead operations (CRM businesses table)
   - `queries/cms.ts` — generic CMS table operations (used by content
     collections)
   - **New domain → new file**, e.g. `queries/outreach.ts`, `queries/demos.ts`

2. **Write the function.** Follow these patterns:

   ```ts
   import { and, eq, isNull } from 'drizzle-orm';
   import { db } from '../client';
   import { businesses, type Business } from '../schema';

   /**
    * One-line description.
    *
    * Used by:
    *   - <page or feature that calls this>
    */
   export async function findActiveLeadsInArea(area: string): Promise<Business[]> {
     return db
       .select()
       .from(businesses)
       .where(
         and(
           isNull(businesses.deletedAt),
           eq(businesses.areaZone, area),
         ),
       );
   }
   ```

3. **Type the return value explicitly** using `Business`, `Demo`, etc.
   exported from `schema.ts`. Even if Drizzle infers it correctly,
   explicit types document intent and survive refactors.

4. **For queries with filters/options**, use a typed options object:

   ```ts
   export interface FindLeadsOptions {
     category?: Business['category'];
     minScore?: number;
     limit?: number;
   }

   export async function findLeadsByOptions(opts: FindLeadsOptions = {}) {
     const conditions = [isNull(businesses.deletedAt)];
     if (opts.category) conditions.push(eq(businesses.category, opts.category));
     // ...
     return db.select().from(businesses).where(and(...conditions));
   }
   ```

5. **For queries with relations** (joins), use `db.query.<table>.findFirst/findMany`
   with `with: {}`:

   ```ts
   export async function getLeadWithDemos(id: string) {
     return db.query.businesses.findFirst({
       where: eq(businesses.id, id),
       with: {
         demos: { with: { template: true } },
       },
     });
   }
   ```

   This requires the relation to be defined in `schema.ts` (at the bottom).
   Add the relation if it's missing.

6. **Export from the queries index** (`packages/db/src/queries/index.ts`):
   ```ts
   export * from './your-new-file';
   ```

7. **Re-export the namespace** is already done — the db package exports
   `queries.*` automatically. So callers do:
   ```ts
   import { queries } from '@seed-panel/db';
   await queries.findActiveLeadsInArea('karama');
   ```

8. **Run typecheck:**
   ```bash
   pnpm typecheck
   ```

## What NOT to do

- Don't write SQL strings. Use Drizzle's query builder.
- Don't query raw — `db.execute(sql\`...\`)` should be rare and commented.
- Don't return more data than the caller needs. If a page only needs
  `{ id, name }`, use `.select({ id: ..., name: ... })`.
- Don't write `Promise<any>`. Either use Drizzle's inference or type
  explicitly.
- Don't make queries do business logic. Queries fetch data, return it
  shaped. Caller decides what to do with it.

## Performance considerations

- **Indexes matter.** Any column you put in a `where` should be indexed
  (`packages/db/src/schema.ts`). Add a new index if needed via the
  `add-migration.md` workflow.
- **Avoid N+1.** If you fetch a list and then loop to fetch related data,
  use `with:` instead.
- **Limit by default.** Add `.limit(50)` or similar to any list query
  unless the caller pages.
- **Use `count()` for totals**, not `.length` on a fetched array.

## Soft delete reminder

Every query that returns a soft-deletable record (businesses, demos, CMS
content) MUST filter `isNull(table.deletedAt)` unless the user explicitly
wants deleted records. Forgetting this is the most common bug pattern.
