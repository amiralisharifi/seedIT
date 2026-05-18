# SEO Management Module — Build Spec

> Target project: SEED IT admin panel at `admin.seedit.ae`.
> Goal: Build a first-class **SEO** module so non-technical users can edit meta tags, descriptions, keywords, social previews, structured data, sitemap, and robots — globally and per content item — in EN and AR.

---

## 1. Context & constraints

- Stack: assume the existing Next.js (App Router) + TypeScript codebase used by the admin. Reuse current UI primitives, styles, sidebar grouping, and form patterns (see the existing "New Page" and "New Blog Post" forms).
- Existing fields to preserve & migrate: `seo_title`, `seo_description`, `seo_noindex` already exist on Blog Posts and Pages. Migrate them into the new unified schema; do not lose data.
- Bilingual: every editable text SEO field MUST have an EN and AR variant, mirroring the rest of the panel (`title`, `tagline`, etc.).
- Auth: same admin auth as the rest of the panel. Only `admin` role can edit.
- DB: same DB the project uses today. Use migrations, not destructive rewrites.

---

## 2. Information architecture (sidebar additions)

Add a new sidebar group **SEO** between `CONTENT` and `SETTINGS` with these items:

1. **Overview** — `/seo` — dashboard with health checks (missing meta, too long titles, duplicate descriptions, pages with `noindex`, broken canonicals).
2. **Global Defaults** — `/seo/defaults` — site-wide defaults applied when a page leaves a field empty.
3. **Pages SEO** — `/seo/pages` — table of all routable entities (Pages, Blog Posts, Case Studies, Services) with inline SEO editing.
4. **Redirects** — `/seo/redirects` — 301/302 source→destination management.
5. **Sitemap** — `/seo/sitemap` — view/regenerate `sitemap.xml`, include/exclude rules.
6. **Robots** — `/seo/robots` — editor for `robots.txt` with live preview.
7. **Structured Data** — `/seo/schema` — JSON-LD templates (Organization, WebSite, Article, BreadcrumbList, FAQPage, Service) bound to entity types.
8. **Verifications** — `/seo/verifications` — Google Search Console, Bing, Yandex, Pinterest meta tags + analytics IDs (GA4, GTM, Plausible).

---

## 3. Data model

Add a single polymorphic `seo_meta` table that attaches to any routable entity, plus supporting tables.

````sql
-- One row per (entity_type, entity_id, locale)
create table seo_meta (
  id              uuid primary key default gen_random_uuid(),
  entity_type     text not null,         -- 'page' | 'blog_post' | 'case_study' | 'service' | 'global'
  entity_id       uuid,                  -- null when entity_type = 'global'
  locale          text not null,         -- 'en' | 'ar'
  title           text,                  -- <title>
  description     text,                  -- <meta name="description">
  keywords        text[],                -- <meta name="keywords">
  canonical_url   text,
  robots          text default 'index,follow',  -- e.g. 'noindex,nofollow'
  og_title        text,
  og_description  text,
  og_image_url    text,
  og_type         text default 'website',
  twitter_card    text default 'summary_large_image',
  twitter_site    text,
  twitter_creator text,
  json_ld         jsonb,                 -- arbitrary schema.org payload
  hreflang        jsonb,                 -- [{lang:'en',href:'...'},{lang:'ar',href:'...'}]
  updated_by      uuid,
  updated_at      timestamptz default now(),
  unique (entity_type, entity_id, locale)
);

create table seo_redirects (
  id          uuid primary key default gen_random_uuid(),
  source      text not null unique,      -- '/old-path'
  destination text not null,             -- '/new-path' or full URL
  status_code int  not null default 301, -- 301 | 302 | 307 | 308
  enabled     boolean not null default true,
  notes       text,
  created_at  timestamptz default now()
);

create table seo_robots (
  id        int primary key default 1,
  content   text not null,
  updated_at timestamptz default now(),
  check (id = 1)                          -- singleton row
);

create table seo_sitemap_rules (
  id          uuid primary key default gen_random_uuid(),
  pattern     text not null,              -- glob like '/admin/*'
  action      text not null,              -- 'include' | 'exclude'
  priority    numeric(2,1) default 0.5,
  changefreq  text default 'weekly'
);
````

Migration step: copy existing `pages.seo_title/seo_description/seo_noindex` and the same fields on `blog_posts` into `seo_meta` with `locale='en'`, then drop those columns in a follow-up migration once code is switched over.

---

## 4. API (Next.js route handlers under `/app/api/seo/...`)

All endpoints require admin session. Return JSON. Validate with Zod.

* `GET    /api/seo/defaults?locale=en`
* `PUT    /api/seo/defaults`                          body: `SeoMetaInput`
* `GET    /api/seo/entities?type=page&locale=en&q=…`  paginated table data
* `GET    /api/seo/entity/:type/:id?locale=en`
* `PUT    /api/seo/entity/:type/:id`                  body: `SeoMetaInput`
* `GET    /api/seo/redirects` | `POST` | `PUT /:id` | `DELETE /:id`
* `GET    /api/seo/robots`   | `PUT`
* `GET    /api/seo/sitemap`  | `POST /regenerate`
* `GET    /api/seo/schema/:entityType` | `PUT`
* `GET    /api/seo/health`                            returns array of issues
* `POST   /api/seo/preview`                           body: `{ url, locale }` → returns rendered `<head>` snippet + Google SERP / Twitter / FB preview HTML

Public side (consumed by the marketing site):

* `GET /api/public/seo/resolve?path=/about&locale=en` → resolved final meta (entity override merged on top of global defaults), used by the Next.js `generateMetadata` of the public site.
* `GET /sitemap.xml`  (rebuilt from DB + rules)
* `GET /robots.txt`   (served from `seo_robots.content`)

---

## 5. UI requirements

### 5.1 Shared `<SeoEditor />` component

Reused on every SEO page. Sections, collapsible:

1. **Basics**

   * Title (with live char counter, recommended ≤ 60, warn > 65)
   * Description (counter, recommended ≤ 155, warn > 165)
   * Keywords (chip input, free text + commit on Enter / `,`)
   * Canonical URL (validated absolute URL)
   * Robots (multi-select: `index`/`noindex`, `follow`/`nofollow`, `noarchive`, `nosnippet`, `max-snippet:N`, `max-image-preview:standard|large|none`)
2. **Open Graph**

   * og:title, og:description, og:image (image picker with 1200×630 guidance + alt text), og:type
3. **Twitter**

   * twitter:card, twitter:site, twitter:creator (auto-fall-back to OG if empty)
4. **Hreflang & i18n**

   * Auto-populated EN/AR pair; allow adding more.
5. **Structured Data (JSON-LD)**

   * Monaco editor with JSON schema validation; "Insert template" dropdown (Article, FAQPage, BreadcrumbList, Organization, Service).
6. **Advanced**

   * Custom `<meta>` tags (key/value list).

### 5.2 Live previews (right column, sticky)

Three tabs:

* **Google** — desktop SERP mock
* **Facebook / OG** — large card mock
* **Twitter / X** — summary_large_image mock
  All previews update on every keystroke.

### 5.3 Pages SEO list (`/seo/pages`)

Data-grid with columns: Path, Title (badge "inherited" when empty), Description (truncated), Robots, Updated. Filters: entity type, locale, has-issues. Bulk actions: "Set noindex", "Clear keywords", "Generate from content with AI" (optional, calls `/api/seo/generate` — feature-flag it).

### 5.4 Overview dashboard (`/seo`)

Cards: total indexable pages, pages missing title, pages missing description, pages with title > 65 chars, pages with description > 165 chars, duplicate titles (group + count), duplicate descriptions, broken canonicals, redirects count, last sitemap regen time. Click-through to filtered list.

### 5.5 Redirects (`/seo/redirects`)

Table + drawer form (source, destination, status code, enabled, notes). CSV import/export. Validate no loops (`A→B→A`) and no source = destination.

### 5.6 Robots editor

Monaco textarea, "Restore default" button, live "what crawlers see" preview, validation warnings (e.g. disallowing `/`).

### 5.7 Sitemap

Show generated URL list with `lastmod`, `changefreq`, `priority`. Include/exclude rule list. "Regenerate now" button.

### 5.8 Structured data

Per-entity-type template editor. Preview using Google's [Rich Results test deep-link](https://search.google.com/test/rich-results) (open in new tab with current JSON pre-filled isn't possible — just open the tool with the public URL).

---

## 6. Integration with existing forms

* In each existing entity edit page (Page, Blog Post, Case Study, Service), **replace** the current `Seo Title / Seo Description / seo Noindex` block with a single embedded `<SeoEditor entityType="…" entityId={id} />` that writes to `seo_meta`.
* Keep the read API used by the public site unchanged in shape if possible; add a thin adapter that returns the merged result of `global default ⨁ entity override`.

---

## 7. Public-site rendering rules

For every public route, `generateMetadata` must:

1. Resolve `path` + `locale`.
2. Fetch `seo/resolve` (server component, cached per ISR window).
3. Merge order: entity override → global defaults → hard-coded fallback in code.
4. Emit `<title>`, `<meta name="description">`, `<meta name="keywords">`, robots, canonical, all OG, all Twitter, hreflang `<link>`s, and any JSON-LD via `<script type="application/ld+json">`.
5. `noindex` MUST be respected.

---

## 8. Validation rules

* Title: 1–70 chars; warn at 60.
* Description: 1–320 chars; warn at 155.
* Keywords: 0–15 items; each 1–40 chars; lowercase normalized.
* Canonical: must parse as absolute URL with `https`.
* OG image: must be reachable, recommend ≥ 1200×630, ≤ 5 MB.
* JSON-LD: must be valid JSON and pass a `@context: 'https://schema.org'` check.
* Redirects: source must start with `/`; no cycles; destination either starts with `/` or is absolute URL.

Use Zod schemas shared between API and forms.

---

## 9. Permissions & audit

* Only `admin` role can read/write.
* Every write records `updated_by` and `updated_at`.
* Add a lightweight `seo_audit_log` table: `id, entity_type, entity_id, locale, field, old_value, new_value, actor, at`. Show last 50 changes in a "History" tab inside `<SeoEditor />`.

---

## 10. Acceptance criteria (must all be true)

1. New `SEO` sidebar group renders the 8 pages listed in §2.
2. Editing SEO for any Page/Blog Post/Case Study/Service and saving persists to `seo_meta` and survives reload.
3. Existing `seo_title` / `seo_description` / `seo_noindex` values for previously-created Pages and Blog Posts are visible in the new editor after migration.
4. The public site's `<head>` reflects edits within one ISR window (≤ 60 s).
5. Switching the editor language tab between **EN** and **AR** loads/saves independent rows.
6. `/sitemap.xml` reflects include/exclude rules and updates after "Regenerate".
7. `/robots.txt` returns the content of `seo_robots.content`.
8. Adding a redirect from `/foo` to `/bar` causes the public site to 301 `/foo` → `/bar`.
9. Overview dashboard shows at least: count of missing titles, missing descriptions, duplicates, noindexed pages.
10. All forms show live SERP/Twitter/Facebook previews and char counters with warning colors.
11. Lighthouse SEO score on a sample edited page is ≥ 95.
12. All endpoints reject unauthenticated callers with 401 and non-admins with 403.

---

## 11. Out of scope (for this PR)

* AI-generated meta suggestions (leave behind a feature flag + stub endpoint).
* Keyword rank tracking / SERP scraping.
* Multi-site / multi-tenant SEO.

---

## 12. Deliverables

* Migrations for the 4 new tables + data backfill.
* `app/(admin)/seo/**` pages and components.
* `app/api/seo/**` route handlers with Zod validation.
* `lib/seo/resolve.ts` used by the public site's `generateMetadata`.
* Updated `app/sitemap.ts` and `app/robots.ts`.
* Tests: unit tests for resolver merge logic and validators; one Playwright smoke test that edits a Page's SEO title and asserts it on the rendered public route.
* Short `README-SEO.md` for editors explaining the UI.

````

---

### How to use this with Claude Code

In your repo, run:

````

claude-code "Implement the SEO module described in ./SEO.md. Start with the data model and migrations, then the API, then the admin UI, then the public-site integration. Stop after each phase for review."

````

A few suggestions before you hand it over:
- If your backend isn't Next.js/Postgres, tell me what it actually is (Supabase? Prisma + SQLite? Rails? Payload?) and I'll rewrite §3, §4, and §7 to match exactly so Claude Code doesn't guess.
- If you want **AI-assisted meta generation** (auto-fill title/description/keywords from the page body), say the word and I'll add a §11.1 prompt-and-endpoint spec.
- If the public site lives in a separate repo from `admin.seedit.ae`, the spec needs an extra "cross-repo contract" section — happy to add it.