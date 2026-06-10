import type { Metadata } from 'next';
import Script from 'next/script';
import './landing.css';

export const metadata: Metadata = {
  title: 'SEEDIT — software UAE businesses actually use',
  description:
    'SEEDIT (Fertile Seed IT Solutions) builds dashboards, AI tools, and automation that runs in the background. Dubai-built, shipped to the world.',
  robots: { index: false, follow: false }, // staging — don't compete with /
};

const HERO_COPY =
  'We build the software UAE businesses actually use — marketing dashboards, AI tools, and automation that runs in the background. Dubai-built, shipped to the world.';

const STACK_BIO =
  'Fertile Seed IT Solutions — a Dubai studio building real, shipping software for UAE businesses. Below are the platforms we’ve built, and the capabilities behind them.';

const CTA_COPY =
  'Tell us what you’re building. We design, build, and ship real software for UAE businesses — dashboards, AI tools, automation, and more.';

const CONTACT_EMAIL = 'hello@seedit.ae';
const SITE = 'https://seedit.ae';

const TAGS = [
  'FULL-STACK',
  'AI AUTOMATION',
  'MARKETING ANALYTICS',
  'INTEGRATIONS',
  'BRAND & DESIGN',
];

const TECH = [
  'REACT',
  'NEXT.JS',
  'FASTAPI',
  'SUPABASE',
  'POSTGRES',
  'VERCEL',
  'RAILWAY',
  'AWS',
  'STRIPE',
  'N8N',
  'WHATSAPP API',
];

const NAV_WAVE_HEIGHTS = ['60%', '90%', '75%', '100%', '65%', '85%', '55%'];
const NAV_WAVE_DELAYS = ['0s', '.12s', '.24s', '.36s', '.48s', '.6s', '.72s'];

export default function LandingPreviewPage() {
  return (
    <>
      {/*
        Inter is added on this page only — root layout already loads
        JetBrains Mono. Rendered here so it stays scoped to /new and the
        root /, /blog etc. don't pay for it.
      */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&display=swap"
      />

      {/* z 60 — laptop intro (scroll-scrubbed video) */}
      <div className="intro-stage" id="intro-stage">
        <video id="intro-video" muted playsInline preload="metadata">
          <source src="/landing/v2/intro/laptop.mp4" type="video/mp4" />
        </video>
        <div className="iv-vignette" />
      </div>

      {/* z 70 — top-center "click here" skip prompt */}
      <button
        className="enter-pill"
        id="enter-pill"
        type="button"
        aria-label="Skip the intro and go to Seed It"
      >
        <span className="ep-dot" />
        <span className="ep-label">Click here to enter</span>
        <svg
          className="ep-arrow"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path
            d="M8 2v10M3.5 7.5 8 12l4.5-4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* z 9999 — loader */}
      <div className="loader" id="loader">
        <div className="center" id="loader-center">
          <div className="mk">
            <span id="loader-mark" /> SEED IT
          </div>
          <div className="bar">
            <i id="loader-bar" />
          </div>
        </div>
      </div>

      {/* z 0 — background ambient */}
      <div id="bg-video-stack">
        <canvas id="bg-canvas" />
      </div>

      {/* z 1 — WebGL hero objects (disabled in CSS in current build) */}
      <div id="webgl-root" />

      {/* z 9 — fixed hero overlay */}
      <div id="hero-content" aria-hidden="false">
        <div className="hero-inner">
          <span className="h-mark" id="hero-mark" />
          <h1>
            <b className="accent">SEED</b> <b>IT</b>
          </h1>
          <p>{HERO_COPY}</p>
          <a className="btn" href="#work" data-cursor-text="See what we build">
            <span className="br tl" />
            <span className="br tr" />
            <span className="br bl" />
            <span className="br br2" />
            <span>What we build</span>
            <span>↓</span>
          </a>
        </div>
      </div>

      {/* z 99 — edge blur + noise */}
      <div className="edge-blur">
        <div className="edge-blur__top" />
        <div className="edge-blur__bottom" />
      </div>
      <div className="noise" />

      {/* z 999 — frame border */}
      <div className="frameScreen" />

      {/* scrolling content */}
      <main>
        <div className="intro-spacer" aria-hidden="true" />

        <nav className="nav">
          <div className="wrap nav-inner">
            <a className="nav-logo" href="#top">
              <span id="nav-mark" /> SEED IT
            </a>
            <div className="nav-wave">
              {NAV_WAVE_HEIGHTS.map((h, i) => (
                <i key={i} style={{ height: h, animationDelay: NAV_WAVE_DELAYS[i] }} />
              ))}
            </div>
            <div className="nav-links">
              <a href="#stack" data-cursor-text="Capabilities">
                Capabilities <span className="sup">↗</span>
              </a>
              <a href="#work" data-cursor-text="Our products">
                Products <span className="sup">↗</span>
              </a>
              <a href="#about" data-cursor-text="What we do">
                Services <span className="sup">↗</span>
              </a>
              <a href="/blog" data-cursor-text="Read the blog">
                Blog <span className="sup">↗</span>
              </a>
              <a className="cv" href="#contact" data-cursor-text="Get in touch">
                Contact <span className="sup">↗</span>
              </a>
            </div>
          </div>
        </nav>

        <div className="hero-spacer" />

        {/* SPECIALIZATION */}
        <section id="stack" className="spec">
          <div className="wrap">
            <ul className="tags">
              {TAGS.flatMap((tag, i) => {
                const items = [
                  <li key={`tag-${i}`} className="motion-piece">
                    {tag === 'BRAND & DESIGN' ? <>BRAND &amp; DESIGN</> : tag}
                  </li>,
                ];
                if (i < TAGS.length - 1) {
                  items.push(<li key={`slash-${i}`} className="slash">/</li>);
                }
                return items;
              })}
            </ul>

            <h2 className="display" data-motion-text="">
              SEEDIT <span className="out">designs, builds,</span> and ships real products{' '}
              <span className="ic motion-inline-piece">⚡</span> from marketing dashboards to{' '}
              <span className="ic motion-inline-piece">◐</span> AI tools and{' '}
              <span className="accent">automation</span> that runs in the background.
            </h2>

            <p className="bio motion-piece">{STACK_BIO}</p>

            <div className="actions">
              <a
                className="btn motion-piece"
                href="#contact"
                data-cursor-text="Start a project"
              >
                <span className="br tl" />
                <span className="br tr" />
                <span className="br bl" />
                <span className="br br2" />
                <span>Start a project</span>
                <span>↗</span>
              </a>
              <a className="btn motion-piece" href="#work" data-cursor-text="View products">
                <span className="br tl" />
                <span className="br tr" />
                <span className="br bl" />
                <span className="br br2" />
                <span>View our products</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </section>

        {/* CASES */}
        <section id="work" className="cases">
          <div className="wrap">
            <div className="section-head">
              <h2 className="display" data-motion-text="">
                What we build.
                <br />
                <span className="out">Five platforms,</span>{' '}
                <span className="accent">shipping now.</span>
              </h2>
              <div className="info motion-piece">
                Dashboards · AI SaaS
                <br />
                Sports platforms · CRM
                <br />
                Automation · Integrations
              </div>
            </div>

            <div className="logoGroup">
              {TECH.flatMap((t, i) => {
                const items = [
                  <span key={`ent-${i}`} className="ent motion-piece">
                    {t}
                  </span>,
                ];
                if (i < TECH.length - 1) {
                  items.push(
                    <span key={`pip-${i}`} className="pip">
                      ·
                    </span>,
                  );
                }
                return items;
              })}
            </div>

            <div className="caseList" id="case-list" />
          </div>
        </section>

        {/* EXPERIENCE */}
        <section id="about" className="exp">
          <div className="wrap">
            <div className="section-head">
              <h2 className="display" data-motion-text="">
                Built with <span className="accent">intent.</span>
                <br />
                <span className="out">Shipped</span> for UAE business.
              </h2>
            </div>
            <div className="exp-grid" id="exp-grid" />
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="cta">
          <div className="wrap" style={{ textAlign: 'center' }}>
            <h2 className="display" data-motion-text="">
              Got an idea? <span className="accent">Let&apos;s plant it.</span>
            </h2>
            <p
              className="bio motion-piece"
              style={{ marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}
            >
              {CTA_COPY}
            </p>
            <div
              className="actions motion-piece"
              style={{ justifyContent: 'center', marginTop: 32 }}
            >
              <a className="btn" href={`mailto:${CONTACT_EMAIL}`} data-cursor-text="Send a note">
                <span className="br tl" />
                <span className="br tr" />
                <span className="br bl" />
                <span className="br br2" />
                <span>{CONTACT_EMAIL}</span>
                <span>↗</span>
              </a>
              <a
                className="btn"
                href={SITE}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-text="Visit site"
              >
                <span className="br tl" />
                <span className="br tr" />
                <span className="br bl" />
                <span className="br br2" />
                <span>seedit.ae</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </section>

        <footer>
          <div className="wrap">
            <div className="foot-top">
              <div>© {new Date().getFullYear()} SEEDIT · Fertile Seed IT Solutions EST · Dubai, UAE</div>
              <div className="grp">
                <a href="#stack">Capabilities<span className="sup">↗</span></a>
                <a href="#work">Products<span className="sup">↗</span></a>
                <a href="#about">Services<span className="sup">↗</span></a>
                <a href="#contact">Contact<span className="sup">↗</span></a>
                <a href="/blog">Blog<span className="sup">↗</span></a>
              </div>
              <div className="grp">
                <a href={SITE} target="_blank" rel="noopener noreferrer">
                  seedit.ae<span className="sup">↗</span>
                </a>
              </div>
            </div>
          </div>
          <div className="giant-wrap">
            <div className="giant" id="giant">
              SEED IT
            </div>
          </div>
        </footer>
      </main>

      {/*
        Scripts after hydration in source order.
        Lenis from CDN (v2 source uses unpkg). The 9 v2 modules each have an
        IIFE that mutates the DOM by ID — safe to mount after React renders.
      */}
      <Script
        src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"
        strategy="afterInteractive"
      />
      <Script src="/landing/v2/marks.js" strategy="afterInteractive" />
      <Script src="/landing/v2/loader.js" strategy="afterInteractive" />
      <Script src="/landing/v2/intro.js" strategy="afterInteractive" />
      <Script src="/landing/v2/bgcanvas.js" strategy="afterInteractive" />
      <Script src="/landing/v2/cases.js" strategy="afterInteractive" />
      <Script src="/landing/v2/exp.js" strategy="afterInteractive" />
      <Script src="/landing/v2/motion.js" strategy="afterInteractive" />
      <Script src="/landing/v2/scroll.js" strategy="afterInteractive" />
      <Script src="/landing/v2/init.js" strategy="afterInteractive" />
    </>
  );
}
