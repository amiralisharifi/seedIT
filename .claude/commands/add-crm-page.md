# Add a CRM page (bespoke, not schema-driven)

Use this when the user wants a hand-built admin page — campaigns, the
demo generator, conversation inbox, scrape trigger, etc. These are CRM
features with specific flows, NOT generic CMS collections.

If the user wants a new content type, use `add-collection.md` instead.

## Steps to follow

1. **Confirm the page's purpose.** What does the user do here? What does
   it show? What actions can they take? Write a one-paragraph spec before
   coding.

2. **Decide route placement.** Most go under `apps/panel/app/(panel)/`:
   - Top-level feature → `(panel)/<feature>/page.tsx`
   - Nested route → `(panel)/<feature>/<subroute>/page.tsx`
   - Detail/edit → `(panel)/<feature>/[id]/page.tsx`

3. **Add to sidebar nav.** Edit `apps/panel/components/layout/nav-config.ts`
   and add the item to the right section (Overview, CRM, Content, Settings).
   Pick an appropriate lucide icon (e.g. `send`, `inbox`, `bar-chart-3`).
   Use `adminOnly: true` for Settings-section items.

4. **Build the page as a Server Component by default.** Pattern:

   ```tsx
   import { PageHeader } from '@/components/layout/page-header';
   import { queries } from '@seed-panel/db';

   export const metadata = { title: 'Feature name' };

   export default async function FeaturePage() {
     const data = await queries.someQuery();

     return (
       <>
         <PageHeader
           title="Feature name"
           description="One-line description."
           actions={<button className="...">Primary action</button>}
         />
         <div className="p-8">
           {/* content */}
         </div>
       </>
     );
   }
   ```

5. **Only mark `'use client'`** for interactivity that needs state, effects,
   or browser APIs. Keep data fetching on the server.

6. **For form submissions**, use Server Actions over API routes. API routes
   are for webhooks and n8n traffic; admin UI uses server actions.

7. **For triggering n8n workflows** (e.g. "send WhatsApp" button), create
   a server action that calls `triggerN8nWorkflow()` from
   `@seed-panel/integrations/n8n`. Pass the shared secret automatically.

8. **For displaying data**: prefer reusable patterns:
   - Tables: copy the structure from `app/(panel)/leads/page.tsx`
   - Empty states: copy from the leads page
   - Cards/metrics: copy from `app/(panel)/dashboard/page.tsx`

9. **Test the page** by running `pnpm dev` and clicking through. Verify:
   - Sidebar item is highlighted when on the page
   - Page header looks right
   - Data renders without errors
   - Empty state shows when there's no data
   - Loading state shows during data fetch (use Suspense if needed)

## What NOT to do

- Don't fetch data in client components. Pass it down as props from
  the server component.
- Don't put API calls in the page. Always go through `@seed-panel/db`
  queries or `@seed-panel/integrations` adapters.
- Don't hardcode brand strings (`"SEED IT"`, colors, etc.). Use
  `brand.*` from `@/config`.
- Don't write Drizzle queries inline. If a query is used more than once,
  promote it to `packages/db/src/queries/*.ts`.
- Don't reach into the integrations package directly with config-driven
  enable checks. Check `integrations.<service>.enabled` first and hide
  the UI accordingly.

## Patterns to copy

| Need                 | Reference file                                                    |
| -------------------- | ----------------------------------------------------------------- |
| Server-rendered list | `apps/panel/app/(panel)/leads/page.tsx`                           |
| Dashboard metrics    | `apps/panel/app/(panel)/dashboard/page.tsx`                       |
| Server action form   | (not yet built — use Next.js docs)                                |
| Trigger n8n          | (not yet built — wrap `triggerN8nWorkflow` in a server action)    |
| Read-only settings   | `apps/panel/app/(panel)/settings/brand/page.tsx`                  |

## Permission checks

If the page should be admin-only:

```tsx
import { getCurrentUser } from '@/lib/supabase/server';
import { permissions } from '@seed-panel/core';
import { redirect } from 'next/navigation';

export default async function AdminOnlyPage() {
  const user = await getCurrentUser();
  if (!user || !permissions.canAdminister(user)) {
    redirect('/dashboard');
  }
  // ... rest of page
}
```

The middleware handles auth (signed in vs not). Role checks are per-page.
