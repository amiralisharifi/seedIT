// Subtle ambient background canvas (acts as the "bg video" layer)
// Slow, drifting noise field with faint green accents
(function(){
  const cv = document.getElementById('bg-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');

  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  function resize(){
    w = cv.clientWidth = window.innerWidth;
    h = cv.clientHeight = window.innerHeight;
    cv.width = w * dpr;
    cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // generate floating drift "smoke" using radial gradients
  const blobs = [];
  for (let i = 0; i < 12; i++) {
    blobs.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 180 + Math.random() * 260,
      vx: (Math.random() - .5) * .12,
      vy: (Math.random() - .5) * .12,
      hue: Math.random() < .25 ? 'green' : 'white',
      a: .015 + Math.random() * .03,
    });
  }

  let t = 0;
  function tick(){
    t += 1;
    ctx.fillStyle = '#070707';
    ctx.fillRect(0, 0, w, h);

    blobs.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < -b.r) b.x = w + b.r;
      if (b.x > w + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = h + b.r;
      if (b.y > h + b.r) b.y = -b.r;

      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      if (b.hue === 'green') {
        g.addColorStop(0, `rgba(124,252,0,${b.a * 2.4})`);
        g.addColorStop(1, 'rgba(124,252,0,0)');
      } else {
        g.addColorStop(0, `rgba(255,255,255,${b.a})`);
        g.addColorStop(1, 'rgba(255,255,255,0)');
      }
      ctx.fillStyle = g;
      ctx.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
    });

    requestAnimationFrame(tick);
  }
  tick();
})();
