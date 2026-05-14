# Add a database column or migration

Use this when modifying the database schema — adding a column, an index,
changing an enum, etc.

## Steps to follow

1. **Edit `packages/db/src/schema.ts`.** Add/modify the column in the
   appropriate table. Follow existing patterns:
   - Use the Drizzle column builders (`text()`, `uuid()`, `integer()`, etc.)
   - Use `timestamp(..., { withTimezone: true })` for any timestamp
   - Use `jsonb(...).$type<...>()` for typed JSON
   - Add `.notNull()` if the field shouldn't be nullable
   - Add `.default(...)` for new non-null columns on existing tables
     (otherwise the migration fails on existing rows)
   - Add an index if this column will be filtered/sorted by

2. **Update the relations** at the bottom of `schema.ts` if you added an FK.

3. **Update type exports** if you added a new table.

4. **Generate the migration:**
   ```bash
   pnpm db:generate
   ```

5. **READ THE GENERATED SQL** in `packages/db/drizzle/<timestamp>_<name>.sql`
   before applying. Things to check:
   - The migration uses `ALTER TABLE`, not `DROP TABLE` (unless explicitly
     dropping)
   - Defaults are populated for existing rows
   - Indexes use `CREATE INDEX IF NOT EXISTS`
   - No data loss without explicit confirmation

6. **Show the user the SQL.** Get explicit confirmation before:
   ```bash
   pnpm db:migrate
   ```

7. **Update query helpers** if needed (`packages/db/src/queries/*.ts`).
   New filter parameter? Add to the relevant `*Filter` type.

8. **Update TypeScript usage sites.** The new column types propagate
   through inferred `Select`/`Insert` types automatically, but you may
   need to handle the new field in:
   - Server components rendering this table
   - Forms creating/editing rows
   - Seed scripts

## What NOT to do

- Don't write raw SQL migrations in the `drizzle/` folder. Always edit
  `schema.ts` and regenerate.
- Don't run `db:migrate` without showing the user the SQL first. Data loss
  in production is unrecoverable on the Supabase free tier and expensive
  to recover on Pro.
- Don't add columns without `.default()` to non-empty tables. The
  migration will fail.
- Don't drop columns without explicit user confirmation, even if they
  seem unused.

## If the migration fails

Common causes:
- **Connection refused on port 5432**: `DIRECT_URL` is wrong, or Supabase
  IP allowlist is blocking. Check Supabase → Settings → Database → Network
  Restrictions.
- **`relation already exists`**: the migration was partially applied. Check
  `drizzle.__drizzle_migrations` table in Supabase to see what's been applied.
- **`type ... does not exist`**: an enum was referenced before it was
  created. Reorder statements in the migration SQL manually.
- **NOT NULL violation on existing rows**: you added a NOT NULL column
  without a default. Add `.default()` to schema, regenerate.

## After a successful migration

- Run `pnpm typecheck` to catch usages that need updating
- Run `pnpm dev` and test the affected screens
- Commit the schema change AND the generated migration file together
