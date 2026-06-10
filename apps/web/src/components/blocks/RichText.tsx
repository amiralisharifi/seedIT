import type { RichTextData } from './types';

// Free-form HTML body (authored via the richText field). Reuses the shared
// `.prose` styles, same as the blog post body.
export function RichText({ data }: { data: RichTextData }) {
  if (!data.body) return null;
  return (
    <section style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: data.body }}
        style={{ color: 'var(--text)', lineHeight: 1.8, fontSize: '1.05rem' }}
      />
    </section>
  );
}
