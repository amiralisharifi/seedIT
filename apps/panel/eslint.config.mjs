import { defineConfig } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

// Next 16 removed `next lint`, so the ESLint CLI reads this flat config directly.
// `eslint-config-next` already globally ignores .next/, out/, build/ and next-env.d.ts.
export default defineConfig([
  nextCoreWebVitals,
  nextTypeScript,
  {
    ignores: ['.turbo/**'],
  },
  {
    // ESLint had never actually run in this repo (there was no config, and `next lint`
    // was broken), so switching it on surfaced a pre-existing backlog. These are
    // downgraded to warnings so the migration lands green without dragging unrelated
    // refactors along. Everything else stays at error, so new code can't regress.
    //
    // Backlog:
    //  - no-html-link-for-pages: 2 internal <a> links (demos/demo-form.tsx,
    //    outreach/compose/composer.tsx) should use <Link> from next/link.
    //  - set-state-in-effect: 3 derived-state effects in outreach/compose/composer.tsx
    //    that should be computed during render instead.
    //  - purity: new in eslint-plugin-react-hooks v7 and not RSC-aware — it flags
    //    Date.now() in conversations/[businessId]/page.tsx, which is an async server
    //    component where that call is correct. False positive.
    name: 'seed-panel/lint-adoption-baseline',
    rules: {
      '@next/next/no-html-link-for-pages': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
    },
  },
]);
