// Scroll-scrubbed laptop intro.
// First 400vh of body scroll = intro. During this window we:
//   - drive video.currentTime from scroll progress
//   - keep body.intro-active so the existing fixed layers stay hidden
// After the window, intro fades out and the regular page takes over.

(function () {
  const stage = document.getElementById('intro-stage');
  const video = document.getElementById('intro-video');
  if (!stage || !video) return;

  // Skip the scroll-scrubbed laptop intro under reduced motion OR on small
  // screens — downloading the whole clip into memory and decoding frames on
  // scroll is a heavy mobile cost. CSS hides the stage + enter pill and
  // collapses the .intro-spacer, so the page opens straight on the hero with
  // no scroll budget reserved for the video.
  const mq = (q) => window.matchMedia && window.matchMedia(q).matches;
  const staticMode = mq('(prefers-reduced-motion: reduce)') || mq('(max-width: 760px)');
  if (staticMode) {
    stage.style.display = 'none';
    window.__introHeight = () => 0;
    const skip = document.getElementById('enter-pill');
    if (skip) skip.style.display = 'none';
    return;
  }

  const INTRO_VH = 400;            // matches .intro-spacer height: 400vh
  const FADE_TAIL = 0.94;          // after this fraction we begin fading out

  let duration = 0;
  let ready = false;
  let target = 0;
  let current = 0;
  let raf = null;
  let done = false;

  document.body.classList.add('intro-active');

  // Top-center "click here to enter" pill: jumps straight to the SEED IT hero.
  const pill = document.getElementById('enter-pill');
  if (pill) {
    pill.addEventListener('click', () => {
      if (window.__scrollToHero) window.__scrollToHero();
      pill.classList.add('hidden');
    });
  }

  // Fetch the video as a Blob and use an object URL — the file server we're
  // hosted on doesn't support byte-range requests properly, so the raw <source>
  // ends up non-seekable (seekable.end === 0). Loading into memory makes
  // seeking work the same way the original data-URL version did.
  (function loadAsBlob(){
    const src = video.querySelector('source')?.getAttribute('src');
    if (!src) return;
    fetch(src).then(r => r.blob()).then(b => {
      const url = URL.createObjectURL(b);
      video.querySelectorAll('source').forEach(s => s.remove());
      video.removeAttribute('src');
      video.src = url;
      video.load();
    }).catch(() => { /* fall back to whatever <source> already had */ });
  })();

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  function introHeightPx() {
    return (INTRO_VH / 100) * window.innerHeight;
  }

  function progress() {
    const end = introHeightPx();
    if (end <= 0) return 0;
    return clamp(window.scrollY / end, 0, 1);
  }

  function tick() {
    raf = null;
    if (!ready) return;
    current += (target - current) * 0.22;
    if (Math.abs(target - current) < 0.002) current = target;
    try { video.currentTime = current; } catch (e) {}
    if (Math.abs(target - current) > 0.002) raf = requestAnimationFrame(tick);
  }

  function update() {
    const p = progress();

    // map progress to video time (leave a safety nub at the very end so the
    // last keyframe is still decoded cleanly)
    if (ready) {
      target = p * Math.max(duration - 0.04, 0);
      if (!raf) raf = requestAnimationFrame(tick);
    }

    // fade tail — start dropping intro opacity in the final stretch so the
    // page underneath blends in cleanly
    if (p > FADE_TAIL) {
      const t = (p - FADE_TAIL) / (1 - FADE_TAIL);
      stage.style.opacity = String(1 - t);
    } else {
      stage.style.opacity = '1';
    }

    // hide the "click here" pill once we're most of the way through the intro
    if (pill) {
      if (p > 0.6) pill.classList.add('hidden');
      else pill.classList.remove('hidden');
    }

    // when fully past the intro, finish: stop holding the page back
    if (p >= 1 && !done) {
      done = true;
      stage.classList.add('done');
      document.body.classList.remove('intro-active');
    } else if (p < 1 && done) {
      done = false;
      stage.classList.remove('done');
      document.body.classList.add('intro-active');
    }
  }

  function init() {
    duration = video.duration || 0;
    if (!isFinite(duration) || duration <= 0) return;
    ready = true;
    try { video.pause(); video.currentTime = 0; } catch (e) {}
    update();
  }

  video.addEventListener('loadedmetadata', init, { once: true });
  video.addEventListener('canplay', () => { if (!ready) init(); }, { once: true });

  // Update on every scroll tick. We piggy-back on the main RAF so Lenis-driven
  // scrolls also get smooth video scrubbing.
  function loop() {
    update();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  window.addEventListener('resize', update, { passive: true });
  window.addEventListener('pageshow', update);

  // make intro height available to other scripts so they can offset their
  // own scroll-driven effects
  window.__introHeight = introHeightPx;

  video.load();
})();
