import type { TestimonialsData } from './types';

// Grid of quote cards (quote + author + role).
export function Testimonials({ data }: { data: TestimonialsData }) {
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {items.map((t, i) => (
          <figure
            key={i}
            style={{ border: '1px solid var(--border)', padding: '1.75rem', margin: 0 }}
          >
            {t.quote && (
              <blockquote style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--text)' }}>
                “{t.quote}”
              </blockquote>
            )}
            {(t.author || t.role) && (
              <figcaption style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {t.author}
                {t.author && t.role ? ' · ' : ''}
                {t.role}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
