# Wire up an n8n workflow

Use this when the user wants the admin to trigger a workflow on n8n
(scrape, send batch, run a long job) or n8n needs to write back to the
database.

This is the bridge between the Next.js app on Vercel and n8n on ayvan.me.

## The pattern

Three pieces, always:

```
1. /api/trigger/<action>     — admin UI calls this to KICK OFF a workflow
2. n8n workflow              — does the work (potentially long-running)
3. /api/n8n/<action>         — n8n CALLS this to write results back
```

All three communicate via shared secret in the `X-Seed-Panel-Secret` header.

## Steps to follow

### Step 1: The trigger endpoint (admin → n8n)

Create `apps/panel/app/api/trigger/<action>/route.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/supabase/server';
import { triggerN8nWorkflow } from '@seed-panel/integrations/n8n';
import { integrations } from '@/config';

const requestSchema = z.object({
  // ... typed input from the admin UI
});

export async function POST(req: NextRequest) {
  // 1. Auth check — only signed-in users can trigger workflows
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // 2. Integration enabled check
  if (!integrations.n8n.enabled) {
    return NextResponse.json({ error: 'n8n is disabled' }, { status: 503 });
  }

  // 3. Parse + validate input
  const body = await req.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  // 4. Trigger n8n
  try {
    const result = await triggerN8nWorkflow(
      integrations.n8n.workflows!.<workflowName>,
      {
        ...parsed.data,
        triggeredBy: user.id,
      },
    );
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    console.error('n8n trigger failed', e);
    return NextResponse.json({ error: 'workflow trigger failed' }, { status: 500 });
  }
}
```

### Step 2: The n8n workflow

This is built in the n8n UI on ayvan.me, not in code. The structure:

1. **Webhook trigger node** — POST listener with the path that matches the
   `workflows.<workflowName>` config (e.g. `/scrape`, `/send-whatsapp`)
2. **Header verification node** — check that `X-Seed-Panel-Secret` matches
   the `N8N_SHARED_SECRET` env var on the n8n side
3. **Workflow logic** — Apify call, branching, retries, whatever the
   workflow needs to do
4. **HTTP Request node at the end** — POST results back to
   `https://admin.seedit.ae/api/n8n/<action>` with the same shared secret
   header

Export the workflow JSON and commit it to `server/n8n-workflows/<name>.json`
in the repo so it's version-controlled and importable on other deployments.

### Step 3: The callback endpoint (n8n → admin)

Create `apps/panel/app/api/n8n/<action>/route.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { verifyN8nRequest } from '@seed-panel/integrations/n8n';
import { db } from '@seed-panel/db';
// ... import whatever tables/queries you'll write to

const payloadSchema = z.object({
  // ... what n8n sends back
});

export async function POST(req: NextRequest) {
  // 1. Verify n8n's shared secret — CRITICAL, this endpoint is public
  if (!verifyN8nRequest(req.headers)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // 2. Parse + validate payload
  const body = await req.json();
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  // 3. Write to database
  // Use the typed queries from @seed-panel/db — never construct SQL inline
  await db.transaction(async (tx) => {
    // ... writes
  });

  return NextResponse.json({ ok: true });
}
```

### Step 4: Update config

In `config/integrations.ts` add the workflow path:

```ts
n8n: {
  enabled: true,
  baseUrl: process.env.N8N_WEBHOOK_BASE,
  workflows: {
    scrape: '/scrape',
    sendWhatsApp: '/send-whatsapp',
    <yourNewWorkflow>: '/<your-path>',  // ← add this
  },
},
```

### Step 5: Test the round-trip

Before declaring done:

1. Trigger the workflow from the admin UI button you added
2. Verify the n8n execution log on `n8n.ayvan.me` shows the run
3. Verify the callback fired by checking the database for the write
4. Verify failure modes: missing shared secret returns 403, malformed
   payload returns 400, n8n down returns a useful error

## What NOT to do

- **Don't skip signature verification on `/api/n8n/*`.** The endpoint is
  public; without `verifyN8nRequest`, anyone can write to your database.
- **Don't do long work in the trigger endpoint.** It should return within
  ~1 second. The actual work happens in n8n.
- **Don't poll n8n from the admin UI to check status.** Either use
  optimistic UI updates, or have n8n notify the admin via the callback.
- **Don't share the same workflow path across deployments**, but DO share
  the workflow JSON structure. Each deployment has its own n8n with its
  own webhook URLs.

## Existing workflow patterns (when they exist)

- `01-scrape-orchestrator.json` — Apify scrape, write to businesses table
- `02-lead-scoring.json` — Lighthouse + Wayback + Instagram enrichment
- `03-demo-generator.json` — pick template, generate slug, write demos row
- `04-whatsapp-send.json` — call AiSensy, log outreach row
- `05-whatsapp-reply.json` — AiSensy webhook → update outreach + log message
- `06-follow-up.json` — scheduled check for unanswered demos, send reminder
- `07-daily-digest.json` — cron 8am Dubai → Telegram summary

When adding a new workflow, see if it's a variant of one of these before
building from scratch.
