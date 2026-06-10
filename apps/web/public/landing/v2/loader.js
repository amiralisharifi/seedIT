// Pixel-dissolve loader
(function(){
  const loader = document.getElementById('loader');
  const center = document.getElementById('loader-center');
  const bar = document.getElementById('loader-bar');
  if (!loader) return;

  // build 18x18 grid
  const N = 18 * 18;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < N; i++) {
    const b = document.createElement('div');
    b.className = 'blk';
    frag.appendChild(b);
  }
  loader.appendChild(frag);

  // animate bar
  setTimeout(() => { if (bar) bar.style.width = '100%'; }, 80);

  window.__startDissolve = () => {
    const blocks = loader.querySelectorAll('.blk');
    blocks.forEach(b => {
      b.style.transitionDelay = (Math.random() * 800) + 'ms';
      b.style.opacity = '0';
    });
    if (center) {
      center.style.opacity = '0';
      center.style.filter = 'blur(12px)';
    }
    setTimeout(() => {
      loader.style.display = 'none';
      document.body.classList.add('loaded');
    }, 1400);
  };

  // start when window is fully loaded (or after fallback)
  let started = false;
  const start = () => {
    if (started) return; started = true;
    setTimeout(window.__startDissolve, 600);
  };
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
  // fallback in case load never fires
  setTimeout(start, 2400);
})();
