import type { HeroData } from './types';

// Centered hero block: eyebrow, heading, subheading, single CTA. Server
// component — pure render, styled with the site's CSS vars (see globals.css).
export function Hero({ data }: { data: HeroData }) {
  return (
    <section style={{ maxWidth: '880px', margin: '0 auto', padding: '5rem 1.5rem 3rem', textAlign: 'center' }}>
      {data.eyebrow && (
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: '1rem',
          }}
        >
          {data.eyebrow}
        </p>
      )}
      {data.heading && (
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: '1.25rem',
          }}
        >
          {data.heading}
        </h1>
      )}
      {data.subheading && (
        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '620px', margin: '0 auto 2rem' }}>
          {data.subheading}
        </p>
      )}
      {data.ctaLabel && data.ctaHref && (
        <a href={data.ctaHref} className="btn-primary">
          {data.ctaLabel} <span className="arrow">→</span>
        </a>
      )}
    </section>
  );
}
