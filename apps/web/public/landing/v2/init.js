// Final init — refresh motion list after dynamic content (cases, exp) inserted
(function(){
  // cases.js & exp.js have already injected DOM by the time we load.
  // Trigger motion split + refresh on any newly-injected [data-motion-text].
  document.querySelectorAll('[data-motion-text]').forEach(el => {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    // re-split: handled inline by re-running the walker
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) {
      if (n.nodeValue && n.nodeValue.trim() && !n.parentElement.classList.contains('motion-word')) {
        nodes.push(n);
      }
    }
    nodes.forEach(textNode => {
      const parts = textNode.nodeValue.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach(p => {
        if (!p) return;
        if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(p));
        else {
          const span = document.createElement('span');
          span.className = 'motion-word';
          span.textContent = p;
          frag.appendChild(span);
        }
      });
      textNode.parentNode.replaceChild(frag, textNode);
    });
  });

  if (window.__refreshMotion) window.__refreshMotion();
})();
