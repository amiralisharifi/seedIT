# Start a working session

Run this at the start of every coding session on seed-panel. It catches
the most common "I broke my dev environment overnight" issues before they
waste 30 minutes.

## Quick boot sequence

```bash
cd seed-panel

# 1. Pull latest
git status                          # confirm clean working tree
git pull --rebase origin main

# 2. Sync dependencies (catches missed installs after pulls)
pnpm install

# 3. Check for pending migrations
pnpm db:generate                    # if this creates new files, you have unsynced schema changes
ls packages/db/drizzle/*.sql        # confirm migration files match the schema

# 4. Apply any pending migrations
pnpm db:migrate                     # idempotent — safe to run even if nothing pending

# 5. Sanity check the build
pnpm typecheck                      # should pass clean

# 6. Start dev
pnpm dev
```

If any of these fail, fix before doing anything else.

## What to check in Supabase

Open your Supabase dashboard at the start of each session:

1. **Database → Reports** — any slow queries? Errors?
2. **Auth → Users** — anyone signed up you don't recognize?
   (Should be zero if signups are disabled, which they should be.)
3. **Logs → API** — any 5xx errors from the last 24h?

## What to check in Vercel (if deployed)

1. **Deployments** — is the latest production deploy green?
2. **Analytics → Errors** — any spikes in 4xx/5xx?
3. **Logs** — any errors in the last 24h?

## What to check in n8n (when the server stack is up)

1. **Executions** — any failed runs in the last 24h?
2. **Cron jobs** — did the daily digest run? Did scheduled scrapes run?
3. **Webhook errors** — any incoming webhooks that failed to process?

## Pick up where you left off

Check three things in order:

1. **`git log -5`** — what was I last working on?
2. **Any TODO comments** I left in code — `grep -rn "TODO:" apps/ packages/ config/`
3. **The CLAUDE.md "What's NOT built" section** — am I working on the right
   next thing?

## Recovery from common bad states

### Dev server won't start

```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
rm -rf .turbo apps/*/.turbo packages/*/.turbo
rm -rf apps/panel/.next
pnpm install
pnpm dev
```

### Migrations are out of sync (drizzle complaining)

```bash
# See what's in the local journal vs the DB
cat packages/db/drizzle/meta/_journal.json

# In Supabase SQL Editor:
# SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at;

# If they're truly diverged and you're in development (NOT production):
# In Supabase: DROP SCHEMA public CASCADE; CREATE SCHEMA public;
# Then locally:
rm packages/db/drizzle/*.sql
rm -rf packages/db/drizzle/meta
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### Auth keeps logging me out

- Check Supabase Auth → URL Configuration → Site URL matches your dev URL
- Check redirect URLs include `http://localhost:3000/auth/callback`
- Check `.env.local` `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Clear cookies for localhost in your browser

### TypeScript errors after pulling

```bash
# Usually: outdated package types
pnpm install
pnpm typecheck

# If still broken: stale incremental cache
rm -rf apps/*/.next packages/*/dist *.tsbuildinfo
pnpm typecheck
```

## Before stopping for the day

```bash
git status                          # commit or stash anything pending
pnpm typecheck                      # don't leave broken types
git push                            # don't lose work
```

If there's WIP that won't pass typecheck, commit it on a branch:

```bash
git checkout -b wip/<feature>
git add -A
git commit -m "WIP: <what you're working on>"
git push -u origin wip/<feature>
```
