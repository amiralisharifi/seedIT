# Add a new CMS collection

Use this when the user wants a new content type (e.g., "add a `testimonials`
collection" or "add `properties` for a real-estate client").

This is the schema-driven path — NOT for CRM features. CRM features are
bespoke pages, not collections.

## Steps to follow

1. **Confirm the collection name** with the user (snake_case, plural, e.g.
   `testimonials`, `properties`, `events`). Confirm the singular form too.

2. **Confirm the fields.** Ask the user what fields they want. Map each to
   one of the field types in `packages/core/src/fields.ts`:
   - text, textarea, richText
   - number, boolean, select
   - date, datetime
   - slug, url, email
   - image, imageGallery, file, icon
   - tags, reference, repeater, blocks

   Push back if they pick the wrong field type for their use case. E.g.
   "tags" for a small fixed set of categories should be a `select` with
   `multiple: true` instead.

3. **Determine if it's bilingual.** Default yes (en + ar). For things like
   "team_members" where the photo+name is universal but the role/bio is
   bilingual, set `localized: true` and the form will show locale tabs.

4. **Add to `config/collections.ts`.** Use `defineCollection({...})`. Match
   the existing style — `slug`, `name`, `nameSingular`, `icon` (lucide name),
   `description`, `table` (snake_case DB table), `titleField`, `listFields`,
   then the `fields` object.

5. **Add the database table to `packages/db/src/schema.ts`.** Follow these
   patterns:
   - UUID `id` primary key
   - For bilingual content: `content: jsonb('content').$type<LocalizedContent>().notNull().default({})`
     instead of separate columns per field
   - For non-localized scalars (slug, status, dates): regular columns
   - `status: contentStatusEnum('status').notNull().default('draft')` if it
     has draft/publish lifecycle
   - `createdAt`, `updatedAt` (with `$onUpdate`), `deletedAt`
   - Indexes on `status` and any commonly-filtered columns

6. **Register the table in `packages/db/src/queries/cms.ts`.** Add it to
   the `cmsTables` map at the top of the file. Without this, the generic
   CMS list page won't find it.

7. **Generate the migration:**
   ```bash
   pnpm db:generate
   ```
   Then SHOW THE USER the generated SQL in `packages/db/drizzle/*.sql`
   before applying. Get confirmation, then:
   ```bash
   pnpm db:migrate
   ```

8. **Verify it works.** Tell the user:
   - Restart `pnpm dev`
   - Navigate to `/content/<slug>` — should show empty state
   - Sidebar should now have the new collection listed

## What NOT to do

- Don't add bespoke routes for this collection — the generic
  `/content/[collection]` handles list view. Edit/detail pages are
  generated similarly when that feature ships.
- Don't add per-collection components — the form generator handles
  rendering from `fields` config.
- Don't skip the queries/cms.ts registration step — easy to forget,
  breaks the list page silently.
- Don't use `text_en`, `text_ar` columns. Use `content: jsonb`.

## Special cases

- **Collection that needs admin-only access:** add `adminOnly: true` in
  the nav config eventually, but for now this isn't supported per-collection.
  Mention this to the user as a limitation.
- **Collection without bilingual content:** set `localized: false`, store
  fields as regular columns instead of inside `content: jsonb`.
- **Collection with file uploads:** flag that the upload flow needs
  Supabase Storage configured (`integrations.supabase.storageBucket`) and
  the `media` table.
