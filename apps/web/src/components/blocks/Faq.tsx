import type { FaqData } from './types';

// Accordion of question/answer pairs. Uses native <details> so it works without
// client JS (server component, SSR-friendly).
export function Faq({ data }: { data: FaqData }) {
  const items = data.items ?? [];
  if (items.length === 0 && !data.heading) return null;
  return (
    <section style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      {data.heading && (
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            fontWeight: 700,
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}
        >
          {data.heading}
        </h2>
      )}
      <div>
        {items.map((q, i) => (
          <details key={i} style={{ borderBottom: '1px solid var(--border)', padding: '1rem 0' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '1.02rem', listStyle: 'none' }}>
              {q.question}
            </summary>
            {q.answer && (
              <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{q.answer}</p>
            )}
          </details>
        ))}
      </div>
    </section>
  );
}
