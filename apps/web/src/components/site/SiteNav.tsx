import AcidMark from '@/components/site/AcidMark';
import { LICENCE } from '@/lib/brand';

/*
  Germination chrome for every page except the home page (which keeps its own
  inline header: transparent start, scroll-spy hash links driven by app.js).
  Subpages get the always-solid variant and route links back to the home
  sections. React hoists the <link> tags into <head>, and the browser dedupes
  the font stylesheet against the home page's identical URL.
*/
const FONTS =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap';

export default function SiteNav({ active }: { active?: 'blog' }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONTS} />

      <a className="skip" href="#gmain">Skip to content</a>

      <header className="nav solid">
        <div className="wrap">
          <a className="logo" href="/">
            <AcidMark />
            <b>SEED IT</b>
            <span className="lic">Dubai · DET {LICENCE}</span>
          </a>
          <nav className="nav-links" aria-label="Site">
            <a href="/#built">Built</a>
            <a href="/#work">What we do</a>
            <a href="/#how">How</a>
            <a href="/blog" className={active === 'blog' ? 'on' : undefined} aria-current={active === 'blog' ? 'page' : undefined}>
              Blog
            </a>
          </nav>
          <a className="cta" href="/#contact"><span>Book a call</span><span className="arw" aria-hidden="true">↗</span></a>
        </div>
      </header>
    </>
  );
}
