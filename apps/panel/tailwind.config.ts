import type { Config } from 'tailwindcss';

/**
 * Tailwind for seed-panel.
 *
 * Brand colors come from `config/brand.ts` via CSS variables defined in
 * `app/globals.css`. That way Tailwind classes like `bg-primary` always
 * reflect the current deployment's brand without recompiling Tailwind.
 *
 * To change brand colors: edit config/brand.ts. No Tailwind config edits
 * needed.
 */
export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // CSS vars set in globals.css, sourced from config/brand.ts
        primary: {
          DEFAULT: 'hsl(var(--color-primary) / <alpha-value>)',
          foreground: 'hsl(var(--color-primary-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--color-accent) / <alpha-value>)',
          foreground: 'hsl(var(--color-accent-foreground) / <alpha-value>)',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--color-sidebar) / <alpha-value>)',
          foreground: 'hsl(var(--color-sidebar-foreground) / <alpha-value>)',
          border: 'hsl(var(--color-sidebar-border) / <alpha-value>)',
        },
        // Neutral palette (independent of brand)
        background: 'hsl(var(--color-background) / <alpha-value>)',
        foreground: 'hsl(var(--color-foreground) / <alpha-value>)',
        muted: {
          DEFAULT: 'hsl(var(--color-muted) / <alpha-value>)',
          foreground: 'hsl(var(--color-muted-foreground) / <alpha-value>)',
        },
        border: 'hsl(var(--color-border) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],
        arabic: ['var(--font-arabic)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
