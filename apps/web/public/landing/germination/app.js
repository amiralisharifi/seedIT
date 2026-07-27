/* SEED IT — "Germination" landing interactions.
   Plain IIFE, mounted after hydration. Mutates DOM by class/attr only, so it
   is safe to run once React has rendered the static markup. Mirrors the
   behaviour baked into the original standalone artifact:
   .js gate, scroll progress, nav stuck, [data-rise] reveals, hero line
   reveal, answer-card typewriter with sequential citations, [data-count]
   counters, process-line draw, parallax photo bands. */
(function () {
  'use strict';

  var root = document.querySelector('.germination') || document.documentElement;
  root.classList.add('js');

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var prog = document.querySelector('.germination .prog');
  var nav = document.getElementById('gnav');
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? window.scrollY / h : 0;
    if (prog) prog.style.setProperty('--p', String(Math.min(1, Math.max(0, p))));
    if (nav) nav.classList.toggle('stuck', window.scrollY > 10);
    parallax();
  }

  function reveal(el) { el.classList.add('in'); }
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        reveal(e.target);
        io.unobserve(e.target);
        if (e.target.hasAttribute('data-count')) countUp(e.target);
        if (e.target.id === 'gsteps') e.target.style.setProperty('--draw', '1');
        if (e.target.classList.contains('ans')) typewriter();
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.15 });

    document.querySelectorAll('.germination [data-rise]').forEach(function (el) { io.observe(el); });
    var hook = document.getElementById('ghook');
    if (hook) io.observe(hook);
    var steps = document.getElementById('gsteps');
    if (steps) io.observe(steps);
    document.querySelectorAll('.germination [data-count]').forEach(function (el) { io.observe(el); });
    var ans = document.querySelector('.germination .ans');
    if (ans) io.observe(ans);
  } else {
    document.querySelectorAll('.germination [data-rise], .germination #ghook').forEach(reveal);
    var s = document.getElementById('gsteps');
    if (s) { s.classList.add('in'); s.style.setProperty('--draw', '1'); }
    typewriter();
  }

  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduce || target <= 0) { el.textContent = String(target); return; }
    var start = performance.now(), dur = 900;
    (function tick(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }

  var typed = false;
  function typewriter() {
    if (typed) return; typed = true;
    var body = document.getElementById('gAnsBody');
    if (!body) return;
    var caret = body.querySelector('.caret');
    var units = [];
    Array.prototype.forEach.call(body.childNodes, function (node) {
      if (node === caret) return;
      if (node.nodeType === 3) {
        for (var i = 0; i < node.textContent.length; i++) units.push({ t: 'c', ch: node.textContent[i], b: false });
      } else if (node.nodeName === 'B') {
        for (var j = 0; j < node.textContent.length; j++) units.push({ t: 'c', ch: node.textContent[j], b: true });
      } else if (node.classList && node.classList.contains('cite')) {
        units.push({ t: 'cite', html: node.outerHTML });
      } else if (node.textContent) {
        for (var k = 0; k < node.textContent.length; k++) units.push({ t: 'c', ch: node.textContent[k], b: false });
      }
    });

    if (reduce) { if (caret) caret.classList.add('off'); return; }

    var out = document.createElement('span');
    body.insertBefore(out, caret);
    Array.prototype.slice.call(body.childNodes).forEach(function (n) {
      if (n !== out && n !== caret) body.removeChild(n);
    });

    var idx = 0, html = '';
    function esc(c) { return c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c; }
    function step() {
      if (idx >= units.length) { if (caret) caret.classList.add('off'); return; }
      var u = units[idx++];
      if (u.t === 'c') {
        html += u.b ? '<b>' + esc(u.ch) + '</b>' : esc(u.ch);
        out.innerHTML = html;
        setTimeout(step, u.ch === ' ' ? 14 : 10 + Math.random() * 20);
      } else {
        html += u.html;
        out.innerHTML = html;
        var cites = out.querySelectorAll('.cite');
        var last = cites[cites.length - 1];
        requestAnimationFrame(function () { if (last) last.classList.add('in'); });
        setTimeout(step, 220);
      }
    }
    step();
  }

  var shots = Array.prototype.slice.call(document.querySelectorAll('.germination [data-parallax]'));
  function parallax() {
    if (reduce || !shots.length) return;
    var vh = window.innerHeight;
    shots.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var center = r.top + r.height / 2;
      var offset = (center - vh / 2) / vh;
      el.style.setProperty('--py', (offset * -48).toFixed(1) + 'px');
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
})();
