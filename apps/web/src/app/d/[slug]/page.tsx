import { queries } from '@seed-panel/db';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE_URL } from '@/lib/site';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

type Hero = { headline?: string; sub?: string; ctaPrimary?: string; ctaSecondary?: string };
type ServiceItem = { name: string; price?: string; duration?: string };
type Services = { title?: string; items?: ServiceItem[] };
type About = { title?: string; body?: string };
type Contact = { title?: string; hoursLabel?: string };
type Booking = { title?: string; whatsappMessage?: string };

type En = {
  hero?: Hero;
  services?: Services;
  about?: About;
  contact?: Contact;
  booking?: Booking;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await queries.getDemoBySlug(slug);
    if (!data) return { robots: 'noindex' };
    const en = (data.demo.content?.en ?? {}) as En;
    const title = `${data.business.name} — Book online`;
    const description =
      en.hero?.sub ??
      en.about?.body?.slice(0, 160) ??
      `Book your visit to ${data.business.name}.`;
    return {
      title,
      description,
      robots: 'noindex, nofollow',
      alternates: { canonical: `${SITE_URL}/d/${slug}` },
      openGraph: {
        type: 'website',
        title,
        description,
        url: `${SITE_URL}/d/${slug}`,
        siteName: data.business.name,
      },
      twitter: { card: 'summary', title, description },
    };
  } catch {
    return { robots: 'noindex' };
  }
}

function digitsOnly(s: string | null | undefined): string {
  return (s ?? '').replace(/\D/g, '');
}

export default async function DemoPage({ params }: Props) {
  const { slug } = await params;

  let data: Awaited<ReturnType<typeof queries.getDemoBySlug>> = null;
  try {
    data = await queries.getDemoBySlug(slug);
  } catch {
    notFound();
  }
  if (!data) notFound();

  // Fire-and-forget — never block the render
  queries.recordDemoView(data.demo.id).catch(() => {});

  const { demo, business } = data;
  const en = (demo.content?.en ?? {}) as En;
  const hero: Hero = en.hero ?? {};
  const services: ServiceItem[] = en.services?.items ?? [];
  const about: About = en.about ?? {};
  const contact: Contact = en.contact ?? {};
  const booking: Booking = en.booking ?? {};

  const waDigits = digitsOnly(business.whatsappNumber || business.phone);
  const waMessage = encodeURIComponent(
    booking.whatsappMessage ?? `Hi! I'd like to book at ${business.name}.`,
  );
  const waLink = waDigits ? `https://wa.me/${waDigits}?text=${waMessage}` : '#';
  const telLink = business.phone ? `tel:${business.phone.replace(/\s/g, '')}` : '#';
  const mapsLink = business.googleMapsUrl ??
    (business.lat && business.lng
      ? `https://maps.google.com/?q=${business.lat},${business.lng}`
      : null);

  return (
    <>
      {/* NAV */}
      <nav className="nav" id="nav">
        <div className="container nav-inner">
          <a href="#top" className="logo">
            <span className="logo-text">
              <span className="name">{business.name}</span>
              {business.areaZone && <span className="tag">{business.areaZone}</span>}
            </span>
          </a>
          <div className="nav-links">
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#contact">Visit</a>
            <a href={waLink} target="_blank" rel="noreferrer" className="nav-cta">
              Book on WhatsApp <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="top">
        <div className="container">
          <span className="hero-eyebrow">
            <span className="pulse"></span>
            {business.areaZone ? `${business.areaZone}, ${business.emirate.replace(/^./, (c) => c.toUpperCase())}` : 'Welcome'}
          </span>
          <h1>{hero.headline ?? business.name}</h1>
          {hero.sub && <p className="hero-sub">{hero.sub}</p>}
          <div className="hero-actions">
            <a href={waLink} target="_blank" rel="noreferrer" className="btn-primary">
              {hero.ctaPrimary ?? 'Book on WhatsApp'}
              <span className="arrow">→</span>
            </a>
            {business.phone && (
              <a href={telLink} className="btn-secondary">
                {hero.ctaSecondary ?? `Call ${business.phone}`}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      {services.length > 0 && (
        <section className="section" id="services">
          <div className="container">
            <div className="section-head reveal">
              <div>
                <div className="section-label">What we offer</div>
                <h2 className="section-title">{en.services?.title ?? 'Services'}</h2>
              </div>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem',
                marginTop: '2rem',
              }}
            >
              {services.map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: '1.5rem',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    background: 'var(--surface, transparent)',
                  }}
                >
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {s.name}
                  </h3>
                  {s.duration && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      {s.duration}
                    </p>
                  )}
                  {s.price && (
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem' }}>{s.price}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      {about.body && (
        <section className="section" id="about">
          <div className="container">
            <div className="section-head reveal">
              <div>
                <div className="section-label">About</div>
                <h2 className="section-title">{about.title ?? `Welcome to ${business.name}`}</h2>
              </div>
            </div>
            <p style={{ marginTop: '1.5rem', maxWidth: '720px', lineHeight: 1.7, color: 'var(--text-muted)' }}>
              {about.body}
            </p>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section className="section" id="contact">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="section-label">Visit us</div>
              <h2 className="section-title">{contact.title ?? 'Find us'}</h2>
            </div>
          </div>
          <div
            style={{
              marginTop: '2rem',
              display: 'grid',
              gap: '2rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            }}
          >
            {business.address && (
              <div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  ADDRESS
                </div>
                <p>{business.address}</p>
                {mapsLink && (
                  <a href={mapsLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem' }}>
                    Open in Google Maps →
                  </a>
                )}
              </div>
            )}
            {(business.phone || business.whatsappNumber) && (
              <div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  CONTACT
                </div>
                {business.phone && (
                  <p><a href={telLink}>{business.phone}</a></p>
                )}
                {business.whatsappNumber && (
                  <p>
                    <a href={waLink} target="_blank" rel="noreferrer">
                      WhatsApp · {business.whatsappNumber}
                    </a>
                  </p>
                )}
                {contact.hoursLabel && (
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    {contact.hoursLabel}
                  </p>
                )}
              </div>
            )}
          </div>

          <div style={{ marginTop: '3rem' }}>
            <a href={waLink} target="_blank" rel="noreferrer" className="btn-primary">
              {booking.title ?? 'Book on WhatsApp'} <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* SEED IT footer — the sales pitch */}
      <footer
        style={{
          padding: '3rem 1.5rem',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface-2, rgba(0,0,0,0.02))',
          textAlign: 'center',
        }}
      >
        <div className="container">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            We built this preview for {business.name} in 24 hours.
          </p>
          <p style={{ fontSize: '0.95rem' }}>
            Want a real one for your business? →{' '}
            <a
              href="https://seedit.ae"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
            >
              SEED IT
            </a>
            <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
              · Dubai · seedit.ae
            </span>
          </p>
        </div>
      </footer>
    </>
  );
}
