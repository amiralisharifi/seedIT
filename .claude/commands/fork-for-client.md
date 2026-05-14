# Fork seed-panel for a new client

Use this when the user wants to spin up a new seed-panel deployment for a
client (e.g. "deploy this for Acme Salon"). This is the resaleable-product
path.

The detailed walkthrough is in `docs/fork-for-client.md`. This command is
the shorter checklist version for use during an active session.

## Pre-flight check

Before starting, confirm with the user:

- [ ] Client name and short name (e.g. "Acme Salon", "Acme")
- [ ] Their logos (SVG preferred — light, dark, square mark)
- [ ] Their brand colors (hex; we'll convert to HSL)
- [ ] Their fonts (Google Fonts names)
- [ ] Their business info (legal name, address, phone, email, WhatsApp)
- [ ] Domain for the admin (e.g. `admin.acmesalon.com`)
- [ ] Primary admin user's email
- [ ] Which integrations they need (some clients won't need WhatsApp,
      scraping, etc.)

If any of these are missing, ask before starting — the whole fork doesn't
work without these.

## Steps

1. **Clone the repo:**
   ```bash
   git clone <seed-panel-origin> <client-name>-panel
   cd <client-name>-panel
   git remote set-url origin <new-client-repo-url>
   git push -u origin main
   ```

2. **Edit `config/brand.ts`** with the client's info. Convert hex to HSL:
   - `#6c2bd9` → `264 70% 51%` (use color2color.com)
   - Format is "H S% L%" with spaces, NO commas
   - Make sure `name`, `tagline`, `business.*` all match the client

3. **Edit `config/collections.ts`** — keep only what the client needs:
   - Remove `case_studies` if they don't sell on past work
   - Remove `services` if they're product-focused not service-focused
   - Remove `team_members` if they're a solo operator
   - ADD new collections specific to their business (e.g. `properties`
     for a realtor — also needs schema + cms.ts registration)

4. **Edit `config/integrations.ts`** — disable what they don't use:
   - Salon clients won't need Apify (no scraping their own market)
   - Most clients won't need AiSensy unless they do outbound
   - Always keep Supabase + Vercel + Resend

5. **Edit `config/locales.ts`** if they only need English (drop `ar` from
   `available`) or need different languages.

6. **Drop in brand assets:**
   ```bash
   cp ~/Downloads/<client>-logo.svg apps/panel/public/brand/logo.svg
   cp ~/Downloads/<client>-logo-dark.svg apps/panel/public/brand/logo-dark.svg
   cp ~/Downloads/<client>-mark.svg apps/panel/public/brand/mark.svg
   cp ~/Downloads/<client>-favicon.svg apps/panel/public/brand/favicon.svg
   ```
   Confirm intrinsic dimensions match `brand.logo.width`/`.height`.

7. **Create their Supabase project:**
   - Frankfurt region (for UAE) or closest to client
   - Pro plan ($25/mo) — never free tier for production
   - Note credentials: 2 connection strings, anon key, service_role key,
     project URL

8. **Set up Supabase Auth URL config:**
   - Site URL: `https://admin.<client-domain>`
   - Redirect URLs: add `https://admin.<client-domain>/auth/callback`
   - Disable signups: Authentication → Settings → "Allow new users to
     sign up" → OFF (after first user is set up)

9. **Set up env:**
   ```bash
   cp apps/panel/.env.example apps/panel/.env.local
   # fill in Supabase creds + generate N8N_SHARED_SECRET if using n8n
   openssl rand -hex 32  # use output as N8N_SHARED_SECRET
   ```

10. **Initialize DB:**
    ```bash
    pnpm install
    pnpm db:migrate
    pnpm db:seed
    ```

11. **Smoke test locally:**
    ```bash
    pnpm dev
    ```
    - Sign in with the client's admin email
    - Verify: client's logo in sidebar, client's brand colors throughout,
      no leftover SEED IT strings anywhere
    - Click through all sections — empty states should all look right

12. **Deploy to Vercel:**
    ```bash
    pnpm dlx vercel link    # create new project, name it <client>-panel
    ```
    - Set root directory to `apps/panel`
    - Copy ALL env vars from `.env.local` to Vercel project settings
    - Mark `SUPABASE_SERVICE_ROLE_KEY` and `N8N_SHARED_SECRET` as encrypted
    - Add custom domain `admin.<client>.com`
    - Deploy: `vercel deploy --prod`

13. **Configure DNS:**
    - In their Cloudflare/registrar: add CNAME `admin` → `cname.vercel-dns.com`
    - Wait for Vercel to provision SSL (usually <5 min)

14. **Update Supabase Site URL** to the production URL once it's live.

15. **Invite the client's admin:**
    - Supabase dashboard → Authentication → Users → Invite a user
    - Use their primary admin email
    - They get a magic link, sign in, auto-promoted to admin

16. **Hand-off:**
    - Send them the admin URL
    - Send them a copy of `docs/architecture.md` if they want to customize
    - Set up billing if they're paying you on retainer for management

## Sanity-check before declaring done

Run this grep — should return zero hits in the client's repo:

```bash
grep -ri "seed it" --include="*.ts" --include="*.tsx" .
grep -ri "seedit" --include="*.ts" --include="*.tsx" .
grep -ri "#6c2bd9" --include="*.ts" --include="*.tsx" --include="*.css" .
```

If any of these match outside of comments mentioning the seed-panel
project itself, you missed a hardcoded brand string. Fix before delivery.

## Time estimates

| Step              | First time | Once fluent |
| ----------------- | ---------- | ----------- |
| Clone + config    | 30 min     | 10 min      |
| Supabase setup    | 15 min     | 5 min       |
| Local smoke test  | 10 min     | 5 min       |
| Deploy            | 15 min     | 5 min       |
| Total             | ~70 min    | ~25 min     |

When this stops being acceptable (you have 5+ clients on retainer),
build the `create-seed-panel` CLI to automate steps 1-12.
