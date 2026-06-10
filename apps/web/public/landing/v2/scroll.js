// Smooth scroll + scroll-driven RAF
// Uses Lenis if available, otherwise falls back to native scroll.
// On each frame, updates:
//  - CSS vars --hero-scale / --hero-opacity / --hero-blur / --footer-opacity
//  - WebGL fade / depth via window.__webglFade / window.__webglDepth
//  - all motion elements via __updateMotion
//  - giant footer reveal via IntersectionObserver (separate)

(function(){
  let scrollY = 0;

  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });
    lenis.on('scroll', ({ scroll }) => { scrollY = scroll; });
  }

  const root = document.documentElement;

  const giant = document.getElementById('giant');

  // Smooth "skip the laptop intro" jump used by the top "click here" pill.
  window.__scrollToHero = function(){
    const vh = window.innerHeight;
    const introEnd = (window.__introHeight ? window.__introHeight() : 4 * vh);
    // land a little inside the hero region so it reads as fully arrived
    const target = introEnd + 4;
    if (lenis) {
      try { lenis.start(); } catch(e){}
      lenis.scrollTo(target, { duration: 1.6, force: true,
        easing: (t)=>1-Math.pow(1-t,3) });
    } else {
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
  };

  // ── Mandatory hero stop ───────────────────────────────────────────────
  // When the user first crosses out of the intro into the hero region we
  // hard-lock the scroll for HERO_LOCK_MS so they can't accidentally fly
  // past "SEED IT". A small countdown ring under the CTA shows them why
  // the page paused.
  const HERO_LOCK_MS = 1800;
  let heroLockReleased = false;
  let heroLockEnd = 0;

  const lockBadge = document.createElement('div');
  lockBadge.className = 'hero-lock-badge';
  lockBadge.innerHTML = `
    <svg viewBox="0 0 36 36" aria-hidden="true">
      <circle class="track" cx="18" cy="18" r="16"></circle>
      <circle class="prog"  cx="18" cy="18" r="16"></circle>
    </svg>
    <span>Hold on — meet SEED IT</span>`;
  document.body.appendChild(lockBadge);
  const progCircle = lockBadge.querySelector('.prog');
  const PROG_LEN = 2 * Math.PI * 16;
  progCircle.style.strokeDasharray = String(PROG_LEN);
  progCircle.style.strokeDashoffset = String(PROG_LEN);

  function lockHeroAt(introEnd){
    heroLockEnd = performance.now() + HERO_LOCK_MS;
    document.body.classList.add('hero-locked');
    if (lenis) {
      try { lenis.scrollTo(introEnd, { immediate: true, force: true, lock: true }); } catch(e){}
      lenis.stop();
    } else {
      window.scrollTo(0, introEnd);
    }
    // soak up wheel/touch attempts during the lock window
    const block = (e) => { if (performance.now() < heroLockEnd) e.preventDefault(); };
    window.addEventListener('wheel', block, { passive: false });
    window.addEventListener('touchmove', block, { passive: false });

    setTimeout(() => {
      heroLockReleased = true;
      document.body.classList.remove('hero-locked');
      if (lenis) lenis.start();
      window.removeEventListener('wheel', block);
      window.removeEventListener('touchmove', block);
    }, HERO_LOCK_MS);
  }

  function frame(time){
    if (lenis) lenis.raf(time);
    else scrollY = window.scrollY;

    const vh = window.innerHeight;

    // Skip the intro scroll budget — the laptop intro owns the first stretch
    // (matches INTRO_VH in v2/intro.js).
    const introEnd = (window.__introHeight ? window.__introHeight() : 4 * vh);
    const sy = Math.max(0, scrollY - introEnd);

    // Trigger the mandatory hero stop the first time the user enters the
    // hero region.
    if (!heroLockReleased && heroLockEnd === 0 && sy > 5) {
      lockHeroAt(introEnd);
    }
    // While locked, animate the countdown ring + clamp scroll back if a
    // delta sneaks through.
    if (heroLockEnd > 0 && !heroLockReleased) {
      const left = Math.max(0, heroLockEnd - performance.now());
      const t = 1 - left / HERO_LOCK_MS;
      progCircle.style.strokeDashoffset = String(PROG_LEN * (1 - t));
      if (scrollY > introEnd + 2) {
        if (lenis) {
          try { lenis.scrollTo(introEnd, { immediate: true, force: true, lock: true }); } catch(e){}
        } else {
          window.scrollTo(0, introEnd);
        }
      }
    }

    // 1) HERO scale/opacity/blur — hold the hero fully visible for ~1.6vh
    // after the intro so the user doesn't blow past "SEED IT" with a fast
    // wheel flick, then fade out over the next ~0.9vh.
    const HERO_HOLD = vh * 1.6;
    const HERO_FADE = vh * 0.9;
    const sAfterHold = Math.max(0, sy - HERO_HOLD);
    const hp = Math.min(sAfterHold / HERO_FADE, 1);
    root.style.setProperty('--hero-scale', String(1 - hp * 0.15));
    root.style.setProperty('--hero-opacity', String(1 - hp));
    root.style.setProperty('--hero-blur', (hp * 20).toFixed(2) + 'px');
    root.style.setProperty('--footer-opacity', String(Math.max(0, 1 - hp * 2)));

    // disable pointer events on hero when invisible
    const hero = document.getElementById('hero-content');
    if (hero) hero.style.pointerEvents = hp >= 0.95 ? 'none' : '';

    // 2) WebGL fade — same curve, but also a depth push as you scroll
    window.__webglFade = 1 - hp * 0.7;
    window.__webglDepth = hp;

    // 3) Motion elements
    if (window.__updateMotion) window.__updateMotion(scrollY, vh);

    // 4) Giant footer text — reveal when top enters the viewport
    if (giant && !giant.classList.contains('in')) {
      const r = giant.getBoundingClientRect();
      if (r.top < vh * 0.85) giant.classList.add('in');
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
