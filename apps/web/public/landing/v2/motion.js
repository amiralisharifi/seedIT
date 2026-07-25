// Motion system
// - Splits [data-motion-text] into <span class="motion-word"> per word, preserving inline children
// - Collects all .motion-word / .motion-piece / .motion-inline-piece elements
// - Provides updateMotion(scrollY, vh) — called from the scroll RAF
// - Maps each element's viewport position to opacity/blur/translateY
//   from base state (0.16, 10px, 28px) → revealed (1, 0, 0).

(function(){
  // 1. split text-walk
  function splitWords(root){
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) {
      if (n.nodeValue && n.nodeValue.trim()) nodes.push(n);
    }
    nodes.forEach(textNode => {
      const parent = textNode.parentNode;
      const txt = textNode.nodeValue;
      // preserve leading/trailing whitespace
      const parts = txt.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach(p => {
        if (!p) return;
        if (/^\s+$/.test(p)) {
          frag.appendChild(document.createTextNode(p));
        } else {
          const span = document.createElement('span');
          span.className = 'motion-word';
          span.textContent = p;
          frag.appendChild(span);
        }
      });
      parent.replaceChild(frag, textNode);
    });
  }

  document.querySelectorAll('[data-motion-text]').forEach(splitWords);

  // 2. collect all motion elements
  const collect = () => Array.from(document.querySelectorAll('.motion-word, .motion-piece, .motion-inline-piece'));
  let elements = collect();

  // index assignment for stagger within a parent
  const parentIndex = new WeakMap();
  elements.forEach(el => {
    const p = el.parentElement;
    let i = parentIndex.get(p) || 0;
    el.dataset.mi = String(i);
    parentIndex.set(p, i + 1);
  });

  window.__refreshMotion = () => {
    elements = collect();
    parentIndex.clear?.();
    const map = new Map();
    elements.forEach(el => {
      const p = el.parentElement;
      let i = map.get(p) || 0;
      el.dataset.mi = String(i);
      map.set(p, i + 1);
    });
  };

  const clamp01 = x => Math.max(0, Math.min(1, x));

  // Shared trigger line (fraction of viewport height, from the top). The scrub
  // completes as an element's top crosses REVEAL_LINE — ~58% down — so the
  // reveal lands where the eye rests, not up near the top. Authoritative value
  // lives in reveal-config.js; fall back if it hasn't loaded yet.
  const CFG = window.__REVEAL || { line: 0.58, lead: 0.32 };
  const REVEAL_LINE = CFG.line;
  const REVEAL_LEAD = CFG.lead;

  function revealAll(){
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      el.style.opacity = '1';
      el.style.filter = 'none';
      el.style.transform = 'none';
    }
  }

  // Static mode = reduced motion OR small screens: show everything in its
  // final state and never scrub. (CSS provides the same static state, so
  // content is legible even before this runs — see the matching media blocks
  // in landing.css.) On phones this skips the per-frame reveal work entirely.
  const mq = (q) => window.matchMedia && window.matchMedia(q).matches;
  const staticMode = mq('(prefers-reduced-motion: reduce)') || mq('(max-width: 760px)');
  if (staticMode) {
    revealAll();
    window.__updateMotion = () => {};
    window.__refreshMotion = () => { elements = collect(); revealAll(); };
    return;
  }

  // Reused across frames so the read pass doesn't allocate each RAF.
  let tops = [];

  window.__updateMotion = (scrollY, vh) => {
    // begin the scrub REVEAL_LEAD below the line; complete it as the top
    // crosses the line.
    const trigger = vh * (REVEAL_LINE + REVEAL_LEAD);
    const range = vh * REVEAL_LEAD;
    const n = elements.length;

    // READ pass — measure every element first, so we never interleave layout
    // reads with style writes (that forced a reflow on every iteration).
    for (let i = 0; i < n; i++) tops[i] = elements[i].getBoundingClientRect().top;

    // WRITE pass — apply the computed reveal state.
    for (let i = 0; i < n; i++) {
      const el = elements[i];
      let p = (trigger - tops[i]) / range;
      // stagger by index-in-parent (each word starts a touch later)
      const mi = Number(el.dataset.mi || 0);
      p -= mi * 0.04;
      p = clamp01(p);
      // ease out
      const e = 1 - Math.pow(1 - p, 3);

      el.style.opacity = String(0.16 + e * 0.84);
      el.style.filter = `blur(${(1 - e) * 10}px)`;
      el.style.transform = `translateY(${(1 - e) * 28}px)`;
    }
  };

  // initial paint at scroll 0
  window.__updateMotion(window.scrollY, window.innerHeight);
})();
