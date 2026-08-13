import SiteNav from '@/components/site/SiteNav';
import SiteFooter from '@/components/site/SiteFooter';
import './germination.css';

export default function NotFound() {
  return (
    <div className="germination">
      <SiteNav />

      <main id="gmain" className="page">
        <div className="wrap nf">
          <p className="eyebrow">404 — Not found</p>
          <h1>Nothing grows <em>here</em>.</h1>
          <p>
            The page you&apos;re after doesn&apos;t exist — or it moved when the site did.
            The home page has everything that&apos;s live.
          </p>
          <div className="nf-acts">
            <a className="cta" href="/"><span>Back to home</span><span className="arw" aria-hidden="true">↗</span></a>
            <a className="cta cta-ghost" href="/blog"><span>Read the blog</span></a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
