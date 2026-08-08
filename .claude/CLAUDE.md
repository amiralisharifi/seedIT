# seed-panel — Claude Code Context

This file is your standing brief. Read it at the start of every session.

## What this project is

`seed-panel` is a Next.js admin panel + CMS for outbound businesses, built
to be cloned per deployment. Originally for SEED IT (seedit.ae), a Dubai
agency running outbound to salons. Designed from day one to be forked and
rebranded for other clients.

Two halves living in one app:

1. **CRM for outbound** — leads (with Google Maps + Instagram enrichment),
   demo pages, bilingual WhatsApp + email outreach, conversation inbox.
   These have hand-built bespoke UIs.
2. **Schema-driven CMS** — blog posts, pages, services, case studies, team
   members. List/edit pages auto-generated from `config/collections.ts`.

## The stack (memorize this)

| Layer            | Tool                              |
| ---------------- | --------------------------------- |
| Monorepo         | Turborepo + pnpm workspaces       |
| Framework        | Next.js 15 (App Router)           |
| Language         | TypeScript (strict mode)          |
| Database         | Supabase Postgres (Mumbai, ap-south-1) |
| ORM              | Drizzle                           |
| Auth             | Supabase Auth (magic link)        |
| Styling          | Tailwind + shadcn-style           |
| Workflows        | n8n self-hosted on ayvan.me       |
| Email            | Resend                            |
| WhatsApp         | AiSensy (Meta BSP)                |
| Scraping         | Apify                             |
| Hosting          | Vercel Pro (2 projects)           |

## Repo structure

```
seed-panel/
├── apps/
│   └── panel/                       ← The Next.js app (deploys to Vercel)
│       ├── app/
│       │   ├── (auth)/login/        ← Public auth pages
│       │   ├── (panel)/             ← Auth-gated admin
│       │   │   ├── dashboard/
│       │   │   ├── leads/           ← CRM
│       │   │   ├── demos/           ← (not built yet)
│       │   │   ├── outreach/        ← (not built yet)
│       │   │   ├── content/         ← Schema-driven CMS pages
│       │   │   └── settings/
│       │   └── api/
│       ├── components/layout/       ← Sidebar, page header
│       └── lib/                     ← App-specific helpers
├── packages/
│   ├── config/                      ← Zod schemas for the 4 sacred configs
│   ├── core/                        ← Field types, defineCollection, auth
│   ├── db/                          ← Drizzle schema + queries
│   ├── integrations/                ← Supabase, Resend, AiSensy, Apify, n8n
│   └── ui/                          ← Shared UI primitives (cn, etc.)
├── config/                          ← THE FOUR SACRED FILES
│   ├── brand.ts                     ← Visual identity (logo, colors, fonts)
│   ├── collections.ts               ← CMS collections (schema-driven)
│   ├── integrations.ts              ← Which external services are on/off
│   └── locales.ts                   ← Supported languages (en + ar)
└── docs/
    ├── architecture.md              ← Read for deeper context
    └── fork-for-client.md           ← Deployment walkthrough
```

## Hard architectural rules (do not break these)

These are the rules that keep seed-panel forkable. Breaking them costs
weeks of refactoring later.

1. **Never hardcode brand strings.** No `"SEED IT"`, no `#6c2bd9`, no
   `"hello@seedit.ae"` anywhere outside `config/brand.ts`. Always import
   from `@/config`. Use Tailwind classes (`bg-primary`, `font-display`)
   that read from CSS variables sourced from brand config.

2. **Integrations must be optional.** Every external service is opt-in via
   `config/integrations.ts`. If `integrations.aisensy.enabled` is false,
   the WhatsApp UI should hide gracefully. Never crash on missing API keys
   at runtime — check `enabled` first.

3. **Database-per-deployment, not multi-tenant.** No `workspace_id` columns.
   No RLS for tenant isolation. Each clone = its own Supabase project.

4. **Schema-driven for content, bespoke for CRM.** Adding a new CMS
   collection? Edit `config/collections.ts` (+ schema + queries map). Adding
   a CRM feature like a custom dashboard widget? That's a hand-coded route
   under `apps/panel/app/(panel)/`. Don't conflate the two.

5. **All timestamps stored as UTC `timestamptz`, displayed in Asia/Dubai.**

6. **Soft delete via `deletedAt`** for businesses, demos, and CMS content.
   Never hard-delete. Old leads come back to life sometimes.

7. **Bilingual via `jsonb`**, shape `{ en: {...}, ar: {...} }`. Never split
   into separate columns (`title_en`, `title_ar`) — kills schema flexibility.

## Where things go (when adding code)

| Task                                              | Goes in...                                          |
| ------------------------------------------------- | --------------------------------------------------- |
| Change SEED IT logo/colors                        | `config/brand.ts`                                   |
| Add a CMS content type                            | `config/collections.ts` + db schema + register      |
| Add a bespoke CRM page (e.g. "campaigns")         | `apps/panel/app/(panel)/campaigns/`                 |
| Add a Postgres column                             | `packages/db/src/schema.ts` → `pnpm db:generate`    |
| Add a reusable query                              | `packages/db/src/queries/`                          |
| Wrap a new external service                       | `packages/integrations/src/<service>/`              |
| Webhook from AiSensy/Resend                       | `apps/panel/app/api/webhooks/<svc>/route.ts`        |
| Endpoint n8n calls                                | `apps/panel/app/api/n8n/<action>/route.ts`          |
| Endpoint admin UI calls to trigger n8n            | `apps/panel/app/api/trigger/<action>/route.ts`      |
| Shared React component (multiple pages)           | `apps/panel/components/`                            |
| UI primitive shared across apps                   | `packages/ui/src/`                                  |
| One-off script (migration, backfill)              | `scripts/` at repo root                             |

## Database conventions

- UUID primary keys (`uuid().defaultRandom()`)
- `createdAt` + `updatedAt` (with `$onUpdate`) on every table
- `deletedAt` for soft-deletable tables
- `jsonb` for flexible/bilingual fields
- Index every column you filter by in queries
- Composite indexes for common filter combinations (see `huntIdx` on businesses)

## Three-direction data flow

The `app/api/` folder has three subdirectories with distinct purposes:

- **`api/n8n/*`** — endpoints n8n CALLS (n8n → our app). Always verify the
  shared secret header (`verifyN8nRequest`).
- **`api/webhooks/*`** — endpoints external services CALL (AiSensy → us,
  Resend → us). Verify each provider's signature.
- **`api/trigger/*`** — endpoints our admin UI CALLS (admin → us → n8n).
  Used to kick off scrapes, sends, etc.

Don't mix these. Each direction has different auth requirements.

## Build / test / typecheck commands

```bash
pnpm dev              # all packages in watch mode
pnpm build            # production build
pnpm typecheck        # TS check across the monorepo
pnpm lint             # lint across the monorepo
pnpm format           # prettier write
pnpm db:generate      # generate migration from schema changes
pnpm db:migrate       # apply pending migrations
pnpm db:studio        # local DB UI
pnpm db:seed          # populate templates + message templates
```

Always run `pnpm typecheck` before claiming a feature is done. The strict
TypeScript config catches a lot.

## What's built (v0.1) — DO NOT REBUILD

- Monorepo scaffold (Turborepo, pnpm, base tsconfig)
- Brand config system with Zod validation + Google Fonts injection
- Supabase Auth with magic link, middleware, callback route
- Sidebar layout with sections sourced from `config/collections.ts`
- Dashboard with daily metrics from `queries.getDailyMetrics()`
- Leads list page (server-rendered, server component)
- Schema-driven content list pages at `/content/[collection]`
- Brand settings (read-only view of `config/brand.ts`)
- Full database schema for CRM + CMS (17 tables, 9 enums)
- Integration adapters: Supabase (server/browser/admin), Resend,
  AiSensy (template + session), Apify (run/get/dataset), n8n (trigger/verify)
- Seed script for 3 salon templates + 2 message templates

## What's NOT built (next-up)

In rough priority order:

1. **Server stack on ayvan.me** — Docker Compose with Caddy + n8n + Plausible
   + Uptime Kuma + Postgres for n8n backend
2. **First n8n workflow** — Apify scrape orchestrator (JSON export)
3. **Demo generator + preview pages** — `app/d/[slug]` salon demo SSR pages
4. **Outreach composer** — pick template, render preview, send via AiSensy
5. **Schema-driven form generator** — edit pages for CMS collections
6. **Conversation inbox** — WhatsApp + email reply view
7. **Apify scrape trigger UI** — kicks the n8n workflow
8. **Marketing site** — Astro project at `seedit.ae`

## When in doubt about scope

The goal is **send your first WhatsApp demo to a real Dubai salon**.
Everything that doesn't move that forward is lower priority. Prefer
finishing the outbound loop over polishing the CMS.

## Dubai-specific things to remember

- WhatsApp >> email for outbound. ~10–15% reply rate vs 1–3% email.
- Bilingual (Arabic + English) matters. Send English first, Arabic on follow-up.
- Send times: Sun–Thu 10:00–11:30 and 15:00–17:00 GST. Avoid Fri mornings.
- Avoid Ramadan iftar window (~sunset to 9 PM).
- "Trade license + VAT TRN + Dubai address" is a stronger trust signal
  than logos of past clients.
- Always include "I'm in Business Bay, can come to you" — uniquely powerful
  in UAE because everyone else chases remote scale.

## Test target niches (start narrow)

Tier 1 salons specifically:
- Ladies salons in Karama, Bur Dubai, Satwa
- Men's barbershops in Karama, Deira
- Brow/lash/nail studios

These have the highest "no website + active WhatsApp + decision-maker
on-premise" overlap.

## Style notes for code I write

- **Server components by default.** Mark `'use client'` only when needed
  (state, effects, browser APIs).
- **Server actions for forms**, not API routes. Keep `/api/*` for webhooks
  and n8n traffic only.
- **No `any`.** Use `unknown` + narrow, or proper generics. The existing
  `@ts-expect-error` in `queries/cms.ts` is a deliberate tradeoff documented
  in comments — don't propagate that pattern elsewhere.
- **No barrel files inside `apps/panel`.** Direct imports are fine and
  better for tree-shaking. Package public APIs (the `packages/*/src/index.ts`
  files) are the exception.
- **Functional, immutable.** No classes except where the SDK forces it.
- **Tailwind classes inline.** Don't extract one-off styles to CSS modules.
  Repeated patterns → shared component in `apps/panel/components/`.
- **Errors that the user sees: friendly.** Errors in logs / dev: detailed.

## What to ask the user before committing to a path

- New feature that crosses a package boundary → confirm before refactoring
- Schema migration → show the SQL diff before running `db:migrate`
- New integration → confirm we need it before adding to `packages/integrations/`
- Anything touching auth / RLS → explicit confirmation, this is a footgun area

## What to NOT ask (just do)

- Adding a column to an existing table
- Adding a query helper
- Writing a new admin page
- Fixing a TypeScript error
- Improving an existing component
- Adding tests
