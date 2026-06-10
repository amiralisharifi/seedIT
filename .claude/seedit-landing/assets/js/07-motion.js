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

  window.__updateMotion = (scrollY, vh) => {
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const rect = el.getBoundingClientRect();
      const top = rect.top;
      // begin reveal when element enters the bottom 85% of the viewport
      const trigger = vh * 0.92;
      const range = vh * 0.55; // how much scroll to complete reveal
      let p = (trigger - top) / range;
      // stagger by index-in-parent (each word starts 5% later)
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
