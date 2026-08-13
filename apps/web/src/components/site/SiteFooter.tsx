import { LICENCE } from '@/lib/brand';

export default function SiteFooter() {
  return (
    <footer className="foot">
      <div className="wrap">
        <p>
          Fertile Seed IT Solutions Est. — trading as SEED IT. Licensed in Dubai by the
          Department of Economy and Tourism, No. {LICENCE}.
        </p>
        <nav aria-label="Footer">
          <a href="/#built">Built</a>
          <a href="/#work">What we do</a>
          <a href="/#how">How</a>
          <a href="/#licence">Licence</a>
          <a href="/blog">Blog</a>
          <a href="/#contact">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
