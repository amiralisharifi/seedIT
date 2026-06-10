# SPEC — Blog Authoring & SEO Console (SEEDIT Admin)

**Owner:** Amirali (Founder, SEEDIT)
**Target surface:** `admin.seedit.ae/content/blog_posts/new` and `admin.seedit.ae/content/blog_posts/:id/edit`
**Public surface:** `seedit.ae/blog/:slug`
**Version:** 1.0 (ported from the Taamir Blog/SEO PRD, re-scoped for the SEEDIT repo)
**Status:** Ready for Claude Code
**Implementation engine:** Claude Code (Windows / PowerShell environment)

---

## 0. FOR CLAUDE CODE — READ THIS FIRST (execution protocol)

This spec was adapted from a sister project (Taamir). **Do not assume the field names, table names, component paths, or editor library below are exactly what exists in this repo.** They are the intent. Your first job is to reconcile this intent against the real SEEDIT codebase.

**Step 1 — Audit before writing a single line.** Inspect and report back the following before making changes:
1. The existing page that renders `admin.seedit.ae/content/blog_posts/new` and its edit route (App Router file path, e.g. `app/(admin)/content/blog_posts/...` or wherever it actually lives).
2. The current blog form component(s) and which fields they already render (Title, Slug, Description, Cover Image, Content, Status — confirm the real list).
3. The rich-text editor library currently in use (TipTap / Lexical / Slate / Quill / contenteditable?). **All editor work below must extend the existing editor, not swap it.**
4. The database: confirm the actual table name (assumed `blog_posts`), its columns, and the related media/storage table (assumed a `media` table or Supabase Storage bucket — confirm which).
5. The API/route layer: are mutations done via Next.js Route Handlers, Server Actions, or direct Supabase client calls? Confirm the pattern in use and follow it.
6. Auth & roles: how is the admin gated today (Supabase RLS, middleware, Clerk)? New endpoints must follow the same pattern.

Output a short "Reconciliation Report" mapping every assumed name in Sections 8–9 to the real name in the repo. Where this spec and the repo disagree, **the repo wins** — update the spec inline as you go.

**Step 2 — Confirm before destructive or irreversible work.** Do not drop columns, rewrite the editor library, or change the public render output without flagging it in the report first. Additive migrations only unless told otherwise.

**Step 3 — Build in the phases in Section 12.** One phase = one logical commit (or a small set). Do not attempt the whole spec in one pass. After each phase: run the build, run typecheck, confirm the existing console still saves a basic post, then proceed.

**Step 4 — Stack assumptions (correct them if wrong during audit):**
- Next.js (App Router) + TypeScript, deployed on Vercel.
- Supabase (Postgres + Storage + RLS).
- Tailwind for styling; SEEDIT brand = dark navy base + green accent (pull the real tokens from `globals.css` / Tailwind config rather than hardcoding).
- Heavy client-side analysis must run in a **Web Worker** (Section 7).

**Step 5 — Environment:** PowerShell on Windows. Use PowerShell-compatible commands. Supabase migrations go through the project's existing migration mechanism (Supabase CLI `supabase/migrations/*.sql` if present — confirm during audit).

---

## 1. Background & Problem

The SEEDIT blog console at `content/blog_posts/new` currently supports a minimal field set (Title, Slug, Description, Cover Image, basic rich-text Content, Draft/Published status — confirm exact set in audit). There is no SEO tooling, no image alt-text enforcement, no word count, no meta/OG/Twitter controls, no schema markup, no readability scoring, and no focus-keyword analysis.

SEEDIT's content is B2B thought-leadership aimed at Dubai/MENA SMBs (AI automation, n8n workflows, marketplace engineering). This content lives or dies on organic search and LinkedIn distribution, so the lack of on-page SEO control is the single biggest gap in the publishing pipeline. Editors currently have zero visibility into search/social quality before publishing.

## 2. Goal

Turn the blog console into a content-creation workbench that gives the author real-time SEO and readability guidance (Yoast-style), enforces image accessibility, exposes every meta field needed for organic + social distribution, and writes clean, structured data to the public `seedit.ae/blog` pages. Because SEEDIT *sells* AI automation, the "AI suggest" helpers (meta description, alt text, FAQ extraction) are first-class here, not an afterthought (see 6.12).

## 3. Non-Goals (v1)

Backlink analysis, keyword volume/research data, full multi-language translation, AI rewriting of entire articles, redirect manager, sitemap generator UI, and bulk-edit across posts.

## 4. Success Metrics

- ≥90% of new posts published with a "Good" (green) SEO score within 60 days.
- 100% of images in published posts have alt text (or are explicitly marked decorative).
- 0 posts published without a meta title and meta description.
- Median time-to-publish unchanged or improved vs. baseline.

## 5. User Stories

- As the author, I want a focus keyphrase field with live analysis so I know the post is on-topic.
- As the author, I want word count, reading time, and a readability score against our editorial standard.
- As the author, I want custom meta title, meta description, canonical URL, and social previews so I control how the post appears in Google, LinkedIn, X, and WhatsApp.
- As the author, I want to be forced to add alt text to images for accessibility + SEO.
- As the author, I want auto-generated JSON-LD `Article` schema for rich results.
- As the author, I want to preview the Google SERP snippet and social cards before publishing.
- As the author (and because we sell automation), I want one-click "AI suggest" for meta description, alt text, and FAQ extraction.

## 6. Functional Requirements

### 6.1 Core Content Fields (enhance existing)

- **Title:** live character count, recommended 50–60 chars, warn beyond 60.
- **Slug:** auto-generate from title (kebab-case, lowercased, diacritics stripped), editable, uniqueness validated via API, warn beyond 75 chars.
- **Description (excerpt):** keep capped at 300 chars, visually separated from the SEO meta description (6.3), relabel as **"Short summary shown on listing pages."**

### 6.2 Rich-Text Editor Upgrades

Extend the **existing** editor (do not replace it) with:
- Link insertion (`rel`, `target`, nofollow/sponsored toggle).
- Image insertion with **mandatory alt text** + optional title/caption.
- Table support.
- Embed support (YouTube, Vimeo, X/Twitter, generic oEmbed).
- Code block with language selector (SEEDIT posts include code/n8n snippets — keep this solid).
- Horizontal rule.
- "HTML source" toggle.

Headings restricted to **H2–H4** in the body (H1 reserved for post title). Validator flags multiple H1s, skipped heading levels, and empty headings. Editor must compute and display word count, character count (with/without spaces), and estimated reading time at **225 wpm**.

### 6.3 SEO Panel (new collapsible side panel — Yoast-style)

- **Focus Keyphrase:** required-recommended (not blocking) text input that drives analysis. Allow up to 3 secondary keyphrases.
- **Google Preview:** live SERP preview (rendered SEO title, URL with slug, meta description) in desktop and mobile widths. Truncate by **pixel-width**, not char count (~600px desktop / ~680px mobile for title; ~960px for description).
- **SEO Title:** separate from post Title. Template tokens `%title%`, `%sitename%`, `%sep%`, `%category%`. Default template `%title% %sep% SEEDIT` (configurable globally). Soft limit 60 chars / ~600px.
- **Meta Description:** plain text, 120–160 chars recommended, hard cap 200, live pixel-width indicator.
- **Canonical URL:** optional, validated absolute URL, defaults to the post's own public URL if blank.
- **Robots Meta:** toggles for `index`/`noindex`, `follow`/`nofollow`, advanced (`noarchive`, `nosnippet`, `noimageindex`, `max-snippet`, `max-image-preview`, `max-video-preview`).
- **Breadcrumb Title:** optional override for breadcrumb schema + UI.

### 6.4 Social Panel (new)

Open Graph + X card overrides per post: OG title, OG description, OG image (1200×630, upload + crop), X title, X description, X image, X card type (`summary` / `summary_large_image`). Empty fields fall back to SEO title / meta description / cover image. Live preview rendering of LinkedIn/Facebook and X cards.

### 6.5 Schema / Structured Data (new)

Auto-generate JSON-LD per post: `Article` (default) / `BlogPosting` / `NewsArticle` (selectable), with `headline`, `description`, `image`, `author`, `publisher` (= SEEDIT Organization), `datePublished`, `dateModified`, `mainEntityOfPage`, `articleSection`. Optional **FAQ block** (Q/A pairs render inline + as `FAQPage` schema). Optional **HowTo block** with steps for tutorial posts (very relevant for SEEDIT's n8n/automation guides).

### 6.6 Image Handling & Accessibility

- Every image (cover + inline) requires `alt` before save; a "decorative" checkbox allows empty alt for purely decorative images.
- Max upload size (default 2 MB). Auto-generate WebP/AVIF derivatives + responsive sizes (400/800/1200/1600 px).
- Show original filename, dimensions, file size in the media inserter.
- Warn if cover image < 1200×630 (OG requirement).
- Strip EXIF on upload.
- **Storage = Supabase Storage bucket only (no `media` table).** Therefore:
  - **Cover image alt** is stored as a new `cover_image_alt` column on `blog_posts` (plus `cover_image_caption` if wanted). The bucket only holds the file; alt lives on the post row.
  - **Inline image alt/caption/title** are stored *inside the rich-text content itself* — as attributes on the editor's image node (`<img alt="..." title="..." data-caption="...">`). This is the natural home and needs no extra table; alt enforcement (6.2) happens at insert time in the editor.
  - **Do NOT create a `media` table for v1.** A reusable media-library table (`blog_media`: path, alt, caption, width, height, bytes) is optional and deferred to Phase 3 only if a media library is actually wanted later.
  - Derivatives/responsive sizes (WebP/AVIF, 400/800/1200/1600) are generated on upload and written back to the same bucket under a derived path (e.g. `…/cover-800.webp`); reference them via `srcset` on render.

### 6.7 SEO & Readability Analysis Engine

Run client-side on debounce (~500ms) **inside a Web Worker**. Each check returns good / ok / problem + a short actionable message. Aggregate into two traffic-light scores plus an overall 0–100.

**SEO checks (focus-keyphrase based):** keyphrase in SEO title (near start ideal), in meta description, in URL slug, in first paragraph (first 100 words); keyphrase density 0.5%–2.5%; keyphrase in ≥1 subheading; keyphrase in ≥1 image alt; ≥1 internal link (to another `seedit.ae` URL); ≥1 outbound link; keyphrase not already used as focus on another published post (duplication check via API); slug length + stop-word check; meta description present + within length; SEO title present + within pixel width; all images have alt.

**Readability checks (language-aware: English + Arabic):** Flesch Reading Ease (EN) ≥ 60 target; ≤25% of sentences over 20 words; no paragraph > 150 words; no text block > 300 words without a subheading; passive voice ≤10%; transition words ≥30% (EN); consecutive sentences starting with the same word flagged. Arabic bypasses Flesch and uses sentence/paragraph length + subheading distribution only.

> **SEEDIT note:** B2B/technical content runs denser than consumer copy. Keep Yoast defaults but make all thresholds configurable (Section 13) so they can be relaxed for technical posts without code changes.

### 6.8 Internal Linking Helper

On text selection, show a "Suggested internal links" dropdown that queries an endpoint with the highlighted phrase + post category and returns the top 5 matching **published** posts by relevance.

### 6.9 Taxonomy & Metadata

Category (single-select, required), Tags (multi-select, free-create), Author (single-select from users; default to the founder account for now), Publish date (with schedule-for-future), Last-modified (auto), Reading time (auto), Featured toggle, Pinned-to-top toggle.

### 6.10 Publishing & Workflow

Status expands to: Draft, In Review, Scheduled, Published, Archived. "Preview" button opens the post in a new tab via a **signed preview token** (works for unpublished posts). "Publish checklist" modal **blocks** publishing only when hard-required fields are missing (title, slug, content, cover image, alt on all images, meta title, meta description, category) and **warns** (non-blocking) on soft issues (SEO < 60, readability < 60).

### 6.11 Revisions & Autosave

Autosave drafts every 15s and on blur. Maintain ≥25 revisions with diff view + one-click restore.

### 6.12 AI Assist (SEEDIT-specific — first-class, not fast-follow)

Because SEEDIT's product is automation, expose AI-suggest buttons:
- **AI suggest meta description** from the post body.
- **AI suggest alt text** from an uploaded image (vision model).
- **AI extract FAQ** — propose Q/A pairs from the body for the FAQ schema block.
- **AI suggest SEO title** variants from the focus keyphrase + title.

**AI backend = n8n, hosted at `ayvan.me`.** The repo has no other AI/API layer, so n8n is the AI provider for these features. Implement it cleanly:

1. **One abstraction, wired once.** Create `lib/ai.ts` exporting a single `aiSuggest(type, payload)` where `type ∈ {meta_description, alt_text, seo_title, faq_extract}`. Every call site (button) goes through this — never `fetch()` the n8n URL directly from components. Default backend is the n8n webhook; the function is written so a direct provider call can be swapped in per-type later without touching call sites.
2. **Server-side only.** The `/api/blog/ai-suggest` Route Handler calls n8n server-side. The n8n webhook URL and shared secret are env vars (`N8N_AI_WEBHOOK_URL`, `N8N_AI_WEBHOOK_SECRET`) — never exposed to the browser.
3. **Secure the webhook.** Send a shared-secret header on every request; the n8n workflow rejects anything without it. (Without this, anyone with the URL burns your model credits.)
4. **Timeout + graceful fallback.** n8n webhooks can be slow/cold — set a sane timeout (e.g. 15s) and, on timeout/error/missing env, disable the button with a tooltip ("AI suggest unavailable"). The console must work **fully** without AI configured.
5. **Rate-limit** per user/action to avoid runaway calls.

All AI suggestions are **proposals the author accepts/edits** — never auto-applied on save.

> n8n workflow (build separately on ayvan.me): one webhook entry that branches on `type`, calls the model, and returns `{ suggestion }` (or `{ suggestions: [...] }` for `seo_title`/`faq_extract`) via a "Respond to Webhook" node. Keep prompts versioned in n8n so they can be tuned without redeploying the app.

## 7. Non-Functional Requirements

Editor stays responsive up to 20,000-word posts; analysis runs in a **Web Worker**. All new fields RTL-safe for Arabic. Admin UI meets WCAG 2.1 AA. All new endpoints authenticated + role-gated (editor, author, admin) via the repo's existing pattern (RLS/middleware). Emit analytics events to **GA4** (the SEO-ranking destination): `seo_score_changed`, `publish_blocked`, `publish_succeeded`, `image_uploaded_without_alt_attempt`, `ai_suggest_used`. Push via `gtag`/`dataLayer` using the repo's existing GA4 setup (confirm the measurement ID source during the Phase 0 audit).

## 8. Data Model Additions (Supabase — verify table name in audit)

Extend `blog_posts` (additive migration) with:

```
seo_title              text
meta_description        text
canonical_url           text
robots                  jsonb        -- { index, follow, advanced: {...} }
focus_keyphrase         text
secondary_keyphrases    text[]
og_title                text
og_description          text
og_image_id             uuid/text    -- FK to media or storage path
twitter_title           text
twitter_description     text
twitter_image_id        uuid/text
twitter_card_type       text         -- 'summary' | 'summary_large_image'
schema_type             text         -- 'Article' | 'BlogPosting' | 'NewsArticle'
faq_blocks              jsonb
howto_blocks            jsonb
breadcrumb_title        text
reading_time_seconds    integer
word_count              integer
seo_score               integer
readability_score       integer
last_analyzed_at        timestamptz
status                  text         -- extend enum: draft|in_review|scheduled|published|archived
scheduled_at            timestamptz  -- for scheduled publishing
author_id               uuid         -- FK users (if not already present)
category_id             uuid         -- FK categories (create table if absent)
is_featured             boolean
is_pinned               boolean
cover_image_alt         text         -- alt for the cover (Storage bucket holds only the file)
cover_image_caption     text         -- optional
```

**Media = Supabase Storage bucket only — NO `media` table in v1.** Cover alt/caption live on `blog_posts` (above). Inline image alt/caption/title live inside the rich-text content as node attributes (see 6.6). An optional `blog_media` library table is deferred to Phase 3.

Create supporting tables if absent: `blog_categories`, `blog_tags` + `blog_post_tags` join, `blog_post_revisions` (post_id, snapshot jsonb, created_at, created_by). Add RLS policies mirroring the existing `blog_posts` policies.

## 9. API / Route Surface (Next.js — follow the repo's existing mutation pattern)

- Create/update mutation for posts extended with all new fields (Server Action or Route Handler — match what exists).
- `GET /api/blog/slug-check?slug=...` — uniqueness.
- `GET /api/blog/focus-keyphrase-check?phrase=...` — duplication across published posts.
- `GET /api/blog/internal-link-suggestions?q=...&category=...`
- `GET /api/blog/posts/:id/preview-token` — signed token.
- `POST /api/blog/ai-suggest` — typed action: `meta_description | alt_text | seo_title | faq_extract` (6.12).
- **Public render** (`seedit.ae/blog/:slug`): output `<title>`, full meta tags, OG/X tags, canonical, robots, and JSON-LD from the new fields via Next.js `generateMetadata` + a JSON-LD `<script type="application/ld+json">`.

## 10. UX / Layout

Keep the current two-column layout.
**Left:** Title, Slug, Short summary, Cover Image, Content editor.
**Right (stacked collapsible cards, this order):** Publishing → SEO (score dot) → Readability (score dot) → Social → Schema → Taxonomy → Advanced (robots, canonical, schema type).
SEO and Readability card headers show a colored dot (red/orange/green) so status is visible without expanding. Match SEEDIT's dark-navy + green tokens (read them from the repo, don't hardcode).

## 11. Acceptance Criteria

- A post cannot be saved as "Published" without: title, slug, content, cover image, meta title, meta description, category, and alt text on every image.
- Editing a post recalculates and persists word count, reading time, SEO score, readability score.
- The public blog page outputs valid Open Graph, X Card, canonical, robots, and JSON-LD matching admin inputs — verified by Google Rich Results Test and the X card validator.
- Inserting an image without alt text shows a blocking modal unless marked decorative.
- Google preview + social previews update live and match production within 1 px / 1 char.
- The console still works end-to-end with the AI endpoint absent (AI buttons disable gracefully).
- Existing posts continue to render and save (no regression) after migration.

## 12. Build Sequence (phased — one phase ≈ one commit set)

**Phase 0 — Audit & Reconciliation Report** (Section 0). No code changes; output the mapping.

**Phase 1 — Foundation + MVP SEO**
- Additive migration for core SEO fields (8), RLS policies, status enum extension.
- SEO panel: meta title / meta description / canonical / robots.
- Focus keyphrase + first 8 core SEO checks (Web Worker).
- Word count + reading time.
- Image alt enforcement (blocking modal + decorative checkbox).
- Google SERP preview.
- JSON-LD `Article` schema + OG/X basics on the public render.
- Publish checklist (hard-required gate).

**Phase 2 — Readability + Social + Workflow**
- Readability engine (EN) in the Worker.
- Social preview cards (LinkedIn/FB + X).
- Internal link suggester endpoint + UI.
- Revisions + autosave.
- Scheduled publishing.
- AI assist v1 (6.12): meta description + alt text suggest.

**Phase 3 — Advanced**
- FAQ / HowTo schema blocks (inline render + schema).
- Arabic readability rules.
- Duplicate-keyphrase detection.
- Autosave/revision history UI with diff + restore.
- AI assist v2: FAQ extraction + SEO title variants.

After each phase: `build` + typecheck pass, basic create/edit/publish smoke test, no regression on existing posts.

## 13. Risks & Mitigations

- Long-post analysis lag → Web Worker + debounced runs.
- Yoast scoring is opinionated → expose a settings page so thresholds are tunable (important for SEEDIT's technical/dense content).
- Forcing alt text slows authoring → 6.12 "AI suggest alt" mitigates.
- Schema mistakes hurt SEO → validate JSON-LD server-side before save and against schema.org types in CI.
- AI dependency → all AI features optional and gracefully degrade.

## 14. Open Questions / Decisions Needed

1. **OPEN —** Multi-locale (en/ar): one record per post with locale fields, or separate records linked by `translation_group_id`? (Defer to Phase 3; pick before building Arabic readability.)
2. **DECIDED — AI layer = n8n hosted at `ayvan.me`.** No other AI/API layer in the repo. Wire via the `lib/ai.ts` abstraction + secured webhook + timeout/fallback (see 6.12). Build the n8n workflow separately.
3. **DECIDED — Analytics = GA4** (chosen for SEO ranking). All new events fire to GA4 (see §7).
4. **DECIDED — Media = Supabase Storage bucket only, no `media` table.** Cover alt on `blog_posts`; inline alt in content nodes (see 6.6 / §8).

---

### Appendix A — Reconciliation checklist (fill during Phase 0)

| Spec assumes | Real in repo | Notes |
|---|---|---|
| Table `blog_posts` | ? | |
| Route `content/blog_posts/new` file path | ? | |
| Editor library | ? | extend, don't replace |
| Mutation pattern (Server Action / Route Handler / direct client) | ? | |
| Media: Supabase Storage bucket | **DECIDED: bucket only, no media table** | cover alt on row, inline alt in content |
| Auth/role gating mechanism | ? | |
| Brand tokens (navy/green) source | ? | read, don't hardcode |
| AI layer | **DECIDED: n8n @ ayvan.me** | via `lib/ai.ts`, secured webhook |
| Analytics | **DECIDED: GA4** | confirm measurement ID source |
| Migration mechanism (Supabase CLI?) | ? | |
