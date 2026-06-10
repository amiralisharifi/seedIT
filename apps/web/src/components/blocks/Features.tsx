import type { FeaturesData } from './types';

// Responsive grid of feature cards (icon + title + text).
export function Features({ data }: { data: FeaturesData }) {
  const items = data.items ?? [];
  if (items.length === 0 && !data.heading) return null;
  return (
    <section style={{ maxWidth: '960px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      {data.heading && (
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            fontWeight: 700,
            marginBottom: '2rem',
            textAlign: 'center',
          }}
        >
          {data.heading}
        </h2>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {items.map((it, i) => (
          <div
            key={i}
            style={{
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1.5rem',
              background: 'var(--surface, transparent)',
            }}
          >
            {it.icon && <div style={{ fontSize: '1.6rem', marginBottom: '0.6rem' }}>{it.icon}</div>}
            {it.title && (
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                {it.title}
              </h3>
            )}
            {it.text && <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>{it.text}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
