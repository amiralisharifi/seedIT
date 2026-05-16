# Forking seed-panel for a client

Detailed walkthrough of standing up a new seed-panel deployment for a paying
client. Aim is for this to take under an hour once you've done it once.

## Before you start

You'll need:

- The client's brand: logo files (SVG), colors, fonts, business name
- A Supabase account with billing set up (Pro = $25/mo per project)
- A Vercel account (Pro covers unlimited projects on one team)
- A domain or subdomain for their admin (e.g. `admin.clientco.com`)
- Their primary user's email (to invite as admin)

## Step 1 — Clone and rename

```bash
git clone git@github.com:seedit/seed-panel.git clientco-panel
cd clientco-panel

# Set up your own remote if you want a per-client repo
# (recommended — easier to hand off later)
git remote set-url origin git@github.com:seedit/clientco-panel.git
git push -u origin main
```

## Step 2 — Edit the four sacred config files

### `config/brand.ts`

The biggest change. Update:

- `name`, `shortName`, `tagline`, `taglineAr`
- `logo.light`, `logo.dark`, `logo.mark` — paths to the client's logos
- `logo.width`, `logo.height` — intrinsic dimensions
- `colors.*` — convert hex to HSL components (e.g. `#6c2bd9` → `264 70% 51%`).
  Tools like https://www.color2color.com/ do this conversion.
- `fonts.*` — Google Font names (e.g. "Inter", "Cairo")
- `business.*` — legal name, address, email, phone, etc.

### `config/collections.ts`

Most clients want the defaults (blog posts, pages, services). Some examples
of common adjustments:

- A salon client doesn't need `case_studies` — delete that collection
- A real-estate agency needs a `properties` collection — add it (also requires
  adding the table to the db schema)
- An e-commerce client needs `products` — add it

### `config/integrations.ts`

Disable services they don't use:

- Service-business clients usually don't need Apify (no scraping their own market)
- Pure-content clients usually don't need AiSensy
- Anyone not using deploy hooks: turn off `vercel.deployHooks`

### `config/locales.ts`

If they only need English, leave just `en` in `available`. If they're in a
different RTL market (e.g. Persian, Hebrew), add that locale.

## Step 3 — Drop in brand assets

```bash
# Replace placeholder logos in apps/panel/public/brand/
cp ~/Downloads/clientco-logo.svg apps/panel/public/brand/logo.svg
cp ~/Downloads/clientco-logo-dark.svg apps/panel/public/brand/logo-dark.svg
cp ~/Downloads/clientco-mark.svg apps/panel/public/brand/mark.svg
cp ~/Downloads/clientco-favicon.svg apps/panel/public/brand/favicon.svg
```

Optional but recommended: SVG logos work best. If they only have PNG, ask for
SVG (or convert their logo). Vector keeps everything crisp.

## Step 4 — Create the Supabase project

1. Go to https://supabase.com/dashboard → New project
2. **Region: eu-central-1 (Frankfurt)** for UAE clients, or closest to them
3. **Plan: Pro** — don't skimp. Free tier pauses after a week of inactivity.
4. Set a strong database password (save it in 1Password)
5. From Settings → Database, copy:
   - Transaction pooler URL (port 6543) → `DATABASE_URL`
   - Direct connection URL (port 5432) → `DIRECT_URL`
6. From Settings → API, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

## Step 5 — Configure Supabase Auth

In the Supabase dashboard:

1. **Authentication → URL Configuration**
   - Site URL: `https://admin.clientco.com` (or whatever final URL is)
   - Redirect URLs: add `https://admin.clientco.com/auth/callback`
   - During development: also add `http://localhost:3000/auth/callback`

2. **Authentication → Email templates**
   - Customize the magic link email template with the client's branding
   - Set the "Confirm signup" subject to something like
     "Sign in to Acme Salon"

3. **Authentication → Providers**
   - Email is on by default — that's all we need
   - Disable signups in Production once your admin user is set up
     (Auth → Settings → "Allow new users to sign up" off)

## Step 6 — Configure environment

```bash
cp apps/panel/.env.example apps/panel/.env.local
```

Fill in all the values you collected:

```
DATABASE_URL="..."
DIRECT_URL="..."
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PUBLIC_SITE_URL="https://www.clientco.com"
REVALIDATE_SECRET="$(openssl rand -hex 32)"

# If they need n8n / Apify / AiSensy:
N8N_SHARED_SECRET="$(openssl rand -hex 32)"
# etc.
```

## Step 7 — Initialize the database

```bash
pnpm install

# Apply the schema
pnpm db:migrate

# Seed baseline data (templates, message templates)
pnpm db:seed
```

Verify in the Supabase Table Editor — you should see all tables, plus 3 rows
in `templates` and 2 rows in `message_templates`.

## Step 8 — Smoke test locally

```bash
pnpm dev
```

Open http://localhost:3000:

- Click "Sign in", enter your email
- Check inbox, click the magic link
- You should land in the dashboard with the CLIENT's branding (their logo,
  their colors)
- Click through Leads, Content collections, Settings → Brand
- The Brand settings page should show their config

If anything looks like SEED IT defaults, you missed a config edit. Hunt it
down before continuing.

## Step 9 — Deploy to Vercel

```bash
pnpm dlx vercel link
# Pick "create new project", name it clientco-panel
```

In Vercel dashboard for the new project:

1. **Settings → Environment Variables** — paste all the `.env.local` values
   into Production. Mark `SUPABASE_SERVICE_ROLE_KEY` as encrypted.
2. **Settings → Domains** — add `admin.clientco.com`
   - In their DNS (Cloudflare ideally), add a CNAME from `admin` → `cname.vercel-dns.com`
3. **Settings → Build** — confirm root directory is `apps/panel` and
   framework is detected as Next.js

```bash
pnpm dlx vercel deploy --prod
```

Once it's live, update `NEXT_PUBLIC_APP_URL` in Vercel env vars to the real
URL, plus the Supabase Auth URL config (step 5) to use the production URL.
Set `PUBLIC_SITE_URL` in the admin project to the public website domain, and
use the same `REVALIDATE_SECRET` value in both the admin and public web
projects so CMS saves can invalidate the public site's cached blog pages.

## Step 10 — Invite the client's user

In the Supabase dashboard → Authentication → Users → Invite a user:

- Email: the client admin's email
- They receive a magic link, sign in, and become an admin (because they're
  the first user in their database — same as you were during step 8)

Hand them the URL. Done.

## Step 11 — Hand-off and ownership

If the client wants to own the deployment fully:

1. Transfer the GitHub repo to their org
2. Transfer the Vercel project to their team (Vercel supports this directly)
3. Add them as Owner on the Supabase project, then remove yourself
4. Send them a copy of this doc and the architecture doc

If you're managing it for them on retainer: skip steps 2–3, just keep
billing under your accounts.

## Common gotchas

- **Logo too big in the sidebar**: adjust `logo.width` / `logo.height` in
  `brand.ts` until it sits right. The sidebar is 240px wide.
- **Custom font not loading**: confirm the font name in `brand.ts` exactly
  matches the Google Fonts name (case + spaces matter)
- **HSL colors look wrong**: format is `"H S% L%"` with spaces, no commas.
  E.g. `"264 70% 51%"`, not `"264, 70%, 51%"`.
- **First sign-in puts user in "viewer" role**: shouldn't happen — first
  user is auto-promoted to admin in `lib/supabase/server.ts`. If it does,
  manually update the row in the `users` table.
- **Migration fails on `DIRECT_URL`**: the direct URL (port 5432) requires
  your IP to be allowed. In Supabase: Settings → Database → Network
  restrictions → add your IP, or set to "allow all" temporarily.

## Time estimate

| Step                    | First time | Once you've done it |
| ----------------------- | ---------- | ------------------- |
| 1. Clone                | 2 min      | 2 min               |
| 2. Edit config          | 30 min     | 10 min              |
| 3. Drop in assets       | 5 min      | 5 min               |
| 4. Supabase project     | 10 min     | 5 min               |
| 5. Configure auth       | 10 min     | 5 min               |
| 6. Env vars             | 5 min      | 3 min               |
| 7. Migrate + seed       | 5 min      | 3 min               |
| 8. Smoke test           | 10 min     | 5 min               |
| 9. Deploy to Vercel     | 15 min     | 5 min               |
| 10. Invite user         | 5 min      | 2 min               |
| **Total**               | **~90 min** | **~45 min**         |

When this stops being acceptable, we build the `create-seed-panel` CLI
that automates steps 1–10.
