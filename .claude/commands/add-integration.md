# Add a new external integration

Use this when the user wants to wire up a new third-party service —
Calendly, Stripe, Twilio, Cal.com, Slack, etc.

Existing integrations: Supabase, Resend, AiSensy, Apify, n8n.

## Steps to follow

1. **Confirm the service is worth integrating directly.** Many services
   are better called from n8n (which has 400+ pre-built nodes) than from
   our app. The rule of thumb:
   - **In `packages/integrations/`**: services we call synchronously
     during user requests (auth, sending an immediate WhatsApp from a
     button click).
   - **In n8n**: services we call from async workflows (long-running
     scrapes, scheduled jobs, complex multi-step flows).

   Push back if the user wants to integrate something that n8n can
   handle natively.

2. **Create the package subdirectory:**
   ```
   packages/integrations/src/<service>/index.ts
   ```

3. **Add the export to `packages/integrations/package.json`:**
   ```json
   "exports": {
     ...
     "./<service>": "./src/<service>/index.ts"
   }
   ```

4. **Add the namespace re-export to `packages/integrations/src/index.ts`:**
   ```ts
   export * as <service> from './<service>';
   ```

5. **Write the adapter.** Follow the established pattern:

   ```ts
   /**
    * <Service> wrapper.
    * Docs: <link>
    */

   const apiKey = process.env.<SERVICE>_API_KEY;
   const API_BASE = '<service-url>';

   export interface SendXParams {
     // ... typed params
   }

   export async function sendX(params: SendXParams) {
     if (!apiKey) {
       throw new Error('<SERVICE>_API_KEY is not set');
     }
     // ... fetch call
     // ... return typed response
   }
   ```

   Rules for the adapter:
   - **One function per operation** we actually need. Don't wrap the whole
     SDK — wrap only what's used.
   - **Throw if API key is missing.** Don't silently no-op.
   - **Return typed responses** (define an interface for the response).
   - **Use `fetch`**, not the service's SDK, unless the SDK provides
     non-trivial value (Resend SDK does; most don't).
   - **No retries** at this layer. Add them in n8n if needed.

6. **Add config in `config/integrations.ts`:**
   ```ts
   <service>: {
     enabled: true,
     // any service-specific config like default sender, webhook secret, etc.
   },
   ```

7. **Update the Zod schema in `packages/config/src/index.ts`** to validate
   the new integration's config.

8. **Add env vars to `apps/panel/.env.example`** with comments explaining
   where to get them.

9. **Use the integration in app code** with an `enabled` check:
   ```ts
   import { integrations } from '@/config';
   import { sendX } from '@seed-panel/integrations/<service>';

   if (!integrations.<service>.enabled) {
     throw new Error('<service> is not enabled for this deployment');
   }
   await sendX({ ... });
   ```

10. **Hide the UI when disabled.** If you're adding a button or page that
    uses this integration, check `integrations.<service>.enabled` in the
    server component and conditionally render.

## Webhook handling (if the service sends us events)

If the service pushes events back to us:

1. Create `apps/panel/app/api/webhooks/<service>/route.ts`
2. Verify the webhook signature using the service's documented method
3. Match the event to a record in our database via stored provider IDs
   (e.g. `outreach.providerMessageId`)
4. Update the matched record's status / log a `messages` row / whatever
   the event represents

DO NOT skip signature verification. Webhook endpoints are public — anyone
can POST to them. The signature is your only authentication.

## What NOT to do

- Don't add an integration just because it exists. The integrations folder
  should reflect services we ACTIVELY use, not ones we MIGHT use.
- Don't import the service SDK in app code directly. Always go through the
  integration adapter.
- Don't expose API keys to the client. Integration adapters are
  server-only. If a client component needs to trigger the integration,
  use a server action or API route.
- Don't disable integrations by deleting code. Set `enabled: false` in
  config so it's reversible.

## Common services and their integration notes

- **Stripe**: official SDK is good, use it. Add webhook endpoint for
  payment events. Use Stripe Customer Portal for self-service.
- **Calendly**: prefer their embed widget for booking; only API-integrate
  if you need to read appointments programmatically.
- **Slack**: incoming webhooks for notifications are trivial; full Slack
  app is significant effort, prefer n8n for that.
- **Twilio (voice/SMS)**: similar to AiSensy pattern. Don't use for
  WhatsApp — AiSensy is better for UAE outbound.
- **Cal.com**: open source alternative to Calendly, can self-host on
  ayvan.me alongside n8n. Worth considering for booking flows.
