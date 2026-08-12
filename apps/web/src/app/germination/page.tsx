import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import './germination.css';

export const metadata: Metadata = {
  title: 'SEED IT — Search, AI visibility & infrastructure, out of Dubai',
  description:
    'SEED IT is a Dubai-licensed technical partner for organic growth: SEO and site audits, AI answer-engine visibility, analytics, and the DNS, email and uptime infrastructure underneath. English and Arabic. DET Trade Licence 1112101.',
  robots: { index: false, follow: false }, // staging variant — don't compete with /
};

/*
  Brand strings are kept in one place at the top of this file rather than
  scattered through the markup. Longer term these should move into a shared
  brand/site config (see AGENTS.md rule #1) so a fork can override them.
*/
const CONTACT_EMAIL = 'ceo@seedit.ae';
const PHONE = '+971 54 443 5527';
const WHATSAPP = 'https://wa.me/971544435527';
const OFFICE = 'Office 220, Hor Al Anz East, Dubai';
const LICENCE = '1112101';

// Custom CSS properties (--i, --h, ...) aren't in React's CSSProperties type.
const cv = (o: Record<string, string | number>) => o as CSSProperties;

const TECH = [
  'Next.js', 'React', 'TypeScript', 'FastAPI', 'Python', 'Supabase', 'PostgreSQL',
  'n8n', 'Stripe', 'WhatsApp Cloud API', 'GA4', 'Tag Manager', 'Cloudflare',
  'Vercel', 'Schema.org', 'SPF / DKIM / DMARC',
];

// Acid-lime plant mark: the same vector silhouette as <LogoMark>, filled with
// currentColor (set to --acid in CSS) instead of the teal gradient PNG.
function AcidMark() {
  return (
    <svg
      className="mark"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="88 110 86 192"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        transform="matrix(1,0,0,-1,0,409.707)"
        d="M94.573 293.206V248.274C94.573 228.908 110.307 213.15 129.663 213.107V195.548L103.954 178.286C102.873 177.56 102.223 176.341 102.223 175.038V135.474C98.709 133.954 96.243 130.458 96.243 126.392 96.243 120.938 100.68 116.501 106.134 116.501 111.588 116.501 116.026 120.938 116.026 126.392 116.026 130.458 113.56 133.954 110.047 135.474V172.954L129.683 186.138V135.524C126.108 134.032 123.588 130.502 123.588 126.392 123.588 120.938 128.025 116.501 133.48 116.501 138.934 116.501 143.372 120.938 143.372 126.392 143.372 130.13 141.286 133.39 138.218 135.072 138.219 135.113 138.23 135.152 138.23 135.193V185.985L156.955 173.413V135.883C156.955 135.681 156.988 135.488 157.014 135.293 153.704 133.693 151.409 130.309 151.409 126.392 151.409 120.938 155.847 116.501 161.301 116.501 166.756 116.501 171.193 120.938 171.193 126.392 171.193 130.309 168.898 133.693 165.587 135.293 165.614 135.488 165.647 135.681 165.647 135.883V175.729C165.647 177.178 164.925 178.531 163.723 179.338L138.355 196.371V200.108H138.432C157.823 200.108 173.6 215.884 173.6 235.277V280.21H166.086C153.803 280.21 142.977 273.875 136.686 264.307 133.719 280.716 119.34 293.206 102.088 293.206ZM102.213 248.274V285.565C117.335 285.498 129.615 273.175 129.615 258.039V220.747C114.493 220.814 102.213 233.136 102.213 248.274M138.559 245.041C138.559 260.177 150.84 272.499 165.959 272.568V235.277C165.959 220.14 153.678 207.819 138.559 207.75ZM157.203 126.392C157.203 128.652 159.042 130.49 161.301 130.49 163.56 130.49 165.398 128.652 165.398 126.392 165.398 124.133 163.56 122.295 161.301 122.295 159.042 122.295 157.203 124.133 157.203 126.392M129.382 126.392C129.382 128.652 131.221 130.49 133.48 130.49 135.739 130.49 137.578 128.652 137.578 126.392 137.578 124.133 135.739 122.295 133.48 122.295 131.221 122.295 129.382 124.133 129.382 126.392M102.038 126.392C102.038 128.652 103.875 130.49 106.134 130.49 108.394 130.49 110.232 128.652 110.232 126.392 110.232 124.133 108.394 122.295 106.134 122.295 103.875 122.295 102.038 124.133 102.038 126.392"
      />
    </svg>
  );
}

export default function GerminationPage() {
  return (
    <div className="germination">
      {/*
        Set the .js gate before first paint. app.js also sets it, but that runs
        afterInteractive — late enough that the reveal state (.js [data-rise]
        {opacity:0}) and the deck rail height (auto -> 100vh + (n-1)*72vh) would
        both apply after the browser has already painted, as a visible flash and
        a large layout shift.
      */}
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />

      {/* Fonts scoped to this page (root layout loads its own). */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap"
      />

      <a className="skip" href="#gmain">Skip to content</a>
      <div className="prog" aria-hidden="true" />

      <header className="nav" id="gnav">
        <div className="wrap">
          <a className="logo" href="#gmain">
            <AcidMark />
            <b>SEED IT</b>
            <span className="lic">Dubai · DET {LICENCE}</span>
          </a>
          <nav className="nav-links" aria-label="Sections">
            <a href="#built">Built</a>
            <a href="#work">What we do</a>
            <a href="#how">How</a>
            <a href="#licence">Licence</a>
          </nav>
          <a className="cta" href="#contact"><span>Book a call</span><span className="arw" aria-hidden="true">↗</span></a>
        </div>
      </header>

      <main id="gmain">
        {/* ================= HERO ================= */}
        <section className="hero">
          <div className="wrap">
            <div className="hero-grid">
              <div>
                <p className="eyebrow" data-rise="">Dubai · EN / AR · Licensed DET {LICENCE}</p>
                <h1 className="big" id="ghook">
                  <span className="ln" style={cv({ '--i': 0 })}><i>Get found</i></span>
                  <span className="ln" style={cv({ '--i': 1 })}><i>in search —</i></span>
                  <span className="ln" style={cv({ '--i': 2 })}><i>and in the</i></span>
                  <span className="ln" style={cv({ '--i': 3 })}><i><em>AI answer</em>.</i></span>
                </h1>
                <p className="sub" data-rise="" style={cv({ '--i': 5 })}>
                  One operator for the whole organic stack:{' '}
                  <b>SEO, AI answer visibility, analytics, DNS, email, uptime.</b> Inside your accounts.
                </p>
                <div className="hero-acts" data-rise="" style={cv({ '--i': 6 })}>
                  <a className="cta" href="#contact"><span>Send us your domain</span><span className="arw" aria-hidden="true">↗</span></a>
                  <a className="cta cta-ghost" href="#built"><span>See what we built</span></a>
                </div>
              </div>

              <div className="ans" data-rise="" style={cv({ '--i': 4 })} aria-label="Illustrative answer-engine result">
                <div className="ans-h"><span className="dot" aria-hidden="true" /><span className="tag">Answer engine</span><span className="tag">Illustrative</span></div>
                <div className="q"><i>Q</i><p>Who fixes search and AI visibility for a Dubai brand — in Arabic too?</p></div>
                <div className="a">
                  <p className="a-body" id="gAnsBody">
                    <b>SEED IT</b>, a Dubai-licensed technical partner (DET {LICENCE}) working across SEO, generative engine optimisation, analytics and the infrastructure underneath<span className="cite" data-src="seedit.ae">1</span>. It runs its own products — a UAE price-comparison engine<span className="cite" data-src="witchone.ae">2</span> and a live tournament platform<span className="cite" data-src="neshat.ae">3</span>. Month to month; the client keeps every account<span className="cite" data-src="seedit.ae/terms">4</span>.<span className="caret" aria-hidden="true" />
                  </p>
                </div>
                <div className="srcs">
                  <span>Sources</span>
                  <a href="#licence">seedit.ae</a>
                  <a href="https://witchone.ae" target="_blank" rel="noopener">witchone.ae</a>
                  <a href="https://neshat.ae" target="_blank" rel="noopener">neshat.ae</a>
                  <a href="https://ayvan.app" target="_blank" rel="noopener">ayvan.app</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mq" aria-hidden="true">
          <div className="mq-run">
            {TECH.map((t, i) => <i key={`a${i}`}>{t}</i>)}
            {TECH.map((t, i) => <i key={`b${i}`}>{t}</i>)}
          </div>
        </div>

        {/* ================= BUILT — dealt-card deck ================= */}
        {/*
          --n must match the number of .dk cards: app.js derives the scroll
          rail height from it (100vh + (n-1)*72vh) to pace the deal.
        */}
        <section className="deck" id="built" style={cv({ '--n': 6 })}>
          <div className="deck-rail">
            <div className="deck-stick">
              <div className="wrap deck-in">
                <div className="deck-hd">
                  <p className="num">01 / OWN PRODUCTS</p>
                  <h2>Six we built<br />ourselves.</h2>
                  <p className="lead">Not client logos. Our own products, on the same stack we bring to your work.</p>
                  <div className="deck-ct" aria-hidden="true"><b id="gdeckCt">01</b><span className="deck-bar" id="gdeckBar"><i /></span><span>06</span></div>
                </div>

                <div className="deck-stage">
                  <a className="dk" href="https://witchone.ae" target="_blank" rel="noopener">
                    <div className="dk-t"><span className="dk-n">01</span><span className="st live"><span className="dot" aria-hidden="true" />Live</span><span className="dk-kind">Shopping AI</span></div>
                    <h3>Witch One</h3>
                    <div className="dk-b">
                      <div>
                        <p>Paste a product link. It reads prices, stock and reviews across UAE stores and returns <b>one verdict</b>.</p>
                        <ul className="tags"><li>Link → verdict</li><li>Multi-store</li><li>Witch Score</li></ul>
                      </div>
                      <div className="scr">
                        <div className="scr-bar"><em /><u>witchone.ae/compare</u></div>
                        <div className="scr-in">
                          <div className="scr-hd"><span>The verdict</span><u>5 stores</u></div>
                          <div className="rows">
                            <em className="hi">Noon — 2 day <b>AED 389</b></em>
                            <em>Amazon.ae — 4 day <b>AED 412</b></em>
                            <em>Namshi — low stock <b>AED 430</b></em>
                            <em>6thStreet — 3 day <b>AED 445</b></em>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="dk-f"><span>witchone.ae</span><em aria-hidden="true">↗</em></div>
                  </a>

                  <a className="dk" href="https://neshat.ae" target="_blank" rel="noopener">
                    <div className="dk-t"><span className="dk-n">02</span><span className="st live"><span className="dot" aria-hidden="true" />Live</span><span className="dk-kind">Sports ops</span></div>
                    <h3>Neshat</h3>
                    <div className="dk-b">
                      <div>
                        <p>Registration, draws, scheduling and live results — tournament day runs on the <b>system</b>, not a group chat.</p>
                        <ul className="tags"><li>Auto brackets</li><li>Live results</li><li>Multi-sport</li></ul>
                      </div>
                      <div className="scr">
                        <div className="scr-bar"><em /><u>neshat.ae/tournament/live</u></div>
                        <div className="scr-in">
                          <div className="scr-hd"><span>Bracket control</span><u>live</u></div>
                          <div className="brk">
                            <b style={{ left: 0, top: '2px', width: '40%' }} /><b style={{ left: 0, top: '20px', width: '40%' }} />
                            <b style={{ left: 0, top: '42px', width: '40%' }} /><b style={{ left: 0, top: '60px', width: '40%' }} />
                            <i style={{ left: '40%', top: '10px', width: '9%', height: '1px' }} /><i style={{ left: '40%', top: '50px', width: '9%', height: '1px' }} />
                            <i style={{ left: '49%', top: '10px', width: '1px', height: '40px' }} />
                            <b style={{ left: '49%', top: '24px', width: '28%' }} />
                            <i style={{ left: '77%', top: '30px', width: '16%', height: '1px' }} />
                          </div>
                          <div className="rows"><em className="hi">Court 3 — quarter-final <b>6-4 3-2</b></em></div>
                        </div>
                      </div>
                    </div>
                    <div className="dk-f"><span>neshat.ae</span><em aria-hidden="true">↗</em></div>
                  </a>

                  <a className="dk" href="https://counsel-saas.vercel.app" target="_blank" rel="noopener">
                    <div className="dk-t"><span className="dk-n">03</span><span className="st">Beta</span><span className="dk-kind">AI SaaS</span></div>
                    <h3>Conseal</h3>
                    <div className="dk-b">
                      <div>
                        <p>Routes each task to the model that fits it, on <b>your own API keys</b>. Nothing gets billed at frontier prices without reason.</p>
                        <ul className="tags"><li>Per-role routing</li><li>BYOK</li><li>UAE-first</li></ul>
                      </div>
                      <div className="scr">
                        <div className="scr-bar"><em /><u>conseal — model routing</u></div>
                        <div className="scr-in">
                          <div className="scr-hd"><span>Model routing</span><u>BYOK</u></div>
                          <div className="rows">
                            <em className="hi">Legal review → <b>reasoning</b></em>
                            <em>Bulk rewrite → <b>fast</b></em>
                            <em>Vision check → <b>multimodal</b></em>
                            <em>Arabic draft → <b>ar-tuned</b></em>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="dk-f"><span>Conseal</span><em aria-hidden="true">↗</em></div>
                  </a>

                  <a className="dk" href="https://ads-dashboard-weld.vercel.app" target="_blank" rel="noopener">
                    <div className="dk-t"><span className="dk-n">04</span><span className="st">In build</span><span className="dk-kind">Marketing data</span></div>
                    <h3>Salut</h3>
                    <div className="dk-b">
                      <div>
                        <p>Google Ads and GA4 in one view, so it is obvious <b>which campaigns earn</b> and which burn budget.</p>
                        <ul className="tags"><li>ROAS</li><li>Keyword explorer</li><li>GA4</li></ul>
                      </div>
                      <div className="scr">
                        <div className="scr-bar"><em /><u>salut — campaign view</u></div>
                        <div className="scr-in">
                          <div className="scr-hd"><span>Campaign ROAS</span><u>30 days</u></div>
                          <div className="bars">
                            <i style={cv({ '--h': '38%', '--i': 0 })} /><i style={cv({ '--h': '62%', '--i': 1 })} /><i style={cv({ '--h': '47%', '--i': 2 })} />
                            <i style={cv({ '--h': '81%', '--i': 3 })} /><i style={cv({ '--h': '56%', '--i': 4 })} /><i style={cv({ '--h': '97%', '--i': 5 })} />
                            <i style={cv({ '--h': '70%', '--i': 6 })} /><i style={cv({ '--h': '44%', '--i': 7 })} /><i style={cv({ '--h': '88%', '--i': 8 })} />
                          </div>
                          <div className="rows"><em className="hi">Search — branded <b>4.8x</b></em><em>Display — prospecting <b>0.9x</b></em></div>
                        </div>
                      </div>
                    </div>
                    <div className="dk-f"><span>Salut</span><em aria-hidden="true">↗</em></div>
                  </a>

                  <a className="dk" href="https://pook.ae" target="_blank" rel="noopener">
                    <div className="dk-t"><span className="dk-n">05</span><span className="st">In build</span><span className="dk-kind">Booking</span></div>
                    <h3>Pook</h3>
                    <div className="dk-b">
                      <div>
                        <p>Book a court, or find a match at your level. <b>pook.club</b> runs booking, payments and membership for the clubs behind it.</p>
                        <ul className="tags"><li>Venue booking</li><li>Player matching</li><li>Stripe</li></ul>
                      </div>
                      <div className="scr">
                        <div className="scr-bar"><em /><u>pook.ae · pook.club</u></div>
                        <div className="scr-in">
                          <div className="scr-hd"><span>Court 2 · today</span><u>4 slots left</u></div>
                          <div className="slots"><i className="on" /><i /><i className="on" /><i /><i /><i className="on" /><i /><i className="on" /></div>
                          <div className="rows"><em className="hi">Match found — 19:00 <b>Level 4.5</b></em><em>Padel · Al Quoz — 2 needed</em></div>
                        </div>
                      </div>
                    </div>
                    <div className="dk-f"><span>pook.ae</span><em aria-hidden="true">↗</em></div>
                  </a>

                  <a className="dk" href="https://ayvan.app" target="_blank" rel="noopener">
                    <div className="dk-t"><span className="dk-n">06</span><span className="st">In build</span><span className="dk-kind">CRM</span></div>
                    <h3>Ayvan</h3>
                    <div className="dk-b">
                      <div>
                        <p>A CRM for UAE SMBs with <b>automation woven in</b> — leads, follow-ups and invoices move on their own.</p>
                        <ul className="tags"><li>Pipeline</li><li>n8n</li><li>Auto follow-ups</li></ul>
                      </div>
                      <div className="scr">
                        <div className="scr-bar"><em /><u>ayvan.app/pipeline</u></div>
                        <div className="scr-in">
                          <div className="scr-hd"><span>Pipeline</span><u>6 flows running</u></div>
                          <div className="kan">
                            <div><span>New</span><i /><i /><i /></div>
                            <div><span>Quoted</span><i /><i /></div>
                            <div><span>Won</span><i /></div>
                          </div>
                          <div className="rows"><em className="hi">n8n — follow-up sent <b>T+2d</b></em><em>Weekly digest emailed</em></div>
                        </div>
                      </div>
                    </div>
                    <div className="dk-f"><span>ayvan.app</span><em aria-hidden="true">↗</em></div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SHOT 01 ================= */}
        <div className="shot" data-parallax="">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/germination/shot1.png" alt="A single operator working at night in front of three dashboards" />
          <div className="shot-txt"><div>
            <h3 data-rise="">The person you brief is the person who does&nbsp;it.</h3>
            <p data-rise="" style={cv({ '--i': 1 })}>One operator holds the crawl report, the tag container and the DNS zone — where organic growth usually breaks.</p>
          </div></div>
        </div>

        {/* ================= WORK ================= */}
        <section className="sec" id="work">
          <div className="wrap">
            <div className="sec-top" data-rise="">
              <h2>What we<br />actually do.</h2>
              <div>
                <p className="lead">Six disciplines. Most jobs need more than one.</p>
                <p className="num" style={{ marginTop: '1.2rem' }}>02 / CAPABILITIES</p>
              </div>
            </div>

            <div className="disc">
              <section className="dc" data-rise="">
                <span className="dc-n" aria-hidden="true">01</span>
                <h3>SEO &amp;<br />site audits</h3>
                <ul>
                  <li>Technical crawl, indexation, architecture</li>
                  <li>Core Web Vitals, prioritised to fix</li>
                  <li>Keyword and intent research, EN + AR</li>
                  <li>On-page metadata, schema, URLs</li>
                  <li>Backlinks and competitor SERP benchmarks</li>
                  <li>Rank tracking and periodic reporting</li>
                </ul>
              </section>
              <section className="dc" data-rise="" style={cv({ '--i': 1 })}>
                <span className="dc-n" aria-hidden="true">02</span>
                <h3>AI answer<br />visibility</h3>
                <ul>
                  <li>GEO work for citation inside answer engines</li>
                  <li>Entity and structured data</li>
                  <li>Content structure for topical authority</li>
                  <li>AI Overviews, ChatGPT and Perplexity monitoring</li>
                  <li>Where you are cited — and where they are</li>
                </ul>
              </section>
              <section className="dc" data-rise="" style={cv({ '--i': 2 })}>
                <span className="dc-n" aria-hidden="true">03</span>
                <h3>UI/UX<br />&amp; design</h3>
                <ul>
                  <li>Interface design for web and product, EN + AR</li>
                  <li>Wireframes and prototypes before the build</li>
                  <li>Design systems and reusable components</li>
                  <li>Landing pages built to convert</li>
                  <li>Front-end build in Next.js and React</li>
                  <li>Accessibility and mobile-first review</li>
                </ul>
              </section>
              <section className="dc" data-rise="" style={cv({ '--i': 3 })}>
                <span className="dc-n" aria-hidden="true">04</span>
                <h3>Apps, sites<br />&amp; platforms</h3>
                <ul>
                  <li>Marketing sites and web apps, shipped end to end</li>
                  <li>Platforms: booking, marketplace, SaaS, dashboards</li>
                  <li>Next.js, React, FastAPI, Supabase, PostgreSQL</li>
                  <li>Payments and messaging — Stripe, WhatsApp API</li>
                  <li>Every product above was built by us, in-house</li>
                  <li>Hosting, deploys and maintenance after launch</li>
                </ul>
              </section>
              <section className="dc" data-rise="" style={cv({ '--i': 4 })}>
                <span className="dc-n" aria-hidden="true">05</span>
                <h3>Analytics<br />&amp; tracking</h3>
                <ul>
                  <li>GA4 and Tag Manager, built and maintained</li>
                  <li>Tracking that survives releases</li>
                  <li>Data classification and analysis</li>
                  <li>Dashboards built for decisions</li>
                </ul>
              </section>
              <section className="dc" data-rise="" style={cv({ '--i': 5 })}>
                <span className="dc-n" aria-hidden="true">06</span>
                <h3>Infra&shy;structure</h3>
                <ul>
                  <li>DNS setup and troubleshooting</li>
                  <li>Email deliverability — SPF, DKIM, DMARC</li>
                  <li>Uptime alerting and incident response</li>
                  <li>Workflow automation with n8n</li>
                </ul>
              </section>
            </div>
          </div>
        </section>

        {/* ================= HOW ================= */}
        <section className="sec" id="how" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-top" data-rise="">
              <h2>How an engagement runs.</h2>
              <div>
                <p className="lead">Five stages. You see the audit before committing to anything past it.</p>
                <p className="num" style={{ marginTop: '1.2rem' }}>03 / PROCESS</p>
              </div>
            </div>
            <div className="steps" id="gsteps">
              <div className="step" style={cv({ '--i': 0 })}><b>STAGE 01</b><h4>Site audit</h4><p>Crawl, indexation, vitals — read back in plain language.</p></div>
              <div className="step" style={cv({ '--i': 1 })}><b>STAGE 02</b><h4>Intent map</h4><p>Keywords and content gaps, EN and AR, ranked.</p></div>
              <div className="step" style={cv({ '--i': 2 })}><b>STAGE 03</b><h4>On-page &amp; schema</h4><p>Metadata, headings, structured data, URLs.</p></div>
              <div className="step" style={cv({ '--i': 3 })}><b>STAGE 04</b><h4>AI visibility</h4><p>GEO work, citation monitoring, reporting on what moved.</p></div>
              <div className="step" style={cv({ '--i': 4 })}><b>STAGE 05</b><h4>Infrastructure</h4><p>DNS, mail auth, tracking, uptime — someone on call.</p></div>
            </div>
          </div>
        </section>

        {/* ================= LICENCE (bone) ================= */}
        <section className="sec bone" id="licence">
          <div className="wrap">
            <div className="sec-top" data-rise="">
              <h2>Licensed in Dubai. On the record.</h2>
              <div>
                <p className="lead"><b>Fertile Seed IT Solutions Est., trading as SEED IT.</b> Every service on this page sits inside the licence.</p>
                <p className="num" style={{ marginTop: '1.2rem' }}>04 / CREDENTIALS</p>
              </div>
            </div>
            <div className="lic">
              <div data-rise="">
                <div className="lic-no"><b>{LICENCE}</b><span>Trade licence<br />Dubai DET</span></div>
                <p className="eyebrow" style={{ marginBottom: '1.1rem' }}>Active licensed activities</p>
                <ul className="acts">
                  <li>Information Technology Network Services</li>
                  <li>IT Infrastructure</li>
                  <li>Data Classification &amp; Analysis Services</li>
                  <li>Computer Systems &amp; Communication Equipment Software Design</li>
                  <li>Social Media Applications Development &amp; Management</li>
                  <li>Marketing Services Via Social Media</li>
                  <li>Web Design</li>
                  <li>Portal (online dealing portal)</li>
                  <li>Data Entry Services</li>
                </ul>
              </div>
              <div className="card-ink" data-rise="" style={cv({ '--i': 1 })}>
                <dl>
                  <dt>Registered office</dt><dd>Office 220, Hor Al Anz East<br />Dubai, United Arab Emirates</dd>
                  <dt>Owner &amp; operator</dt><dd><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></dd>
                  <dt>Phone &amp; WhatsApp</dt><dd><a href={`tel:${PHONE.replace(/\s/g, '')}`}>{PHONE}</a></dd>
                  <dt>Languages</dt><dd>English · العربية</dd>
                  <dt>Response time</dt><dd>One working day, GST</dd>
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SHOT 02 ================= */}
        <div className="shot" data-parallax="">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/germination/shot2.png" alt="Macro photograph of a seed germinating in dark soil" loading="lazy" />
          <div className="shot-txt"><div>
            <h3 data-rise="">Organic compounds — or it doesn&apos;t.</h3>
            <p data-rise="" style={cv({ '--i': 1 })}>Nobody can promise a ranking or an AI citation. We commit to the work and the reporting, in writing.</p>
          </div></div>
        </div>

        {/* ================= CLAUSES ================= */}
        <section className="sec" id="terms">
          <div className="wrap">
            <div className="sec-top" data-rise="">
              <h2>Terms, before you ask.</h2>
              <div>
                <p className="lead">The parts of the contract worth knowing before a first call.</p>
                <p className="num" style={{ marginTop: '1.2rem' }}>05 / HOW WE WORK</p>
              </div>
            </div>
            <div className="cls" data-rise="">
              <div className="cl"><b>CLAUSE 01</b><h3>You own everything</h3><p>Accounts, properties, domains and data stay yours. Admin access handed back on exit.</p></div>
              <div className="cl"><b>CLAUSE 02</b><h3>Media is never in the fee</h3><p>Platform budgets are funded by you, or reimbursed at cost. No markup in a retainer line.</p></div>
              <div className="cl"><b>CLAUSE 03</b><h3>No guaranteed rankings</h3><p>We commit to the work, the reasoning and the reporting — in writing, not in a pitch.</p></div>
              <div className="cl"><b>CLAUSE 04</b><h3>Scope is written down</h3><p>Anything outside the agreement is agreed in writing first.</p></div>
              <div className="cl"><b>CLAUSE 05</b><h3>Advisory where you&apos;re strong</h3><p>If you have writers and designers, we brief and review. If not, we build it.</p></div>
              <div className="cl"><b>CLAUSE 06</b><h3>Monthly, and cancellable</h3><p>Month to month against a written scope, with notice either side.</p></div>
            </div>
          </div>
        </section>

        {/* ================= CONTACT ================= */}
        <section className="end" id="contact">
          <div className="wrap">
            <p className="eyebrow" data-rise="">06 / Next step</p>
            <h2 data-rise="" style={cv({ '--i': 1 })}>Send the domain. We&apos;ll tell you <em>what&apos;s wrong with it</em>.</h2>
            <a className="mailto" id="gmailto" href={`mailto:${CONTACT_EMAIL}?subject=Site%20review%20request`} data-rise="" style={cv({ '--i': 2 })}>
              {CONTACT_EMAIL}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M6 18 18 6M18 6H9M18 6v9" /></svg>
            </a>
            <dl className="end-row" data-rise="" style={cv({ '--i': 3 })}>
              <div><dt>WhatsApp</dt><dd><a href={WHATSAPP} target="_blank" rel="noopener">{PHONE}</a></dd></div>
              <div><dt>Office</dt><dd>{OFFICE}</dd></div>
              <div><dt>Licence</dt><dd>DET No. {LICENCE}</dd></div>
              <div><dt>Reply</dt><dd>One working day, GST</dd></div>
            </dl>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <p>Fertile Seed IT Solutions Est. — trading as SEED IT. Licensed in Dubai by the Department of Economy and Tourism, No. {LICENCE}.</p>
          <nav aria-label="Footer">
            <a href="#built">Built</a>
            <a href="#work">What we do</a>
            <a href="#how">How</a>
            <a href="#licence">Licence</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </footer>

      <Script src="/landing/germination/app.js" strategy="afterInteractive" />
    </div>
  );
}
