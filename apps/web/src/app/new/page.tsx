import type { Metadata } from 'next';
import Script from 'next/script';
import './landing.css';

export const metadata: Metadata = {
  title: 'SEED IT — vibe coding studio',
  description:
    'We help founders and makers turn ideas into real products — fast, clean, and built to last. Website development, vibe coding & automation.',
  robots: { index: false, follow: false }, // staging — don't compete with /
};

const HERO_COPY =
  'We help founders and makers turn ideas into real products — fast, clean, and built to last. Plant the seed, watch it grow.';

const CONTACT_EMAIL = 'hello@seedit.ae';

export default function LandingPreviewPage() {
  return (
    <>
      {/* z 60 — laptop intro (scroll-scrubbed video) */}
      <div className="intro-stage" id="intro-stage">
        {/*
          preload="metadata" pulls only the first frame + container info
          (~100 KB) instead of the full 12 MB. The browser streams the
          rest as scroll-scrubbing demands it.
        */}
        <video id="intro-video" muted playsInline preload="metadata">
          <source src="/landing/intro.mp4" type="video/mp4" />
        </video>
        <div className="iv-vignette" />
      </div>

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

      {/* z 1 — WebGL hero (disabled by CSS in current build) */}
      <div id="webgl-root" />

      {/* z 9 — fixed hero overlay */}
      <div id="hero-content" aria-hidden="false">
        <div className="hero-inner">
          <span className="h-mark" id="hero-mark" />
          <h1>
            <b className="accent">SEED</b> <b>IT</b>
          </h1>
          <p>{HERO_COPY}</p>
          <a className="btn" href="#contact" data-cursor-text="Start a project">
            <span className="br tl" />
            <span className="br tr" />
            <span className="br bl" />
            <span className="br br2" />
            <span>Start a project</span>
            <span>↗</span>
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
              <i style={{ height: '60%', animationDelay: '0s' }} />
              <i style={{ height: '90%', animationDelay: '.12s' }} />
              <i style={{ height: '75%', animationDelay: '.24s' }} />
              <i style={{ height: '100%', animationDelay: '.36s' }} />
              <i style={{ height: '65%', animationDelay: '.48s' }} />
              <i style={{ height: '85%', animationDelay: '.6s' }} />
              <i style={{ height: '55%', animationDelay: '.72s' }} />
            </div>
            <div className="nav-links">
              <a href="#work" data-cursor-text="View work">
                Work <span className="sup">↗</span>
              </a>
              <a href="#stack" data-cursor-text="See stack">
                Stack <span className="sup">↗</span>
              </a>
              <a href="#about" data-cursor-text="About us">
                About <span className="sup">↗</span>
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
              <li className="motion-piece">WEB DEVELOPMENT</li>
              <li className="slash">/</li>
              <li className="motion-piece">VIBE CODING</li>
              <li className="slash">/</li>
              <li className="motion-piece">AUTOMATION</li>
              <li className="slash">/</li>
              <li className="motion-piece">AI APPS</li>
              <li className="slash">/</li>
              <li className="motion-piece">LANDING PAGES</li>
            </ul>

            <h2 className="display" data-motion-text="">
              We <span className="out">specialize</span> in{' '}
              <span className="ic motion-inline-piece">⚡</span> fast{' '}
              <span className="accent">website development</span>,{' '}
              <span className="ic motion-inline-piece">◐</span> live{' '}
              <span className="accent">vibe-coded</span> products, and{' '}
              <span className="ic motion-inline-piece">∞</span> clean{' '}
              <span className="accent">automation</span> for ambitious founders.
            </h2>

            <p className="bio motion-piece">
              A small studio of senior builders. Two-week sprints. Live-coded with you. Real
              products, shipped to the world — auth, billing, AI, all the boring parts done.
            </p>

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
              <a className="btn motion-piece" href="#work" data-cursor-text="View work">
                <span className="br tl" />
                <span className="br tr" />
                <span className="br bl" />
                <span className="br br2" />
                <span>View our work</span>
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
                Selected projects.
                <br />
                <span className="out">We&apos;ve shipped</span> over{' '}
                <span className="accent">40+</span> products.
              </h2>
              <div className="info motion-piece">
                Startups · SaaS · AI tools
                <br />
                MVPs · Internal tools
                <br />
                Personal projects
              </div>
            </div>

            <div className="logoGroup">
              <span className="ent motion-piece">NEXT.JS</span>
              <span className="pip">·</span>
              <span className="ent motion-piece">SUPABASE</span>
              <span className="pip">·</span>
              <span className="ent motion-piece">OPENAI</span>
              <span className="pip">·</span>
              <span className="ent motion-piece">VERCEL</span>
              <span className="pip">·</span>
              <span className="ent motion-piece">STRIPE</span>
              <span className="pip">·</span>
              <span className="ent motion-piece">FIGMA</span>
              <span className="pip">·</span>
              <span className="ent motion-piece">TYPESCRIPT</span>
              <span className="pip">·</span>
              <span className="ent motion-piece">POSTGRES</span>
              <span className="pip">·</span>
              <span className="ent motion-piece">RESEND</span>
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
                <span className="out">Shipped</span> with care.
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
              Two-week sprints. Live-coded with you. Real products, shipped to the world.
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
              <a className="btn" href="#" data-cursor-text="Book a call">
                <span className="br tl" />
                <span className="br tr" />
                <span className="br bl" />
                <span className="br br2" />
                <span>Book a call</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </section>

        <footer>
          <div className="wrap">
            <div className="foot-top">
              <div>© {new Date().getFullYear()} SEED IT — All rights reserved</div>
              <div className="grp">
                <a href="#work">
                  Work<span className="sup">↗</span>
                </a>
                <a href="#stack">
                  Stack<span className="sup">↗</span>
                </a>
                <a href="#about">
                  About<span className="sup">↗</span>
                </a>
                <a href="/blog">
                  Blog<span className="sup">↗</span>
                </a>
              </div>
              <div className="grp">
                <a href="#">
                  GH<span className="sup">↗</span>
                </a>
                <a href="#">
                  X<span className="sup">↗</span>
                </a>
                <a href="#">
                  IN<span className="sup">↗</span>
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
        Scripts run after hydration in source order. Lenis must load before
        03-intro and 08-scroll since they depend on it.
      */}
      <Script src="/landing/js/lenis.min.js" strategy="afterInteractive" />
      <Script src="/landing/js/01-marks.js" strategy="afterInteractive" />
      <Script src="/landing/js/02-loader.js" strategy="afterInteractive" />
      <Script src="/landing/js/03-intro.js" strategy="afterInteractive" />
      <Script src="/landing/js/04-bg-canvas.js" strategy="afterInteractive" />
      <Script src="/landing/js/05-cases.js" strategy="afterInteractive" />
      <Script src="/landing/js/06-experience.js" strategy="afterInteractive" />
      <Script src="/landing/js/07-motion.js" strategy="afterInteractive" />
      <Script src="/landing/js/08-scroll.js" strategy="afterInteractive" />
      <Script src="/landing/js/09-init.js" strategy="afterInteractive" />
    </>
  );
}
