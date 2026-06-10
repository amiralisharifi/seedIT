import type { CtaData } from './types';

// Centered call-to-action: heading + single button.
export function Cta({ data }: { data: CtaData }) {
  return (
    <section style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>
      {data.heading && (
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            fontWeight: 700,
            marginBottom: '1.5rem',
          }}
        >
          {data.heading}
        </h2>
      )}
      {data.buttonLabel && data.buttonHref && (
        <a href={data.buttonHref} className="btn-primary">
          {data.buttonLabel} <span className="arrow">→</span>
        </a>
      )}
    </section>
  );
}
