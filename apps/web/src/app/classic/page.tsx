import type { Metadata } from 'next';
import LogoMark from '@/components/LogoMark';
import LogoFull from '@/components/LogoFull';
import ContactForm from '@/components/ContactForm';
import { queries } from '@seed-panel/db';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Classic home',
  // Archived copy of the pre-2026 home page — must never compete with / in search.
  robots: { index: false, follow: false },
};

export default async function ClassicHomePage() {
  let contact: Record<string, unknown> = {};
  try {
    contact = await queries.getSettings('contact');
  } catch {
    // fall back to defaults
  }

  const phone = (contact.phone as string) || '+971 50 000 0000';
  const whatsapp = (contact.whatsapp as string) || phone;
  const email = (contact.supportEmail as string) || 'hello@seedit.ae';
  const address = (contact.address as string) || 'Business Bay, Dubai';
  // wa.me needs digits only, no leading +
  const waNumber = whatsapp.replace(/\D/g, '');
  const waLink = `https://wa.me/${waNumber}`;
  const telLink = `tel:${phone.replace(/\s/g, '')}`;

  return (
    <>
      {/* =====================  NAV  ===================== */}
      <nav className="nav" id="nav">
        <div className="container nav-inner">
          <a href="#top" className="logo" aria-label="SEED IT — home">
            <span className="logo-mark">
              <LogoMark id="nav" />
            </span>
            <span className="logo-text">
              <span className="name">SEED IT</span>
              <span className="tag">We make IT on time</span>
            </span>
          </a>
          <div className="nav-links">
            <a href="#services">Services</a>
            <a href="#approach">Approach</a>
            <a href="#process">Process</a>
            <a href="/blog">Blog</a>
            <a href="#contact" className="nav-cta">
              Book a call
              <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </nav>

      {/* =====================  HERO  ===================== */}
      <section className="hero" id="top">
        <div className="container">
          <span className="hero-eyebrow">
            <span className="pulse"></span>
            Independent IT studio · Dubai, UAE · Available Q2
          </span>
          <h1>
            Websites, automations &amp; systems that <em className="grad">actually</em> ship on
            time.
          </h1>
          <p className="hero-sub">
            SEED IT is a Dubai-based studio building{' '}
            <strong>fast, conversion-focused websites</strong>,{' '}
            <strong>custom business automations</strong>, and{' '}
            <strong>brand &amp; UI design</strong> for ambitious companies across the UAE and the
            wider Gulf. No agency bloat. Tight scopes, sharp work, shipped on the date we promise.
          </p>
          <div className="hero-actions">
            <a href="#contact" className="btn-primary">
              Start a project
              <span className="arrow">→</span>
            </a>
            <a href="#services" className="btn-secondary">
              See what we do
            </a>
          </div>
        </div>

        {/* Marquee */}
        <div className="marquee">
          <div className="marquee-track">
            <span className="marquee-item">
              Web development <span className="sep">/</span>
            </span>
            <span className="marquee-item">
              <em>Automation</em> <span className="sep">/</span>
            </span>
            <span className="marquee-item">
              UI / UX design <span className="sep">/</span>
            </span>
            <span className="marquee-item">
              Brand systems <span className="sep">/</span>
            </span>
            <span className="marquee-item">
              <em>E-commerce</em> <span className="sep">/</span>
            </span>
            <span className="marquee-item">
              Custom dashboards <span className="sep">/</span>
            </span>
            <span className="marquee-item">
              API integrations <span className="sep">/</span>
            </span>
            <span className="marquee-item">
              <em>AI workflows</em> <span className="sep">/</span>
            </span>
            {/* Duplicate for seamless loop */}
            <span className="marquee-item">
              Web development <span className="sep">/</span>
            </span>
            <span className="marquee-item">
              <em>Automation</em> <span className="sep">/</span>
            </span>
            <span className="marquee-item">
              UI / UX design <span className="sep">/</span>
            </span>
            <span className="marquee-item">
              Brand systems <span className="sep">/</span>
            </span>
            <span className="marquee-item">
              <em>E-commerce</em> <span className="sep">/</span>
            </span>
            <span className="marquee-item">
              Custom dashboards <span className="sep">/</span>
            </span>
            <span className="marquee-item">
              API integrations <span className="sep">/</span>
            </span>
            <span className="marquee-item">
              <em>AI workflows</em> <span className="sep">/</span>
            </span>
          </div>
        </div>
      </section>

      {/* =====================  SERVICES  ===================== */}
      <section className="section" id="services">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="section-label">What we do</div>
              <h2 className="section-title">
                Three things, done <em className="grad">exceptionally</em> well.
              </h2>
            </div>
            <p className="section-aside">
              Most agencies sell breadth. We sell depth. Pick the engagement that fits — or combine
              all three for a full digital build.
            </p>
          </div>

          <div className="services">
            <div className="service reveal">
              <div className="service-num">01</div>
              <div>
                <div className="service-name">
                  Web
                  <br />
                  Development
                </div>
              </div>
              <div className="service-desc">
                Marketing sites, e-commerce stores, web apps and bespoke platforms. Built on modern
                stacks (Next.js, Astro, Shopify, Webflow) with performance, SEO and conversion baked
                in from day one. Pages that load in under a second and turn visitors into customers.
              </div>
              <div className="service-tags">
                <span className="tag">Next.js</span>
                <span className="tag">Shopify</span>
                <span className="tag">Webflow</span>
                <span className="tag">Headless CMS</span>
              </div>
            </div>

            <div className="service reveal">
              <div className="service-num">02</div>
              <div>
                <div className="service-name">
                  Automation
                  <br />
                  &amp; AI
                </div>
              </div>
              <div className="service-desc">
                Stop paying staff to do work software should do. We build custom automations across
                your stack — CRM, accounting, WhatsApp, email, internal tools — and integrate AI
                where it actually saves hours, not headlines. Less admin, more output.
              </div>
              <div className="service-tags">
                <span className="tag">n8n / Make</span>
                <span className="tag">Zapier</span>
                <span className="tag">OpenAI / Claude</span>
                <span className="tag">Custom APIs</span>
              </div>
            </div>

            <div className="service reveal">
              <div className="service-num">03</div>
              <div>
                <div className="service-name">
                  Design
                  <br />
                  &amp; Brand
                </div>
              </div>
              <div className="service-desc">
                UI, UX, and brand systems for companies that care how they look. From a single
                landing page to a complete identity rebuild — interfaces designed to convert, brands
                designed to last. Strategy first, beauty second, always together.
              </div>
              <div className="service-tags">
                <span className="tag">UI / UX</span>
                <span className="tag">Brand identity</span>
                <span className="tag">Design systems</span>
                <span className="tag">Figma</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================  APPROACH  ===================== */}
      <section className="section approach" id="approach">
        <div className="container">
          <div className="approach-grid">
            <div className="approach-visual reveal">
              <div className="approach-mark">
                <LogoMark id="approach" />
              </div>
            </div>

            <div className="approach-content reveal">
              <div className="section-label">Why work with us</div>
              <h3>
                Senior work. Direct line. <em className="grad">No layers.</em>
              </h3>
              <p>
                You&apos;ll work directly with the person building your project. No account managers,
                no junior handoffs, no slide decks dressed up as deliverables.
              </p>
              <p>
                We <strong>scope tightly</strong>, <strong>ship in weeks not quarters</strong>, and
                stay around after launch. Most clients come from referrals — which only happens when
                the work is genuinely good and delivered when promised.
              </p>
              <p>
                Based in Dubai, working across the UAE, KSA and beyond.{' '}
                <strong>Trade-license registered, VAT compliant, invoiced in AED or USD.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================  PROCESS  ===================== */}
      <section className="section" id="process">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="section-label">How it works</div>
              <h2 className="section-title">
                From first call to <em className="grad">shipped</em> — in four steps.
              </h2>
            </div>
          </div>

          <div className="process-steps">
            <div className="step reveal">
              <div className="step-num">i</div>
              <h4>Discovery call</h4>
              <p>
                30 minutes. We listen, ask sharp questions, and tell you honestly whether we&apos;re
                the right fit. Free, no obligation.
              </p>
            </div>
            <div className="step reveal">
              <div className="step-num">ii</div>
              <h4>Scope &amp; proposal</h4>
              <p>
                Within 48 hours — a fixed-scope proposal with clear deliverables, milestones, and a
                flat price. No surprises later.
              </p>
            </div>
            <div className="step reveal">
              <div className="step-num">iii</div>
              <h4>Build &amp; iterate</h4>
              <p>
                Weekly check-ins, a live preview link from day one, and async updates on Slack or
                WhatsApp. You see progress every week.
              </p>
            </div>
            <div className="step reveal">
              <div className="step-num">iv</div>
              <h4>Launch &amp; support</h4>
              <p>
                We deploy, monitor, and stay around for 30 days post-launch. Optional retainer for
                ongoing growth and improvements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================  STATS  ===================== */}
      <section className="section" style={{ padding: 0 }}>
        <div className="container">
          <div className="stats reveal">
            <div className="stat">
              <div className="stat-num">
                50<em>+</em>
              </div>
              <div className="stat-label">Projects shipped</div>
            </div>
            <div className="stat">
              <div className="stat-num">
                <em>~</em>3 wk
              </div>
              <div className="stat-label">Avg. project time</div>
            </div>
            <div className="stat">
              <div className="stat-num">
                98<em>%</em>
              </div>
              <div className="stat-label">On-time delivery</div>
            </div>
            <div className="stat">
              <div className="stat-num">
                2<em>x</em>
              </div>
              <div className="stat-label">Avg. conversion lift</div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================  TESTIMONIAL  ===================== */}
      <section className="section testimonial">
        <div className="container">
          <div className="quote reveal">
            <div className="quote-mark">&ldquo;</div>
            <p>
              They rebuilt our site, automated half our admin, and trained our team — in{' '}
              <em>under a month</em>. Best money we&apos;ve spent on the business this year, by a
              long way.
            </p>
            <div className="quote-attr">
              <div className="quote-avatar">A</div>
              <div>
                <div className="quote-name">Ahmed R.</div>
                <div className="quote-role">Founder, Logistics Co. · Dubai</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================  CONTACT / CTA  ===================== */}
      <section className="section cta" id="contact">
        <div className="container">
          <div className="cta-grid">
            <div className="cta-text reveal">
              <div className="section-label">Get in touch</div>
              <h2>
                Let&apos;s build something <em className="grad">remarkable.</em>
              </h2>
              <p>
                Tell us about your project. We respond within one business day with honest thoughts
                on scope, timeline and price — even if we&apos;re not the right fit.
              </p>
              <ul className="contact-list">
                <li>
                  <span className="label">Email</span>
                  <a href={`mailto:${email}`} className="value">
                    {email}
                  </a>
                </li>
                <li>
                  <span className="label">Phone</span>
                  <a href={telLink} className="value">
                    {phone}
                  </a>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="value whatsapp-btn"
                  >
                    WhatsApp
                  </a>
                </li>
                <li>
                  <span className="label">Studio</span>
                  <span className="value">{address}</span>
                </li>
                <li>
                  <span className="label">Hours</span>
                  <span className="value">Sun – Thu · 09:00 – 18:00 GST</span>
                </li>
              </ul>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

      {/* =====================  FOOTER  ===================== */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <LogoFull />
              </div>
              <p>
                An independent IT studio in Dubai. We build websites, automations and design systems
                — and we ship them on time.
              </p>
            </div>
            <div className="footer-col">
              <h5>Services</h5>
              <ul>
                <li>
                  <a href="#services">Web development</a>
                </li>
                <li>
                  <a href="#services">Automation &amp; AI</a>
                </li>
                <li>
                  <a href="#services">Design &amp; brand</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Studio</h5>
              <ul>
                <li>
                  <a href="#approach">Approach</a>
                </li>
                <li>
                  <a href="#process">Process</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Reach us</h5>
              <ul>
                <li>
                  <a href={`mailto:${email}`}>{email}</a>
                </li>
                <li>
                  <a href={telLink}>{phone}</a>
                </li>
                <li>
                  <a href={waLink} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-meta">© 2026 SEED IT · Dubai, UAE · All rights reserved</div>
            <a href="#top" className="footer-back">
              Back to top ↑
            </a>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-float"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>

      {/* Client-side scripts: nav scroll state + reveal animations */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            const nav = document.getElementById('nav');
            window.addEventListener('scroll', () => {
              if (window.scrollY > 20) nav.classList.add('scrolled');
              else nav.classList.remove('scrolled');
            });

            const observer = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  entry.target.classList.add('in');
                  observer.unobserve(entry.target);
                }
              });
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
            document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
          `,
        }}
      />
    </>
  );
}
