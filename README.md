# seed-panel

A schema-driven admin panel & CMS for outbound businesses. Built to be cloned
per deployment — one repo per client, each with its own Supabase project,
Vercel deployment, and brand.

> Originally built for SEED IT (seedit.ae) to run an outbound system targeting
> Dubai salons. Designed from day one to be forked and rebranded for other
> agencies and end clients.

## What you get

- **CRM for outbound** — leads (with Google Maps + Instagram enrichment),
  demo pages, bilingual outreach via WhatsApp and email, conversation inbox.
- **Schema-driven CMS** — define collections (blog posts, services, case
  studies) in `config/collections.ts`; the panel auto-generates list/edit
  views. No bespoke admin code per content type.
- **Bilingual content** — English + Arabic by default; all collections have
  per-locale fields and RTL support.
- **Integrations layer** — Supabase (DB + auth + storage), Resend (email),
  AiSensy (WhatsApp), Apify (scraping), n8n (workflows), Plausible (analytics).
  Each is opt-in.
- **White-label by config** — change brand name, logo, colors, fonts in one
  file. No code edits, no Tailwind rebuild.

## Architecture

```
seed-panel/
├── apps/
│   └── panel/                       # The Next.js admin app (this is what gets deployed)
│       ├── app/
│       │   ├── (auth)/login/        # Public auth pages
│       │   ├── (panel)/             # Auth-gated admin routes
│       │   │   ├── dashboard/
│       │   │   ├── leads/           # CRM
│       │   │   ├── demos/
│       │   │   ├── outreach/
│       │   │   ├── content/         # Schema-driven CMS pages
│       │   │   └── settings/
│       │   └── api/                 # Webhooks, n8n hooks, trigger routes
│       ├── components/
│       │   └── layout/              # Sidebar, page header
│       └── lib/                     # App-specific helpers
│
├── packages/
│   ├── config/                      # Zod validation for the four user-editable configs
│   ├── core/                        # Field types, collection definitions, auth shapes
│   ├── db/                          # Drizzle schema + typed queries
│   ├── integrations/                # External service adapters
│   └── ui/                          # Shared UI primitives (cn, components)
│
├── config/                          # ◀ THE FILES YOU EDIT WHEN FORKING
│   ├── brand.ts                     # Logo, colors, fonts, business info
│   ├── collections.ts               # CMS collections (schema-driven)
│   ├── integrations.ts              # Which external services are enabled
│   └── locales.ts                   # Supported languages
│
├── docs/                            # Architecture notes, fork-for-client guide
└── scripts/                         # Setup helpers (CLI tooling comes later)
```

## Stack

| Layer            | Tool                          | Why                                                          |
| ---------------- | ----------------------------- | ------------------------------------------------------------ |
| Framework        | Next.js 15 (App Router)       | Server components + server actions for the admin             |
| Monorepo         | Turborepo + pnpm workspaces   | Standard, fast, caching                                      |
| Database         | Supabase Postgres             | Auth + DB + storage in one; per-deployment isolation         |
| ORM              | Drizzle                       | Type-safe, no codegen runtime                                |
| Auth             | Supabase Auth (magic links)   | Built-in, no second vendor                                   |
| UI               | Tailwind + shadcn-style       | Copy-paste components, no library lock-in                    |
| Workflows        | n8n (self-hosted on ayvan.me) | Long-running jobs Vercel can't handle                        |
| Email            | Resend                        | Excellent deliverability for cold outreach                   |
| WhatsApp         | AiSensy (or Wati)             | Official Meta BSP, Dubai-friendly                            |
| Scraping         | Apify                         | Pay-per-use, Google Maps + Instagram actors                  |
| Hosting          | Vercel Pro                    | One project per deployment                                   |

## Quickstart (the SEED IT deployment)

Prerequisites: Node 20+, pnpm 9+, a Supabase project (Frankfurt region, Pro
tier), a Vercel account.

```bash
# 1. Install
pnpm install

# 2. Configure
cp apps/panel/.env.example apps/panel/.env.local
# Fill in DATABASE_URL, DIRECT_URL, Supabase keys

# 3. Set up the database
pnpm db:generate         # creates migration files from schema
pnpm db:migrate          # applies them to Supabase
pnpm db:seed             # populates salon templates + outreach scripts

# 4. Run
pnpm dev
# → http://localhost:3000

# 5. Sign in
# Click "Send sign-in link", check your email, click the link.
# The first signed-in account is auto-promoted to admin.
```

You should see the SEED IT branded admin with the dashboard, leads page,
and the schema-driven content collections (blog posts, pages, etc.).

## How to fork for a new client

The whole point of this codebase. To deploy a seed-panel for "Acme Salon":

```bash
# 1. Clone
git clone https://github.com/seedit/seed-panel acme-salon-panel
cd acme-salon-panel

# 2. Edit the four sacred config files
#    These are the ONLY files you need to touch for branding.
vi config/brand.ts          # name, logo paths, colors, fonts, business info
vi config/collections.ts    # which content collections this client needs
vi config/integrations.ts   # which services to wire up
vi config/locales.ts        # languages to support

# 3. Replace brand assets
#    Drop the client's logo files at apps/panel/public/brand/
cp ~/Downloads/acme-logo.svg apps/panel/public/brand/logo.svg
cp ~/Downloads/acme-logo-dark.svg apps/panel/public/brand/logo-dark.svg
cp ~/Downloads/acme-mark.svg apps/panel/public/brand/mark.svg

# 4. Create a new Supabase project (Frankfurt region, Pro tier)
#    Copy connection strings into apps/panel/.env.local

# 5. Run migrations + seed
pnpm db:migrate
pnpm db:seed

# 6. Deploy to Vercel
#    Point admin.acmesalon.com at this Vercel project
vercel link
vercel deploy --prod

# 7. Invite the client's admin user
#    Go to Supabase Auth → Users → Invite
#    They get a magic link, sign in, can use the panel
```

That's the entire fork process. From `git clone` to working panel: ~30 minutes
when you've done it once. Future versions will add a `create-seed-panel` CLI
that automates steps 1–7.

## Architectural principles

The discipline that keeps seed-panel forkable:

**1. No hardcoded brand anywhere.** Strings like "SEED IT", colors like
`#6c2bd9`, font names — these MUST live in `config/brand.ts`. The build will
include grep checks in CI to enforce this.

**2. Integrations are optional.** Every external service can be disabled in
`config/integrations.ts`. The UI hides features whose integrations are off.
A client who doesn't send WhatsApp simply turns AiSensy off.

**3. Config-driven UI generation.** New content collections defined in
`config/collections.ts` get list/detail pages, forms, and API routes
automatically. New CRM features (like a custom dashboard widget for a client)
are explicit code, not config — because they're bespoke business logic.

**4. Database-per-deployment.** Each clone gets its own Supabase project.
No multi-tenancy gymnastics, no RLS-driven data isolation bugs, no shared
ops risk between clients.

**5. The four sacred config files are the API.** When a client wants to
customize, they edit those four files (and brand assets). Everything else
is implementation that we maintain.

## Development

```bash
pnpm dev          # all packages in watch mode
pnpm build        # production build
pnpm typecheck    # TS check across the monorepo
pnpm lint         # lint across the monorepo
pnpm format       # prettier write

# Database
pnpm db:generate  # generate migration from schema changes
pnpm db:migrate   # apply pending migrations
pnpm db:studio    # local web UI for the database
pnpm db:seed      # populate templates + message templates
```

## What's in v0.1

- ✅ Monorepo scaffold with Turborepo
- ✅ Brand config system (CSS variables + Google Fonts injection)
- ✅ Four sacred config files with Zod validation
- ✅ Supabase Auth (magic link)
- ✅ Sidebar layout with sections sourced from config
- ✅ Dashboard with daily metrics
- ✅ Leads table (CRM)
- ✅ Schema-driven content collection list pages
- ✅ Brand settings page (read-only)
- ✅ Database integration with the full schema (CRM + CMS)
- ✅ Integration adapters (Supabase, Resend, AiSensy, Apify, n8n)

## What's coming next

- Demo generator + preview pages (so we can actually send outreach)
- Outreach composer (template editor, send button, sent log)
- Conversation inbox (WhatsApp + email replies)
- Schema-driven content forms (create/edit a blog post in the panel)
- Media library (upload to Supabase Storage)
- Apify scrape job UI (trigger, status, view results)
- n8n workflow files (importable JSON)
- The marketing site (Astro)
- The server stack (Docker Compose for ayvan.me)
- `create-seed-panel` CLI (after we have a real second deployment)

## License

UNLICENSED — proprietary. Not for redistribution.
