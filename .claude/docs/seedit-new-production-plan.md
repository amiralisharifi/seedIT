# SEEDIT `/new` → Production Homepage — Consolidated Build Plan

**Owner:** Amirali · **Repo:** seedIT (`apps/web`, `apps/panel`, `config`, `packages/*`)
**Status:** ready to build · **Source PRDs:** `seedit-new-prd.md`, `seedit-news-pipeline.md`

Merges the two PRDs into one sequenced plan, corrected against what already
exists in the repo. This is a **port + de-hardcode + extend** job, not a rebuild.

---

## Locked decisions

1. **News content → reuse `blog_posts` → `/blog`.** Add `sourceUrls` (+ optional
   `type`) to the existing collection. No separate `news` table/collection/route.
2. **Contact form → `contact_inquiries`** (existing inbound table). Not the CRM
   `leads` table.
3. **`/about` → block system** (the page builder shipped this session) + 1–2 new
   block types. Not a hand-coded route.
4. **Book-a-call → scroll to `#contact`** (PRD default A). No scheduling embed.

## Already built — DO NOT rebuild

- **`/blog` + `/blog/[slug]`** — live, read published `blog_posts` from the CMS,
  full SEO + JSON-LD `Article` + OG + ISR (`revalidate=3600`).
  → `apps/web/src/app/blog/*`
- **Contact form + endpoint** — `ContactForm.tsx` → `api/contact` →
  `createInquiry` → `contact_inquiries`. Fields already match the PRD.
- **WhatsApp float, reveal-at-~60%, `prefers-reduced-motion`** — exist on root
  `/` and on `/new` (reveal fix landed this session).
- **`/api/revalidate`** (uses `REVALIDATE_SECRET`) and `verifyN8nRequest`.
- **Page block system** — catch-all `apps/web/src/app/[...path]/page.tsx`,
  `config/blocks.ts`, renderers in `apps/web/src/components/blocks/`. `/about`
  rides this.

## Standing constraints (apply to every phase)

- **Forkability gate.** Brand *identity* tokens (name, email, phone, WhatsApp,
  site URL, colors, fonts) come from `config/brand.ts` via `@/config` — never
  inline. Page *marketing copy* may stay as documented top-of-file constants.
  Run the `forkability-guardian` agent before merging.
- Server components by default; `'use client'` only for the form, WhatsApp
  button, and mobile menu.
- Content visible without JS; respect `prefers-reduced-motion`.
- `pnpm typecheck && pnpm lint && pnpm build` green before each phase is "done".
  (Note: `next lint` is broken on Next 16 repo-wide — fix in Phase 0 or accept
  typecheck as the gate.)

---

## Phase 0 — Config foundation + de-hardcode `/new`

The forkability gate everything else depends on. Do first.

**How contact data actually works (corrects the PRDs).** Contact values are NOT
hardcoded on the live site — they live in a panel-editable `contact` settings
row (`Settings → Contact` → `saveSettings('contact')`) layered over `brand.ts`
defaults, read at runtime via `getSettings('contact')`. The current `/`
homepage already consumes this. So: **real phone / WhatsApp / hours are typed
into the panel, never into code.** `brand.ts` only supplies fork defaults.

0a. **Add `hours`** end-to-end (it exists nowhere yet): `brand.business.hours` +
    its Zod schema (`packages/config`), the `Settings → Contact` form + action +
    page initial. *(Done — landed first; panel/config-only, low risk.)*

0b. **Give `apps/web` access to `@/config`** — the real blocker. `apps/web`
    tsconfig only has `@/* → ./src/*`; it can't import `brand` at all, which is
    *why* `/new` is hardcoded. Mirror the panel: add `@/config` + `@/config/*`
    path aliases → `../../config`, and verify `apps/web` resolves the transitive
    deps (`@seed-panel/config`/`core`) — add to `package.json` if missing. Gate
    on a successful `next build` (can't verify in the sandbox).

0c. **Shared contact helper** `apps/web/src/lib/contact.ts` — `getContact()`
    reads `getSettings('contact')` merged over `brand.business` defaults, exposes
    `{ phone, whatsapp, supportEmail, hours, waDigits, waLink, telLink }`. No
    literal fallbacks (today's `|| 'hello@seedit.ae'` violates sacred-config).
    Use it on `/`, `/new`, and the WhatsApp/contact components.

0d. **De-hardcode `/new`** (`new/page.tsx`, `landing.css`): make it `async`;
    `CONTACT_EMAIL` → `getContact().supportEmail`; `SITE` → `SITE_URL`
    (`@/lib/site`, already exists); `'SEED IT'`/`'SEEDIT'` → `brand.name`/
    `shortName`. The stylized hero split (`SEED`/`IT` accent) needs a small
    design call — keep visual, source text from `brand.name`. Keep `HERO_COPY`,
    `STACK_BIO`, `TAGS`, `TECH`, product list as documented page content (the 5
    product names → later candidate for config/CMS).

**Exit:** `forkability-guardian` clean on `/new`; `next build` green.
**Effort:** ~0.5–1 day (the alias/deps + build verification is the real cost).
**Blocks:** all other phases.

---

## Phase 1 — Navigation IA + persistent Book-a-call

`apps/web/src/app/new/page.tsx` (nav markup) + `landing.css` + the relevant
`apps/web/public/landing/v2/*.js`.

- Fix labels/targets to the PRD §3.1 IA:
  - Products → `#products` · Services → `#services` · Capabilities → `#stack`
  - About → `/about` · Blog → `/blog` · Contact → `#contact`
- Persistent **Book a call** button in the header (visible in the sticky/
  condensed scroll state), scrolling to `#contact`.
- Mobile hamburger drawer with the same items; Book-a-call + WhatsApp reachable
  without scrolling. Respect `prefers-reduced-motion` on the drawer.

**Exit:** every nav link resolves to the right section/page; Book-a-call persists
on scroll and mobile. **Effort:** ~1 day. **Deps:** Phase 0.

---

## Phase 2 — Floating WhatsApp button

New client component, e.g. `apps/web/src/components/WhatsAppFloat.tsx`, mounted
on `/new` (and reusable on `/about`, `/blog`).

- Fixed bottom-right, brand-styled, links to
  `https://wa.me/<digits from brand.business.whatsapp>` with a prefilled message
  built from `brand.name`.
- Hidden when `#contact` is in view (IntersectionObserver) to avoid overlap.
- Respects mobile safe-area insets.

**Exit:** appears on all target pages, opens correct chat with prefill, no
overlap with the form. **Effort:** ~0.5 day. **Deps:** Phase 0.

---

## Phase 3 — Contact form ported into `/new`

Reuse the existing backend; restyle the front-end to `/new`.

- **Backend unchanged:** keep `api/contact` → `createInquiry` →
  `contact_inquiries`. (No `leads`, no schema change.) Add a honeypot field +
  basic validation if not already present.
- **Front-end:** render the contact section inside `/new` at `#contact`, styled
  with `landing.css` (the existing `ContactForm.tsx` uses root-site classes, so
  this is a restyle, not a drop-in). Same fields, success/error states, no
  reload, accessible labels.
- Restore **phone / email / hours** display from `brand.business`.

**Exit:** form validates, writes a `contact_inquiries` row, shows success/error
without reload. **Effort:** ~1 day. **Deps:** Phase 0.

---

## Phase 4 — Conversion content ported (condensed)

Port the proof/process/why-us from the current site into `/new` sections,
restyled. These also feed Phase 5's `/about`.

- Proof strip (projects shipped · on-time % · avg project time).
- 4-step process (Discovery → Scope → Build → Launch & support).
- Trust signals (trade license / VAT / AED·USD invoicing) — pull license/VAT
  from `brand.business.tradeLicense` / `vatTrn` (fill when available).

**Exit:** sections render on `/new`, reveal-on-scroll consistent with the rest.
**Effort:** ~1 day. **Deps:** Phase 0.

---

## Phase 5 — `/about` via the block system

Build `/about` as a published `pages` row rendered by the catch-all route.

- **New block types** (schema in `config/blocks.ts` + renderer in
  `apps/web/src/components/blocks/` + register in `BlockRenderer`):
  - `proofStrip` — repeater of `{ value, label }`.
  - `process` — repeater of `{ step, title, text }`.
- Compose `/about` from: `hero` → about copy (`richText`) → `proofStrip` →
  trust signals → `process` → `cta`.
- Linked from nav + footer. SEO via the page's `seoTitle`/`seoDescription`
  (already wired in the catch-all route).

**Exit:** `/about` renders all PRD §3.3 blocks, editable from the panel, linked
from nav + footer. **Effort:** ~1 day (mostly the 2 block types).
**Deps:** Phase 0; block system (done).

---

## Phase 6 — Blog visual alignment (functional already)

`/blog` + `/blog/[slug]` already work. Only restyle their nav/shell to match
`/new` so the site feels unified. No data/SEO changes.

**Exit:** blog pages share `/new`'s header/footer/WhatsApp. **Effort:** ~0.5 day.

---

## Phase 7 — News pipeline backend (publish into `blog_posts`)

The genuinely-new backend from `seedit-news-pipeline.md`, retargeted to
`blog_posts`. The n8n workflow itself is external (not in this repo).

1. **Migration** (`packages/db/src/schema.ts` → `pnpm db:generate`, show SQL):
   add `sourceUrls jsonb default '[]'` to `blog_posts`; optional `type` tag to
   distinguish pipeline posts. Index if filtered.
2. **`POST /api/n8n/news/publish`** (`apps/panel/app/api/n8n/news/publish/`):
   `verifyN8nRequest` → Zod-validate `{ title, slug, metaDescription, tags[],
   bodyMarkdown, ar:{...}, featuredImageUrl, sourceUrls[] }` → insert a
   `blog_posts` row (`status='published'`, `publishedAt=now`, bilingual
   `content` jsonb, `sourceUrls`, `coverImageUrl`). **Markdown→HTML** at publish
   (the blog renderer expects HTML `body`). Return `{ slug, url }`.
3. **`GET /api/n8n/news/seen`** (same folder): `verifyN8nRequest` → recent
   `sourceUrls` from `blog_posts` for dedupe (new query in
   `packages/db/src/queries/blog.ts`).
4. **Revalidation:** n8n calls the existing `/api/revalidate?secret=…` for
   `/blog` and `/blog/{slug}` (per the pipeline doc) — no new revalidate code.
5. **Image:** n8n uploads to Supabase Storage and passes the public URL; keep
   bucket/path configurable. No image handling in seed-panel beyond storing URL.

**Exit:** a signed n8n call publishes a post that appears on `/blog` after
revalidation; dedupe endpoint returns prior source URLs.
**Effort:** ~1–1.5 days. **Deps:** none (parallel to Phases 1–6).

---

## Phase 8 — Launch

1. Extend `revalidatePublicContent` to also bust a saved **page**'s `path`
   (currently blog-only) so `/about` edits show immediately.
2. Swap `/new` → `/` (make it the homepage), remove the `noindex,nofollow`
   robots block, set canonical to `https://seedit.ae`.
3. Final QA: forkability-guardian clean; `pnpm typecheck && lint && build` green;
   manual pass of every acceptance criterion below.

**Effort:** ~0.5 day. **Deps:** Phases 0–7.

---

## Acceptance criteria (from PRD §6, reconciled)

- [ ] Header nav shows the §3.1 IA; every link resolves; Book-a-call persists on
      scroll + mobile.
- [ ] Floating WhatsApp on all pages, correct prefilled chat, no form overlap.
- [ ] Contact form validates → `contact_inquiries` row → success/error, no reload.
- [ ] `/about` renders all §3.3 blocks; linked from nav + footer; panel-editable.
- [ ] `/blog` lists published posts; `/blog/[slug]` has SEO + OG; a freshly
      published (pipeline) post appears after revalidation.
- [ ] No hardcoded brand identity strings/colors (forkability-guardian passes).
- [ ] `pnpm typecheck && pnpm lint && pnpm build` pass.

## Sequencing

```
Phase 0 ─┬─ Phase 1 (nav/CTA) ──┐
         ├─ Phase 2 (whatsapp) ─┤
         ├─ Phase 3 (form) ─────┼─ Phase 6 (blog style) ─ Phase 8 (launch)
         ├─ Phase 4 (proof) ────┤
         └─ Phase 5 (/about) ───┘
Phase 7 (news backend) ── runs in parallel, joins at Phase 8
```

Critical path ≈ **6–7 working days** solo. Phase 0 is the gate; Phase 7 is
independent and can run alongside.

## Out of scope (this pass)

Rebranding/changing the `/new` visual language · Arabic front-end rendering
(keep the bilingual `jsonb` shape) · auth/customer areas · e-commerce ·
Cal.com/Calendly booking · moving marketing copy/product list into config.

## Open follow-ups

- Real `tradeLicense` / `vatTrn` values in `brand.ts` when available.
- Decide later whether the 5 product names move to config or a CMS collection.
- Markdown→HTML choice in the publish endpoint (convert-at-write vs render-at-read).
