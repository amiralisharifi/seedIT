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
    // page rewrites along. Everything else stays at error, so new code can't regress.
    //
    // Backlog: 22 internal <a href="/..."> nav links across the landing/blog pages
    // should become <Link> from next/link (they currently force a full page reload).
    // Counted twice by the rule because src/app/[...path] catch-all also matches.
    name: 'seed-panel/lint-adoption-baseline',
    rules: {
      '@next/next/no-html-link-for-pages': 'warn',
    },
  },
]);
