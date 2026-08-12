/* SEED IT — "Germination" landing interactions.

   Enhancement only: the page reads fine without this file. Mounted after
   hydration (next/script, afterInteractive) and mutates the DOM by class and
   attribute only, so it is safe to run once React has rendered the markup.

   Ports the behaviour of the standalone artifact: .js gate, [data-rise] and
   .ln reveals, answer-card typewriter with sequential citations, process-line
   draw, the scroll-dealt card deck, scroll progress + nav stuck + scroll-spy
   + photo parallax, and the magnetic contact link.

   One deliberate deviation from the artifact: element ids carry a `g` prefix
   (#gnav, #gsteps, #gAnsBody, #gmailto, #gdeckCt, #gdeckBar) so this route
   cannot collide with ids owned by the shared app layout.

   Note the .js gate goes on <html>, not on the .germination wrapper — the
   CSS uses `html:not(.js)` to decide the no-JS fallbacks. */
(function () {
  'use strict';

  var d = document, root = d.documentElement;
  root.classList.add('js');
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------- reveal ---------- */
  var risers = [].slice.call(d.querySelectorAll('[data-rise], .ln'));
  if (!('IntersectionObserver' in window) || calm) {
    risers.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    risers.forEach(function (el) { io.observe(el); });
  }

  /* ---------- answer-engine typing ----------
     Walks the server-rendered markup into a token stream, empties the host,
     then replays it. Citations pause the stream and pop in on their own. */
  (function () {
    var host = d.getElementById('gAnsBody');
    if (!host) return;
    var caret = host.querySelector('.caret');
    if (calm) {
      [].slice.call(host.querySelectorAll('.cite')).forEach(function (c) { c.classList.add('in'); });
      if (caret) caret.classList.add('off');
      return;
    }
    var toks = [];
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) { n.textContent.split('').forEach(function (c) { toks.push({ k: 'c', v: c }); }); }
        else if (n.classList && n.classList.contains('caret')) { /* re-appended below */ }
        else if (n.classList && n.classList.contains('cite')) { toks.push({ k: 'x', v: n }); }
        else { toks.push({ k: 'o', v: n }); walk(n); toks.push({ k: 'z' }); }
      });
    })(host);

    host.textContent = '';
    if (caret) host.appendChild(caret);
    var stack = [host], i = 0;
    function put(node) { stack[stack.length - 1].insertBefore(node, caret && stack.length === 1 ? caret : null); }
    function tick() {
      var budget = 2;
      while (budget-- > 0 && i < toks.length) {
        var t = toks[i++];
        if (t.k === 'c') { put(d.createTextNode(t.v)); }
        else if (t.k === 'o') { var el = t.v.cloneNode(false); put(el); stack.push(el); }
        else if (t.k === 'z') { if (stack.length > 1) stack.pop(); }
        else if (t.k === 'x') {
          var c = t.v.cloneNode(true); put(c);
          requestAnimationFrame(function () { c.classList.add('in'); });
          break;
        }
      }
      if (i < toks.length) { setTimeout(tick, toks[i] && toks[i].k === 'x' ? 260 : 22); }
      else if (caret) { setTimeout(function () { caret.classList.add('off'); }, 1600); }
    }
    setTimeout(tick, 780);
  })();

  /* ---------- process line draw ---------- */
  var steps = d.getElementById('gsteps');
  if (steps && 'IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        sio.unobserve(e.target);
        e.target.classList.add('in');
        e.target.style.setProperty('--draw', '1');
      });
    }, { threshold: 0.25 });
    sio.observe(steps);
  }

  /* ---------- built: cards dealt on scroll ----------
     Off the sticky breakpoint (and under reduced motion) flat() drops every
     card back to a plain stacked grid and clears the inline transforms. */
  (function () {
    var rail = d.querySelector('.deck-rail'), stage = d.querySelector('.deck-stage');
    if (!rail || !stage) return;
    var cards = [].slice.call(stage.querySelectorAll('.dk')), n = cards.length;
    if (!n) return;
    var ct = d.getElementById('gdeckCt'), bar = d.getElementById('gdeckBar'),
      mq = window.matchMedia('(min-width:901px) and (hover:hover)'),
      live = mq.matches && !calm, q = false;
    cards.forEach(function (c, i) { c.style.zIndex = i + 1; });
    function flat() {
      cards.forEach(function (c) {
        c.style.transform = ''; c.style.opacity = '';
        c.style.setProperty('--v', 0); c.classList.add('on');
      });
    }
    function paint() {
      q = false;
      if (!live) return;
      var span = rail.offsetHeight - window.innerHeight;
      if (span <= 0) return;
      var p = Math.min(1, Math.max(0, -rail.getBoundingClientRect().top / span)), x = p * (n - 1);
      cards.forEach(function (c, i) {
        var u = x - i, ty, sc, rz, op, v;
        if (u <= -1) { ty = 114; sc = 0.94; rz = 2.6; op = 0; v = 0; }
        else if (u < 0) { var e = u + 1; ty = (1 - e) * 114; sc = 0.94 + 0.06 * e; rz = 2.6 * (1 - e); op = e; v = 0; }
        else { var k = u < 3 ? u : 3; ty = -k * 3.4; sc = 1 - k * 0.045; rz = 0; op = 1; v = k * 0.24; if (v > 0.6) v = 0.6; }
        c.style.transform = 'translate3d(0,' + ty.toFixed(2) + '%,0) scale(' + sc.toFixed(3) + ') rotate(' + rz.toFixed(2) + 'deg)';
        c.style.opacity = op.toFixed(3);
        c.style.setProperty('--v', v.toFixed(3));
        c.classList.toggle('on', Math.round(x) === i);
      });
      if (bar) bar.style.setProperty('--p', p.toFixed(4));
      if (ct) ct.textContent = ('0' + (Math.round(x) + 1)).slice(-2);
    }
    function ping() { if (!q) { q = true; requestAnimationFrame(paint); } }
    function mode() { live = mq.matches && !calm; if (live) { ping(); } else { flat(); } }
    if (mq.addEventListener) { mq.addEventListener('change', mode); } else { mq.addListener(mode); }
    window.addEventListener('scroll', ping, { passive: true });
    window.addEventListener('resize', mode);
    mode();
  })();

  /* ---------- scroll: progress, nav, spy, parallax ---------- */
  var prog = d.querySelector('.prog'), nav = d.getElementById('gnav'),
    shots = [].slice.call(d.querySelectorAll('[data-parallax]')),
    /* hash links only: the spy maps each href to an on-page section, and
       route links like /blog would make querySelector throw. */
    links = [].slice.call(d.querySelectorAll('.nav-links a[href^="#"]')),
    secs = links.map(function (a) { return d.querySelector(a.getAttribute('href')); }),
    queued = false;

  function frame() {
    queued = false;
    var y = window.pageYOffset || root.scrollTop,
      h = (d.documentElement.scrollHeight - window.innerHeight) || 1,
      vh = window.innerHeight;
    if (prog) prog.style.setProperty('--p', Math.min(1, Math.max(0, y / h)).toFixed(4));
    if (nav) nav.classList.toggle('stuck', y > 40);
    if (!calm) {
      shots.forEach(function (s) {
        var r = s.getBoundingClientRect();
        if (r.bottom < -220 || r.top > vh + 220) return;
        var img = s.querySelector('img');
        if (img) img.style.setProperty('--py', (((r.top + r.height / 2) - vh / 2) * -0.09).toFixed(1) + 'px');
      });
    }
    var cur = -1;
    secs.forEach(function (s, n) { if (s && s.getBoundingClientRect().top <= 160) cur = n; });
    links.forEach(function (a, n) { a.classList.toggle('on', n === cur); });
  }
  function onScroll() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();

  /* ---------- magnetic contact link ---------- */
  var mail = d.getElementById('gmailto');
  if (mail && !calm && window.matchMedia('(hover:hover)').matches) {
    mail.addEventListener('mousemove', function (e) {
      var r = mail.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / r.width,
        dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      mail.style.transform = 'translate(' + (dx * 16).toFixed(1) + 'px,' + (dy * 9).toFixed(1) + 'px)';
    });
    mail.addEventListener('mouseleave', function () { mail.style.transform = ''; });
  }
})();
