import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import AcidMark from '@/components/site/AcidMark';
import SiteFooter from '@/components/site/SiteFooter';
import { CONTACT_EMAIL, PHONE, WHATSAPP, LICENCE } from '@/lib/brand';
import './germination.css';

export const metadata: Metadata = {
  // absolute: opt out of the root layout's `%s · SEED IT` template — the
  // homepage title already leads with the brand.
  title: { absolute: 'SEED IT — Search, AI visibility & infrastructure, out of Dubai' },
  description:
    'SEED IT is a Dubai-licensed technical partner for organic growth: SEO and site audits, AI answer-engine visibility, analytics, and the DNS, email and uptime infrastructure underneath. English and Arabic. DET Trade Licence 1112101.',
  alternates: { canonical: '/' },
};

// Custom CSS properties (--i, --h, ...) aren't in React's CSSProperties type.
const cv = (o: Record<string, string | number>) => o as CSSProperties;

const TECH = [
  'Next.js', 'React', 'TypeScript', 'FastAPI', 'Python', 'Supabase', 'PostgreSQL',
  'n8n', 'Stripe', 'WhatsApp Cloud API', 'GA4', 'Tag Manager', 'Cloudflare',
  'Vercel', 'Schema.org', 'SPF / DKIM / DMARC',
];

export default function HomePage() {
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
            <a href="/blog">Blog</a>
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

                  <a className="dk" href="https://conseal.ae" target="_blank" rel="noopener">
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
                    <div className="dk-f"><span>conseal.ae</span><em aria-hidden="true">↗</em></div>
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
              <div><dt>Licence</dt><dd>DET No. {LICENCE}</dd></div>
              <div><dt>Reply</dt><dd>One working day, GST</dd></div>
            </dl>
          </div>
        </section>
      </main>

      <SiteFooter />

      <Script src="/landing/germination/app.js" strategy="afterInteractive" />
    </div>
  );
}
