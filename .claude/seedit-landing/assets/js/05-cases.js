// Selected projects with glitch-stack imagery (SVG data-URIs as bg)
(function(){
  const list = document.getElementById('case-list');
  if (!list) return;

  // SVG mockup factory — returns a data URI for a 800x550 mockup
  const svgURI = (svg) => 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);

  const growbot = svgURI(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 550" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="rg" cx="30%" cy="30%" r="60%">
      <stop offset="0" stop-color="#7CFC00" stop-opacity=".12"/>
      <stop offset="1" stop-color="#7CFC00" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="550" fill="#0a0a0a"/>
  <rect width="800" height="550" fill="url(#rg)"/>
  <g font-family="JetBrains Mono, monospace" fill="#cfcfcf">
    <rect x="60" y="80" width="220" height="36" rx="18" fill="none" stroke="rgba(255,255,255,.12)"/>
    <circle cx="80" cy="98" r="4" fill="#7CFC00"/>
    <text x="95" y="103" font-size="11" letter-spacing="2" fill="#bdbdbd">GROWBOT · ONBOARDING AI</text>

    <rect x="60" y="148" width="500" height="86" rx="14" fill="rgba(124,252,0,.06)" stroke="rgba(124,252,0,.25)"/>
    <text x="80" y="172" font-size="10" letter-spacing="2" fill="#7a7a7a">GROWBOT</text>
    <text x="80" y="195" font-size="14" fill="#e9ffd0">Hey! I noticed you haven't connected a data source yet —</text>
    <text x="80" y="215" font-size="14" fill="#e9ffd0">want me to walk you through it?</text>

    <rect x="320" y="252" width="240" height="56" rx="14" fill="#111" stroke="rgba(255,255,255,.08)"/>
    <text x="340" y="276" font-size="10" letter-spacing="2" fill="#7a7a7a">USER</text>
    <text x="340" y="296" font-size="14" fill="#d0d0d0">Yeah, let's do it.</text>

    <rect x="60" y="326" width="540" height="106" rx="14" fill="rgba(124,252,0,.06)" stroke="rgba(124,252,0,.25)"/>
    <text x="80" y="350" font-size="10" letter-spacing="2" fill="#7a7a7a">GROWBOT</text>
    <text x="80" y="373" font-size="14" fill="#e9ffd0">Perfect. I'll spin up a 2-min flow for you. Connecting your</text>
    <text x="80" y="393" font-size="14" fill="#e9ffd0">first source unlocks 4 templates and 3 automation flows.</text>
    <text x="80" y="416" font-size="14" fill="#e9ffd0">Ready?</text>

    <rect x="60" y="460" width="120" height="36" rx="8" fill="#fff"/>
    <text x="84" y="483" font-size="11" letter-spacing="2" fill="#0a0a0a" font-weight="700">CONTINUE ↗</text>
    <rect x="195" y="460" width="80" height="36" rx="8" fill="none" stroke="rgba(255,255,255,.18)"/>
    <text x="215" y="483" font-size="11" letter-spacing="2" fill="#bdbdbd">SKIP</text>
  </g>
</svg>`);

  const launchpad = svgURI(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 550" preserveAspectRatio="xMidYMid slice">
  <rect width="800" height="550" fill="#0a0a0a"/>
  <rect x="0" y="0" width="220" height="550" fill="#0c0c0c"/>
  <line x1="220" y1="0" x2="220" y2="550" stroke="rgba(255,255,255,.07)"/>
  <g font-family="JetBrains Mono, monospace" font-size="11" letter-spacing="2" fill="#888">
    <rect x="20" y="40" width="180" height="32" rx="6" fill="#151515"/>
    <circle cx="40" cy="56" r="3" fill="#7CFC00"/>
    <text x="55" y="60" fill="#fff">OVERVIEW</text>
    <text x="40" y="100" fill="#888">PAGES</text>
    <text x="40" y="130" fill="#888">A/B TESTS</text>
    <text x="40" y="160" fill="#888">ANALYTICS</text>
    <text x="40" y="190" fill="#888">DOMAINS</text>
  </g>
  <g font-family="JetBrains Mono, monospace" fill="#fff">
    <text x="260" y="64" font-size="24" letter-spacing="-.5" font-weight="700">LAUNCH OVERVIEW</text>

    <rect x="260" y="90" width="155" height="86" rx="8" fill="#0e0e0e" stroke="rgba(255,255,255,.07)"/>
    <text x="276" y="112" font-size="9" letter-spacing="2" fill="#666">VISITORS</text>
    <text x="276" y="152" font-size="28" font-weight="700">12.4K</text>

    <rect x="425" y="90" width="155" height="86" rx="8" fill="#0e0e0e" stroke="rgba(255,255,255,.07)"/>
    <text x="441" y="112" font-size="9" letter-spacing="2" fill="#666">CONV. RATE</text>
    <text x="441" y="152" font-size="28" font-weight="700" fill="#7CFC00">8.2%</text>

    <rect x="590" y="90" width="155" height="86" rx="8" fill="#0e0e0e" stroke="rgba(255,255,255,.07)"/>
    <text x="606" y="112" font-size="9" letter-spacing="2" fill="#666">VARIANTS</text>
    <text x="606" y="152" font-size="28" font-weight="700">4</text>

    <rect x="260" y="200" width="485" height="170" rx="8" fill="#0e0e0e" stroke="rgba(255,255,255,.07)"/>
    <defs><linearGradient id="lg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7CFC00" stop-opacity=".5"/><stop offset="1" stop-color="#7CFC00" stop-opacity="0"/></linearGradient></defs>
    <path d="M260 340 L320 320 L380 325 L440 290 L500 295 L560 250 L620 245 L680 200 L745 215 L745 370 L260 370 Z" fill="url(#lg)"/>
    <path d="M260 340 L320 320 L380 325 L440 290 L500 295 L560 250 L620 245 L680 200 L745 215" stroke="#7CFC00" stroke-width="2" fill="none"/>
    <circle cx="680" cy="200" r="5" fill="#0a0a0a" stroke="#7CFC00" stroke-width="2"/>

    <text x="260" y="410" font-size="11" letter-spacing="2" fill="#666">RECENT VARIANTS</text>
    <rect x="260" y="425" width="485" height="36" rx="6" fill="#0e0e0e" stroke="rgba(255,255,255,.07)"/>
    <text x="276" y="448" font-size="12" fill="#cfcfcf">VARIANT A · "PLANT THE SEED"</text>
    <text x="660" y="448" font-size="12" fill="#7CFC00" font-weight="700">+12%</text>
    <rect x="260" y="468" width="485" height="36" rx="6" fill="#0e0e0e" stroke="rgba(255,255,255,.07)"/>
    <text x="276" y="491" font-size="12" fill="#cfcfcf">VARIANT B · "BUILD &amp; SHIP"</text>
    <text x="660" y="491" font-size="12" fill="#cfcfcf">+3%</text>
  </g>
</svg>`);

  const stackflow = svgURI(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 550" preserveAspectRatio="xMidYMid slice">
  <rect width="800" height="550" fill="#0a0a0a"/>
  <line x1="0" y1="56" x2="800" y2="56" stroke="rgba(255,255,255,.07)"/>
  <g font-family="JetBrains Mono, monospace" font-size="10" letter-spacing="2" fill="#888">
    <text x="32" y="35" fill="#fff">SPRINT 12</text>
    <text x="130" y="35">·</text>
    <text x="148" y="35">VELOCITY</text>
    <text x="232" y="35">·</text>
    <text x="250" y="35">DEPLOYS</text>
    <text x="324" y="35">·</text>
    <text x="342" y="35">TEAM</text>
  </g>
  <g font-family="JetBrains Mono, monospace">
    <!-- col 1 -->
    <rect x="32" y="80" width="240" height="445" rx="8" fill="#0d0d0d" stroke="rgba(255,255,255,.07)"/>
    <text x="48" y="108" font-size="10" letter-spacing="2" fill="#888">TO DO</text>
    <text x="248" y="108" font-size="10" letter-spacing="2" fill="#7CFC00" text-anchor="end">04</text>
    <g>
      <rect x="48" y="124" width="208" height="64" rx="6" fill="#111" stroke="rgba(255,255,255,.07)"/>
      <text x="60" y="146" font-size="9" letter-spacing="1.4" fill="#666">SEED-128</text>
      <text x="60" y="168" font-size="12" fill="#d0d0d0">Refactor auth provider</text>
    </g>
    <g transform="translate(0,80)">
      <rect x="48" y="124" width="208" height="64" rx="6" fill="#111" stroke="rgba(255,255,255,.07)"/>
      <text x="60" y="146" font-size="9" letter-spacing="1.4" fill="#666">SEED-131</text>
      <text x="60" y="168" font-size="12" fill="#d0d0d0">Onboarding email loop</text>
    </g>
    <g transform="translate(0,160)">
      <rect x="48" y="124" width="208" height="64" rx="6" fill="#111" stroke="rgba(255,255,255,.07)"/>
      <text x="60" y="146" font-size="9" letter-spacing="1.4" fill="#666">SEED-134</text>
      <text x="60" y="168" font-size="12" fill="#d0d0d0">API rate limits</text>
    </g>
    <!-- col 2 -->
    <rect x="288" y="80" width="240" height="445" rx="8" fill="#0d0d0d" stroke="rgba(255,255,255,.07)"/>
    <text x="304" y="108" font-size="10" letter-spacing="2" fill="#888">IN PROGRESS</text>
    <text x="504" y="108" font-size="10" letter-spacing="2" fill="#7CFC00" text-anchor="end">02</text>
    <g>
      <rect x="304" y="124" width="208" height="64" rx="6" fill="#111" stroke="rgba(124,252,0,.3)"/>
      <text x="316" y="146" font-size="9" letter-spacing="1.4" fill="#666">SEED-127 · JM</text>
      <text x="316" y="168" font-size="12" fill="#d0d0d0">Stripe billing webhook</text>
    </g>
    <g transform="translate(0,80)">
      <rect x="304" y="124" width="208" height="64" rx="6" fill="#111" stroke="rgba(255,255,255,.07)"/>
      <text x="316" y="146" font-size="9" letter-spacing="1.4" fill="#666">SEED-130 · KP</text>
      <text x="316" y="168" font-size="12" fill="#d0d0d0">Dashboard charts v2</text>
    </g>
    <!-- col 3 -->
    <rect x="544" y="80" width="240" height="445" rx="8" fill="#0d0d0d" stroke="rgba(255,255,255,.07)"/>
    <text x="560" y="108" font-size="10" letter-spacing="2" fill="#888">SHIPPED</text>
    <text x="760" y="108" font-size="10" letter-spacing="2" fill="#7CFC00" text-anchor="end">07</text>
    <g>
      <rect x="560" y="124" width="208" height="64" rx="6" fill="#111" stroke="rgba(255,255,255,.07)"/>
      <text x="572" y="146" font-size="9" letter-spacing="1.4" fill="#666">SEED-122</text>
      <text x="572" y="168" font-size="12" fill="#d0d0d0">Magic-link auth</text>
    </g>
    <g transform="translate(0,80)">
      <rect x="560" y="124" width="208" height="64" rx="6" fill="#111" stroke="rgba(255,255,255,.07)"/>
      <text x="572" y="146" font-size="9" letter-spacing="1.4" fill="#666">SEED-124</text>
      <text x="572" y="168" font-size="12" fill="#d0d0d0">Realtime presence</text>
    </g>
    <g transform="translate(0,160)">
      <rect x="560" y="124" width="208" height="64" rx="6" fill="#111" stroke="rgba(255,255,255,.07)"/>
      <text x="572" y="146" font-size="9" letter-spacing="1.4" fill="#666">SEED-125</text>
      <text x="572" y="168" font-size="12" fill="#d0d0d0">Marketing site</text>
    </g>
  </g>
</svg>`);

  const seedpage = svgURI(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 550" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="g1" cx="50%" cy="40%" r="55%">
      <stop offset="0" stop-color="#7CFC00" stop-opacity=".18"/>
      <stop offset="1" stop-color="#7CFC00" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="550" fill="#0a0a0a"/>
  <rect width="800" height="550" fill="url(#g1)"/>
  <g font-family="JetBrains Mono, monospace" text-anchor="middle">
    <rect x="320" y="120" width="160" height="32" rx="16" fill="none" stroke="rgba(124,252,0,.35)"/>
    <text x="400" y="141" font-size="11" letter-spacing="3" fill="#7CFC00">▲ EARLY ACCESS · V0.4</text>

    <text x="400" y="240" font-size="58" font-weight="700" letter-spacing="-2" fill="#fff">LAUNCH FASTER.</text>
    <text x="400" y="304" font-size="58" font-weight="700" letter-spacing="-2" fill="#7CFC00">GROW SMARTER.</text>

    <text x="400" y="354" font-size="14" fill="#888">A high-converting landing page builder</text>
    <text x="400" y="374" font-size="14" fill="#888">for early-stage startups.</text>

    <rect x="320" y="410" width="160" height="44" rx="0" fill="#fff"/>
    <text x="400" y="437" font-size="11" letter-spacing="3" fill="#0a0a0a" font-weight="700">GET ON THE LIST ↗</text>

    <text x="400" y="490" font-size="10" letter-spacing="3" fill="#666">NO SPAM · UNSUB ANYTIME</text>
  </g>
</svg>`);

  const cases = [
    { tag:'AI TOOL', num:'01', title:'GROWBOT', desc:'An AI-powered onboarding assistant that helps SaaS products activate new users through smart prompts and adaptive flows.', meta:[['Stack','Next · OpenAI'],['Year','2025'],['Role','Build · Design']], url:'growbot.ai', img: growbot },
    { tag:'SAAS MVP', num:'02', title:'LAUNCHPAD', desc:'A no-code tool for founders to build, test, and launch landing pages with built-in A/B testing and analytics.', meta:[['Stack','Next · Supabase'],['Year','2024'],['Role','Full-stack']], url:'uselaunchpad.dev', img: launchpad },
    { tag:'WEB APP', num:'03', title:'STACKFLOW', desc:"A developer workflow dashboard for tracking sprints, deployments, and team velocity — all in real time.", meta:[['Stack','React · tRPC'],['Year','2024'],['Role','Lead build']], url:'stackflow.dev', img: stackflow },
    { tag:'LANDING PAGE', num:'04', title:'SEEDPAGE', desc:'A high-converting product landing page system, optimized for early-stage startup launches and waitlists.', meta:[['Stack','Astro · MDX'],['Year','2025'],['Role','Design · Dev']], url:'seedpage.co', img: seedpage },
  ];

  list.innerHTML = cases.map((c, i) => `
    <article class="case ${i % 2 ? 'flip' : ''}">
      <div class="caseInfo" data-motion-text>
        <ul>
          <li class="ctag motion-piece"><span class="num">${c.num}</span> · ${c.tag}</li>
          <li class="motion-piece"><h3>${c.title}</h3></li>
          <li class="motion-piece"><p>${c.desc}</p></li>
          <li class="motion-piece"><div class="cmeta">${c.meta.map(([k,v])=>`<div>${k}<b>${v}</b></div>`).join('')}</div></li>
          <li class="motion-piece">
            <a class="btn" href="#" data-cursor-text="Open case study">
              <span class="br tl"></span><span class="br tr"></span><span class="br bl"></span><span class="br br2"></span>
              <span>View project</span><span>↗</span>
            </a>
          </li>
        </ul>
      </div>
      <div class="imageMask" data-cursor-text="Open gallery">
        <div class="frame-bar"><i></i><i></i><i></i><span class="url">${c.url}</span></div>
        <div class="c-glitch">
          <div class="c-glitch__img" style='background-image:url("${c.img}")'></div>
          <div class="c-glitch__img" style='background-image:url("${c.img}")'></div>
          <div class="c-glitch__img" style='background-image:url("${c.img}")'></div>
          <div class="c-glitch__img" style='background-image:url("${c.img}")'></div>
        </div>
      </div>
    </article>
  `).join('');
})();
