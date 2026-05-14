# Architecture

This document explains how seed-panel is structured and why. Read it before
making non-trivial changes.

## The two halves

seed-panel does two distinct things:

1. **CRM for outbound** — leads, demos, outreach, conversations.
   Bespoke flows, hand-built UI.
2. **Schema-driven CMS** — blog posts, pages, services, case studies.
   Generic CRUD generated from `config/collections.ts`.

They share infrastructure (auth, layout, database, integrations) but have
separate UIs. Don't try to make the CRM use the schema-driven layer — its
flows are too bespoke for generic CRUD.

## Data flow

```
                ┌────────────────────────────────────┐
                │           VERCEL                   │
                │  ┌──────────────────────────────┐  │
   You / team ──┤  │       Next.js admin          │  │
                │  │  ┌──────┐  ┌─────────────┐   │  │
                │  │  │  UI  │  │ API routes  │   │  │
                │  │  └──┬───┘  └──────┬──────┘   │  │
                │  └─────┼─────────────┼──────────┘  │
                └────────┼─────────────┼─────────────┘
                         │             │
                         ▼             ▼
                 ┌──────────────┐  ┌───────────────┐
                 │   Supabase   │  │  n8n (ayvan)  │
                 │  Postgres +  │◀─┤  Workflows    │
                 │  Auth        │  └───────────────┘
                 └──────────────┘          ▲
                                           │
                                  ┌────────┴────────┐
                                  │ Apify, AiSensy, │
                                  │ Resend, Google  │
                                  └─────────────────┘
```

**Direction of data:**

- **User → UI → DB**: standard CRUD via server actions
- **UI → trigger route → n8n**: when you click "scrape" or "send WhatsApp",
  Next.js POSTs to n8n which does the heavy lifting
- **n8n → /api/n8n/* → DB**: n8n writes scraped leads, score updates, etc.
  back to Supabase via Next.js API routes (typed, validated)
- **External → /api/webhooks/* → DB**: AiSensy posts incoming WhatsApps,
  Resend posts email events — handled by webhook routes

## The packages

| Package                     | Owns                                                                   |
| --------------------------- | ---------------------------------------------------------------------- |
| `@seed-panel/config`        | Zod schemas for the four user-editable config files                    |
| `@seed-panel/core`          | Field type definitions, `defineCollection`, auth shapes, permissions   |
| `@seed-panel/db`            | Drizzle schema, db client, typed query helpers                         |
| `@seed-panel/integrations`  | Adapters for Supabase, Resend, AiSensy, Apify, n8n                     |
| `@seed-panel/ui`            | Shared UI primitives (`cn`, future shadcn components)                  |
| `@seed-panel/panel`         | The Next.js app — routes, pages, server actions                        |

## The four sacred config files

In `config/`. These are the only files a fork needs to edit for branding.

- **`brand.ts`** — Name, logo paths, colors (HSL), fonts, business info
- **`collections.ts`** — Which CMS collections this deployment exposes
- **`integrations.ts`** — Which external services are on/off, plus per-service options
- **`locales.ts`** — Supported languages

These are validated at startup. If you remove a required field, the app fails
fast with a clear error rather than rendering broken UI.

## Adding a CMS collection

1. Add a row to `config/collections.ts` using `defineCollection({...})`
2. Add the matching DB table to `packages/db/src/schema.ts`
3. Register the table in `packages/db/src/queries/cms.ts` (the `cmsTables` map)
4. Run `pnpm db:generate && pnpm db:migrate`

That's it. The list page at `/content/<slug>` works automatically. (Detail
and edit pages are coming next; they read the same schema.)

## Adding a CRM feature (bespoke)

CRM features are hand-built. Add a route under `apps/panel/app/(panel)/` and
write the page/components/server-actions like any other Next.js feature.
Use `@seed-panel/db` for data access and `@seed-panel/integrations` for
external calls.

## Auth model

- **Sign-in**: Supabase magic link (email-only, no passwords)
- **First user**: auto-promoted to `admin` role
- **Subsequent users**: invited via Supabase Auth admin (eventually a UI for this)
- **Roles**: `admin`, `operator`, `viewer` — defined in `@seed-panel/core/auth`
- **Permission checks**: dumb helpers in `@seed-panel/core/auth` — refine when
  needed

## Where to put new code

| You want to...                                              | Goes in...                                          |
| ----------------------------------------------------------- | --------------------------------------------------- |
| Change the SEED IT logo or colors                           | `config/brand.ts`                                   |
| Add a "case studies" content type                           | `config/collections.ts` + db schema + register      |
| Add a custom CRM page like "campaigns"                      | `apps/panel/app/(panel)/campaigns/`                 |
| Add a Postgres column                                       | `packages/db/src/schema.ts` + `pnpm db:generate`    |
| Add a typed query reusable across pages                     | `packages/db/src/queries/`                          |
| Wrap a new external service (e.g. Calendly)                 | `packages/integrations/src/calendly/`               |
| Add a webhook from AiSensy / Resend                         | `apps/panel/app/api/webhooks/<service>/route.ts`    |
| Add an endpoint that n8n calls                              | `apps/panel/app/api/n8n/<action>/route.ts`          |
| Trigger an n8n workflow from a button                       | `apps/panel/app/api/trigger/<action>/route.ts`      |
| Add a shared React component used by multiple pages         | `apps/panel/components/` (or `packages/ui` if shared cross-app) |
| Add a one-off script (data migration, backfill)             | `scripts/` at the root                              |

## Database conventions

- All tables: UUID primary keys (`uuid().defaultRandom()`)
- All tables: `createdAt`, `updatedAt` (with `$onUpdate` trigger)
- Long-lived data: also `deletedAt` (soft delete)
- Flexible/per-tenant fields: `jsonb`
- Bilingual content: `content: jsonb` with `{ en: {...}, ar: {...} }` shape
- Indexes on every column you actually filter by in queries

## Brand isolation principles

To stay forkable:

- **Never hardcode "SEED IT"** anywhere. Use `brand.name`.
- **Never hardcode brand colors**. Use Tailwind classes like `bg-primary`
  which read from CSS variables sourced from `brand.colors`.
- **Never hardcode fonts**. Use Tailwind classes like `font-display` which
  read from CSS variables sourced from `brand.fonts`.
- **Never hardcode business email/phone**. Use `brand.business.*`.
- **Don't sprinkle config reads everywhere**. Import from `@/config` and
  destructure once at the top of the file.

A CI check (TODO) will grep for hardcoded brand strings and fail builds.
