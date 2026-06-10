# SEED IT — Landing Page

The `seedit.ae` landing page, unbundled from the single-file export into a clean,
editable static site. Pure HTML + CSS + vanilla JS — no build step required.

## Structure

```
seedit-landing/
├── index.html              # All markup + all CSS (in one <style> block)
└── assets/
    ├── intro.mp4           # Scroll-scrubbed laptop intro video (~12 MB)
    ├── fonts/              # Inter (7) + JetBrains Mono (6), self-hosted woff2
    └── js/
        ├── lenis.min.js    # Smooth-scroll library (load first)
        ├── 01-marks.js     # Inserts the seed SVG logo mark
        ├── 02-loader.js    # Pixel-dissolve loading screen
        ├── 03-intro.js     # Scroll-scrubbed intro video controller
        ├── 04-bg-canvas.js # Ambient drifting background
        ├── 05-cases.js     # "Selected projects" cards (EDIT CONTENT HERE)
        ├── 06-experience.js# "Experience" grid (EDIT CONTENT HERE)
        ├── 07-motion.js    # Text reveal / blur-in motion system
        ├── 08-scroll.js    # Scroll-driven hero scale/opacity (uses Lenis)
        └── 09-init.js      # Re-runs motion after dynamic content mounts
```

Script order in `index.html` matters — `lenis.min.js` must stay first.

## Run locally

It must be served over HTTP (the JS uses modules/fetch-style patterns that fail on `file://`):

```bash
cd seedit-landing
python3 -m http.server 8000
# open http://localhost:8000
```

## Where to edit things

| What | Where |
|------|-------|
| Wordmark "SEED IT" | `index.html` — hero `<h1>`, `.nav-logo`, footer, loader, giant footer text |
| Logo mark (seed SVG) | `assets/js/01-marks.js` — replace the inline `seed()` SVG |
| Accent color (`#7CFC00`) | `index.html` → `:root { --accent }` (also referenced in `01-marks.js`) |
| Hero headline + subcopy | `index.html` → `#hero-content` |
| Contact email | `index.html` → search `hello@seedit.studio` |
| Projects (GROWBOT, etc.) | `assets/js/05-cases.js` |
| Experience entries | `assets/js/06-experience.js` |
| Intro video | replace `assets/intro.mp4` (keep the filename, or update the `<source>` in `index.html`) |
| Nav / footer links (Github, X, IN) | `index.html` |

## Swapping in your own logo

The current logo is two parts: a generated green "seedling" **SVG mark** and the
**"SEED IT" wordmark text**.

- To change the mark: edit the `seed()` template in `assets/js/01-marks.js`, or
  replace it with an `<img src="assets/logo.svg">` and drop your file in `assets/`.
- The mark renders in three places (hero, nav, loader) — `01-marks.js` handles all three.

## Deploying inside the seedIT monorepo

This repo is a Turborepo (`seed-panel`, a Next.js admin app). The landing page is a
separate static site. Recommended placements:

**Option A — standalone static app (simplest, recommended):**
Drop this folder at `apps/landing/` and deploy it to Vercel as a separate project
with no framework preset (output dir = the folder). Point `seedit.ae` at it and the
admin panel at a subdomain.

**Option B — replace the existing draft:**
The repo root already has a `landing (2).html`. This unbundled version supersedes it
with proper external assets instead of one giant inline file.

**Option C — serve from the Next.js app's `public/`:**
Copy `index.html` → `apps/panel/public/landing.html` and `assets/` → `apps/panel/public/`.
Reachable at `/landing.html`. (Option A is cleaner for a marketing site.)
