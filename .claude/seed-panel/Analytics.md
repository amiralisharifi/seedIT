# Analytics & Webmaster Tools Module — Build Spec

> Companion to `SEO.md`. Adds first-class management for **Google Analytics 4**, **Google Tag Manager**, **Google Search Console**, and **Bing Webmaster Tools** in the SEED IT admin panel, and ensures the values are injected into the public `seedit.ae` website.

---

## 1. Context

- The admin sidebar already lists a **Settings → Integrations** link (currently 404). This module implements that page plus a new **SEO → Verifications** page (see `SEO.md` §2.8).
- Public site = `seedit.ae` (Next.js App Router, bilingual EN/AR).
- Same auth, same role gating (`admin` only) as the rest of the panel.
- No PII or secrets leak: GA4 measurement IDs, GTM container IDs, and HTML verification meta tokens are public-by-design — fine to render in `<head>`. Any API secrets (e.g. GA4 Measurement Protocol API secret, Search Console service-account JSON) are server-only.

---

## 2. Scope

In scope:
1. **Google Analytics 4 (GA4)** — gtag.js loader by Measurement ID, with consent mode v2, anonymize IP, debug mode, and optional Measurement Protocol API secret for server events.
2. **Google Tag Manager (GTM)** — container ID, head + noscript body snippet, dataLayer init, environment param support.
3. **Google Search Console (GSC)** — HTML meta verification tag and (optional) service-account JSON for the Search Console API (read-only: index status, top queries).
4. **Bing Webmaster Tools (BWT)** — `msvalidate.01` meta verification tag and (optional) API key for read-only stats.
5. **Other verifications (bonus)** — Yandex, Pinterest, Facebook domain verification, Ahrefs, single field each.
6. **Consent management** — cookie banner toggle, default consent state, ability to gate GA4/GTM on consent.

Out of scope (leave stubs / feature flags):
- Full CMP (consent management platform) UI flow.
- Writing back to GSC / BWT (only read).
- Server-side tagging.

---

## 3. Data model

Single singleton-ish `integrations` row plus optional `integration_events` audit log. Use one row per environment if you have staging/prod separation; otherwise singleton.

````sql
create table integrations (
  id                              int primary key default 1,
  -- Google Analytics 4
  ga4_enabled                     boolean not null default false,
  ga4_measurement_id              text,                  -- e.g. 'G-XXXXXXX'
  ga4_api_secret                  text,                  -- server-only, encrypted at rest
  ga4_anonymize_ip                boolean not null default true,
  ga4_debug_mode                  boolean not null default false,
  ga4_send_page_view              boolean not null default true,
  -- Google Tag Manager
  gtm_enabled                     boolean not null default false,
  gtm_container_id                text,                  -- 'GTM-XXXXXX'
  gtm_environment_auth            text,                  -- optional &gtm_auth=
  gtm_environment_preview         text,                  -- optional &gtm_preview=
  -- Google Search Console
  gsc_enabled                     boolean not null default false,
  gsc_verification_token          text,                  -- content of <meta name="google-site-verification">
  gsc_service_account_json        text,                  -- encrypted, server-only
  gsc_property_url                text,                  -- 'https://seedit.ae/'
  -- Bing Webmaster Tools
  bwt_enabled                     boolean not null default false,
  bwt_verification_token          text,                  -- content of <meta name="msvalidate.01">
  bwt_api_key                     text,                  -- encrypted, server-only
  -- Other verifications
  yandex_verification             text,
  pinterest_verification          text,
  facebook_domain_verification    text,
  ahrefs_verification             text,
  -- Consent & privacy
  consent_required                boolean not null default true,
  consent_default_state           text not null default 'denied',  -- 'granted' | 'denied'
  cookie_banner_enabled           boolean not null default true,
  -- Meta
  updated_by                      uuid,
  updated_at                      timestamptz not null default now(),
  check (id = 1)
);

create table integration_audit_log (
  id           uuid primary key default gen_random_uuid(),
  field        text not null,
  old_value    text,
  new_value    text,
  actor        uuid,
  at           timestamptz not null default now()
);
````

Secret fields (`ga4_api_secret`, `gsc_service_account_json`, `bwt_api_key`) MUST be:

* Encrypted at rest using the project's existing KMS / env-key (reuse whatever pattern Integrations uses today; if none, use libsodium `crypto_secretbox` with a key from `INTEGRATIONS_ENC_KEY`).
* Never returned in `GET` responses — return a boolean `has_value: true` and a masked preview (`••••••••`) instead.
* Rotatable via a dedicated `PUT /api/integrations/secrets` endpoint.

---

## 4. API

All routes admin-only; return JSON; Zod-validated.

* `GET  /api/integrations`          → public-safe fields + `has_value` flags for secrets
* `PUT  /api/integrations`          → upsert public-safe fields
* `PUT  /api/integrations/secrets`  → body: `{ field: 'ga4_api_secret'|'gsc_service_account_json'|'bwt_api_key', value: string|null }`
* `POST /api/integrations/test/:provider` → live test:

  * `ga4`: send a debug event to GA4 Measurement Protocol, return 2xx/4xx.
  * `gtm`: fetch `https://www.googletagmanager.com/gtm.js?id={id}` HEAD; assert 200.
  * `gsc`: call `searchanalytics.query` with the service account, last 7 days, rowLimit=1.
  * `bwt`: call `GetUrlInfo` with the API key on `https://seedit.ae/`.
* `GET  /api/integrations/health`   → `[{provider, ok, message, lastCheckedAt}]`
* `GET  /api/public/integrations`   → **scoped** subset consumed by the public site (only the values needed to render `<head>`): `ga4_measurement_id` (if enabled & consented), `gtm_container_id`, all four `*_verification_token` values, `consent_*`. Cached aggressively (ISR / edge).

---

## 5. Admin UI — `/settings/integrations`

One page, vertical sections, each in its own card. Each card has an **Enabled** toggle at the top; when off, all inputs are disabled and nothing is emitted on the public site.

### 5.1 Google Analytics 4 card

* Enabled toggle
* `Measurement ID` (text, regex `^G-[A-Z0-9]{6,12}$`)
* `Anonymize IP` (toggle, default on)
* `Send page_view automatically` (toggle, default on)
* `Debug mode` (toggle, default off)
* `API secret` (password input, "Set / Replace / Clear" affordance, shows `••••••••` when set)
* "Test connection" button → calls `/api/integrations/test/ga4`, shows green check / red error.
* Inline help: link to "Where do I find this?" → opens GA4 admin in new tab.

### 5.2 Google Tag Manager card

* Enabled toggle
* `Container ID` (regex `^GTM-[A-Z0-9]{4,10}$`)
* `gtm_auth` (optional, for environment)
* `gtm_preview` (optional)
* Preview pane that shows the exact `<script>` and `<noscript>` snippets that will be rendered.
* "Test connection" button.

### 5.3 Google Search Console card

* Enabled toggle
* `Verification meta token` (the `content` value)
* `Property URL` (defaults to `https://seedit.ae/`)
* `Service account JSON` (textarea, secret, "Set / Replace / Clear")
* "Test connection" button.
* Helper: copy-button to copy the rendered meta tag for users who prefer DNS or file verification methods elsewhere.

### 5.4 Bing Webmaster Tools card

* Enabled toggle
* `Verification meta token`
* `API key` (secret)
* "Test connection" button.

### 5.5 Other verifications card

Compact 2-column grid of single text inputs for Yandex, Pinterest, Facebook domain