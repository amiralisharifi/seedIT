// SEEDIT product portfolio — 5 real products, each card tinted with its own brand.
(function(){
  const list = document.getElementById('case-list');
  if (!list) return;

  const svgURI = (svg) => 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);

  /* 01 — SALUT.AE · navy + gold ads/GA4 dashboard */
  const salut = svgURI(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 550" preserveAspectRatio="xMidYMid slice" font-family="Inter, sans-serif">
  <rect width="800" height="550" fill="#0a1430"/>
  <rect x="0" y="0" width="190" height="550" fill="#0c1838"/>
  <line x1="190" y1="0" x2="190" y2="550" stroke="rgba(232,179,65,.18)"/>
  <circle cx="34" cy="44" r="9" fill="#E8B341"/>
  <text x="52" y="49" font-size="15" font-weight="700" fill="#fff">Salut</text>
  <g font-size="11" fill="#8aa0c8">
    <rect x="20" y="78" width="150" height="30" rx="7" fill="rgba(232,179,65,.14)"/>
    <text x="36" y="98" fill="#E8B341" font-weight="600">Account Overview</text>
    <text x="36" y="138">Campaign Performance</text>
    <text x="36" y="170">Keyword Explorer</text>
    <text x="36" y="202">Competitive Insights</text>
    <text x="36" y="234">GA4 Cross-Channel</text>
    <text x="36" y="266">AI Optimization Hub</text>
  </g>
  <text x="216" y="58" font-size="22" font-weight="700" fill="#fff">Performance</text>
  <text x="216" y="80" font-size="12" fill="#7d93bd">Last 30 days · all campaigns</text>
  <g>
    <rect x="216" y="98" width="170" height="92" rx="12" fill="#0f1f44" stroke="rgba(255,255,255,.06)"/>
    <text x="234" y="124" font-size="11" fill="#7d93bd">Ad spend</text>
    <text x="234" y="160" font-size="26" font-weight="700" fill="#fff">AED 84k</text>
    <rect x="398" y="98" width="170" height="92" rx="12" fill="#0f1f44" stroke="rgba(255,255,255,.06)"/>
    <text x="416" y="124" font-size="11" fill="#7d93bd">ROAS</text>
    <text x="416" y="160" font-size="26" font-weight="700" fill="#E8B341">4.7×</text>
    <rect x="580" y="98" width="180" height="92" rx="12" fill="#0f1f44" stroke="rgba(255,255,255,.06)"/>
    <text x="598" y="124" font-size="11" fill="#7d93bd">Conversions</text>
    <text x="598" y="160" font-size="26" font-weight="700" fill="#fff">1,284</text>
  </g>
  <rect x="216" y="206" width="544" height="300" rx="12" fill="#0f1f44" stroke="rgba(255,255,255,.06)"/>
  <text x="234" y="234" font-size="13" font-weight="600" fill="#fff">Revenue by channel</text>
  <defs><linearGradient id="sg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#E8B341" stop-opacity=".45"/><stop offset="1" stop-color="#E8B341" stop-opacity="0"/></linearGradient></defs>
  <path d="M234 440 L320 410 L400 420 L470 360 L540 372 L610 300 L690 312 L742 250 L742 480 L234 480 Z" fill="url(#sg)"/>
  <path d="M234 440 L320 410 L400 420 L470 360 L540 372 L610 300 L690 312 L742 250" stroke="#E8B341" stroke-width="2.5" fill="none"/>
  <circle cx="742" cy="250" r="5" fill="#0f1f44" stroke="#E8B341" stroke-width="2.5"/>
</svg>`);

  /* 02 — NESHAT.AE · tournament bracket with "N" mark */
  const neshat = svgURI(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 550" preserveAspectRatio="xMidYMid slice" font-family="Inter, sans-serif">
  <rect width="800" height="550" fill="#0b1020"/>
  <g stroke="#2DD4BF" stroke-width="9" fill="none" opacity=".9">
    <path d="M52 150 L52 60 L112 60 L112 150"/>
    <path d="M82 60 L82 110"/>
  </g>
  <text x="138" y="92" font-size="22" font-weight="700" fill="#fff">Neshat</text>
  <text x="138" y="116" font-size="12" fill="#6b86a8" letter-spacing="2">TOURNAMENT CONTROL · LIVE</text>
  <g font-family="JetBrains Mono, monospace" font-size="12">
    <!-- round 1 -->
    <g>
      <rect x="40" y="180" width="170" height="40" rx="8" fill="#101a31" stroke="rgba(45,212,191,.5)"/>
      <text x="56" y="205" fill="#e6f7f4">Al Habtoor</text><text x="190" y="205" fill="#2DD4BF" text-anchor="end">6</text>
      <rect x="40" y="232" width="170" height="40" rx="8" fill="#101a31" stroke="rgba(255,255,255,.08)"/>
      <text x="56" y="257" fill="#9fb3cc">Marina SC</text><text x="190" y="257" fill="#9fb3cc" text-anchor="end">3</text>
      <rect x="40" y="300" width="170" height="40" rx="8" fill="#101a31" stroke="rgba(255,255,255,.08)"/>
      <text x="56" y="325" fill="#9fb3cc">Desert Falcons</text><text x="190" y="325" fill="#9fb3cc" text-anchor="end">4</text>
      <rect x="40" y="352" width="170" height="40" rx="8" fill="#101a31" stroke="rgba(45,212,191,.5)"/>
      <text x="56" y="377" fill="#e6f7f4">JBR United</text><text x="190" y="377" fill="#2DD4BF" text-anchor="end">6</text>
    </g>
    <!-- connectors -->
    <g stroke="rgba(45,212,191,.35)" stroke-width="2" fill="none">
      <path d="M210 200 H250 V260 H290"/>
      <path d="M210 320 H250 V260"/>
      <path d="M210 372 H250 V436 H290"/>
      <path d="M210 252 H250"/>
    </g>
    <!-- semis -->
    <g>
      <rect x="290" y="240" width="170" height="40" rx="8" fill="#101a31" stroke="rgba(45,212,191,.5)"/>
      <text x="306" y="265" fill="#e6f7f4">Al Habtoor</text>
      <rect x="290" y="416" width="170" height="40" rx="8" fill="#101a31" stroke="rgba(255,255,255,.08)"/>
      <text x="306" y="441" fill="#9fb3cc">JBR United</text>
    </g>
    <path d="M460 260 H505 V348 H560" stroke="rgba(45,212,191,.35)" stroke-width="2" fill="none"/>
    <path d="M460 436 H505 V348" stroke="rgba(45,212,191,.35)" stroke-width="2" fill="none"/>
    <!-- final -->
    <rect x="560" y="324" width="190" height="52" rx="10" fill="rgba(45,212,191,.12)" stroke="#2DD4BF"/>
    <text x="578" y="346" font-size="9" fill="#2DD4BF" letter-spacing="2">FINAL · COURT 1</text>
    <text x="578" y="366" fill="#fff">Al Habtoor</text>
  </g>
</svg>`);

  /* 03 — POOK · teal / court black / net white booking */
  const pook = svgURI(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 550" preserveAspectRatio="xMidYMid slice" font-family="Inter, sans-serif">
  <rect width="800" height="550" fill="#0b0f0f"/>
  <circle cx="36" cy="46" r="13" fill="#16C2A8"/>
  <text x="30" y="52" font-size="17" font-weight="800" fill="#0b0f0f">P</text>
  <text x="60" y="52" font-size="18" font-weight="700" fill="#fff">POOK</text>
  <text x="690" y="52" font-size="11" fill="#16C2A8" text-anchor="end" letter-spacing="2">FIND A GAME</text>
  <!-- court -->
  <rect x="40" y="86" width="360" height="430" rx="14" fill="#0e1413" stroke="rgba(22,194,168,.3)"/>
  <rect x="74" y="120" width="292" height="362" rx="6" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="2"/>
  <line x1="74" y1="301" x2="366" y2="301" stroke="#16C2A8" stroke-width="2.5"/>
  <line x1="220" y1="120" x2="220" y2="482" stroke="rgba(255,255,255,.25)" stroke-width="1.5" stroke-dasharray="5 6"/>
  <circle cx="150" cy="230" r="16" fill="#16C2A8"/><text x="150" y="235" font-size="12" font-weight="700" fill="#06100e" text-anchor="middle">5.2</text>
  <circle cx="290" cy="200" r="16" fill="#16C2A8"/><text x="290" y="205" font-size="12" font-weight="700" fill="#06100e" text-anchor="middle">5.0</text>
  <circle cx="160" cy="400" r="16" fill="rgba(255,255,255,.85)"/><text x="160" y="405" font-size="12" font-weight="700" fill="#06100e" text-anchor="middle">4.8</text>
  <circle cx="300" cy="420" r="16" fill="rgba(255,255,255,.4)" stroke="#16C2A8" stroke-dasharray="3 3"/><text x="300" y="425" font-size="12" fill="#fff" text-anchor="middle">+</text>
  <!-- right panel -->
  <text x="430" y="120" font-size="13" font-weight="600" fill="#fff">Padel · Tonight 8:00 PM</text>
  <g>
    <rect x="430" y="138" width="330" height="74" rx="12" fill="#0e1413" stroke="rgba(22,194,168,.25)"/>
    <text x="448" y="166" font-size="13" fill="#fff" font-weight="600">Reform Padel · Court 3</text>
    <text x="448" y="190" font-size="11" fill="#7f9690">2 spots open · skill 4.8–5.4</text>
    <rect x="660" y="156" width="84" height="38" rx="9" fill="#16C2A8"/>
    <text x="702" y="180" font-size="12" font-weight="700" fill="#06100e" text-anchor="middle">Join</text>
  </g>
  <g>
    <rect x="430" y="224" width="330" height="74" rx="12" fill="#0e1413" stroke="rgba(255,255,255,.08)"/>
    <text x="448" y="252" font-size="13" fill="#fff" font-weight="600">JA Padel Club · Court 1</text>
    <text x="448" y="276" font-size="11" fill="#7f9690">Confirmed · WhatsApp sent ✓</text>
  </g>
  <rect x="430" y="320" width="330" height="196" rx="12" fill="#0e1413" stroke="rgba(255,255,255,.06)"/>
  <text x="448" y="348" font-size="11" fill="#7f9690" letter-spacing="1">YOUR RATING</text>
  <text x="448" y="392" font-size="40" font-weight="800" fill="#16C2A8">5.1</text>
  <text x="448" y="416" font-size="11" fill="#7f9690">Padel · across 6 sports</text>
  <rect x="448" y="440" width="294" height="8" rx="4" fill="#16221f"/>
  <rect x="448" y="440" width="210" height="8" rx="4" fill="#16C2A8"/>
  <text x="448" y="478" font-size="10" fill="#566b66">1.0</text><text x="734" y="478" font-size="10" fill="#566b66" text-anchor="end">7.0</text>
</svg>`);

  /* 04 — COUNSEL · violet AI model routing */
  const counsel = svgURI(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 550" preserveAspectRatio="xMidYMid slice" font-family="Inter, sans-serif">
  <rect width="800" height="550" fill="#0a0a12"/>
  <circle cx="36" cy="44" r="10" fill="#8B5CF6"/>
  <text x="54" y="50" font-size="16" font-weight="700" fill="#fff">Counsel</text>
  <text x="746" y="50" font-size="10" fill="#9b8cff" text-anchor="end" letter-spacing="2">BYOK · UAE-FIRST</text>
  <rect x="40" y="86" width="720" height="74" rx="12" fill="#11111f" stroke="rgba(139,92,246,.3)"/>
  <text x="62" y="120" font-size="13" fill="#cfc8ff">Draft a VAT-compliant invoice summary for a Dubai SME…</text>
  <text x="62" y="144" font-size="11" fill="#6f6a8f">Task type detected: financial · routing to best model</text>
  <!-- routing nodes -->
  <text x="62" y="200" font-size="11" fill="#6f6a8f" letter-spacing="2">PER-ROLE MODEL ROUTING</text>
  <g font-size="12">
    <rect x="40" y="220" width="220" height="120" rx="12" fill="#11111f" stroke="rgba(255,255,255,.07)"/>
    <text x="60" y="250" fill="#9b8cff" font-weight="600">Reasoning</text>
    <text x="60" y="276" fill="#fff" font-size="14" font-weight="600">Claude Opus</text>
    <rect x="60" y="294" width="120" height="22" rx="11" fill="rgba(139,92,246,.18)"/>
    <text x="72" y="309" fill="#b9aaff" font-size="10">selected ✓</text>

    <rect x="290" y="220" width="220" height="120" rx="12" fill="#11111f" stroke="rgba(255,255,255,.07)"/>
    <text x="310" y="250" fill="#9b8cff" font-weight="600">Fast drafts</text>
    <text x="310" y="276" fill="#cfc8ff" font-size="14" font-weight="600">GPT-4o mini</text>
    <text x="310" y="309" fill="#6f6a8f" font-size="10">standby</text>

    <rect x="540" y="220" width="220" height="120" rx="12" fill="#11111f" stroke="rgba(255,255,255,.07)"/>
    <text x="560" y="250" fill="#9b8cff" font-weight="600">Long context</text>
    <text x="560" y="276" fill="#cfc8ff" font-size="14" font-weight="600">Gemini 1.5</text>
    <text x="560" y="309" fill="#6f6a8f" font-size="10">standby</text>
  </g>
  <rect x="40" y="366" width="720" height="150" rx="12" fill="#0d0d18" stroke="rgba(139,92,246,.25)"/>
  <text x="62" y="396" font-size="11" fill="#6f6a8f" letter-spacing="2">OUTPUT</text>
  <text x="62" y="426" font-size="13" fill="#e7e2ff">Invoice summary — VAT 5% applied, AED totals reconciled.</text>
  <text x="62" y="450" font-size="13" fill="#e7e2ff">Routed via your key · 2.1s · est. AED 0.04</text>
  <rect x="62" y="470" width="150" height="32" rx="8" fill="#8B5CF6"/>
  <text x="137" y="491" font-size="12" font-weight="700" fill="#0a0a12" text-anchor="middle">Copy result</text>
</svg>`);

  /* 05 — AYVAN.APP · electric indigo CRM pipeline */
  const ayvan = svgURI(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 550" preserveAspectRatio="xMidYMid slice" font-family="Inter, sans-serif">
  <rect width="800" height="550" fill="#0a0a16"/>
  <rect x="0" y="0" width="800" height="62" fill="#0d0d1f"/>
  <circle cx="34" cy="32" r="9" fill="#4F46E5"/>
  <text x="52" y="37" font-size="15" font-weight="700" fill="#fff">Ayvan</text>
  <text x="180" y="37" font-size="11" fill="#8b8bf5">Pipeline</text>
  <text x="746" y="37" font-size="10" fill="#6f6f9c" text-anchor="end" letter-spacing="1">n8n · 6 flows running</text>
  <g font-size="11" font-family="Inter, sans-serif">
    <!-- columns -->
    <text x="40" y="96" fill="#8b8bf5" letter-spacing="1">NEW LEADS</text><text x="190" y="96" fill="#4F46E5" text-anchor="end">12</text>
    <text x="290" y="96" fill="#8b8bf5" letter-spacing="1">QUALIFIED</text><text x="440" y="96" fill="#4F46E5" text-anchor="end">7</text>
    <text x="540" y="96" fill="#8b8bf5" letter-spacing="1">WON</text><text x="760" y="96" fill="#4F46E5" text-anchor="end">04</text>
  </g>
  <g>
    <rect x="40" y="112" width="200" height="80" rx="11" fill="#12122a" stroke="rgba(79,70,229,.4)"/>
    <text x="58" y="138" font-size="13" fill="#fff" font-weight="600">Gulf Retail Co.</text>
    <text x="58" y="160" font-size="11" fill="#8a8ab8">AED 24,000 · auto-followup</text>
    <rect x="58" y="170" width="92" height="14" rx="7" fill="rgba(79,70,229,.25)"/>
    <text x="64" y="181" font-size="9" fill="#b6b0ff">⚡ n8n queued</text>

    <rect x="40" y="204" width="200" height="72" rx="11" fill="#12122a" stroke="rgba(255,255,255,.07)"/>
    <text x="58" y="230" font-size="13" fill="#fff" font-weight="600">Marina Dental</text>
    <text x="58" y="252" font-size="11" fill="#8a8ab8">AED 9,500 · new</text>

    <rect x="290" y="112" width="200" height="80" rx="11" fill="#12122a" stroke="rgba(255,255,255,.07)"/>
    <text x="308" y="138" font-size="13" fill="#fff" font-weight="600">Falcon Logistics</text>
    <text x="308" y="160" font-size="11" fill="#8a8ab8">AED 58,000 · call booked</text>
    <rect x="308" y="170" width="104" height="14" rx="7" fill="rgba(34,197,94,.18)"/>
    <text x="314" y="181" font-size="9" fill="#8ff0b0">✓ email sent</text>

    <rect x="540" y="112" width="200" height="80" rx="11" fill="#12122a" stroke="rgba(79,70,229,.4)"/>
    <text x="558" y="138" font-size="13" fill="#fff" font-weight="600">Oasis Clinics</text>
    <text x="558" y="160" font-size="11" fill="#8a8ab8">AED 132,000 · closed</text>
    <rect x="558" y="170" width="70" height="14" rx="7" fill="rgba(34,197,94,.18)"/>
    <text x="564" y="181" font-size="9" fill="#8ff0b0">won 🎉</text>
  </g>
  <rect x="40" y="300" width="720" height="216" rx="12" fill="#0d0d1f" stroke="rgba(79,70,229,.2)"/>
  <text x="62" y="332" font-size="11" fill="#6f6f9c" letter-spacing="2">AUTOMATION FEED</text>
  <g font-size="12" fill="#bcbce0">
    <text x="62" y="364">› Lead captured from web form → enriched → assigned</text>
    <text x="62" y="394">› Follow-up email scheduled (T+2 days) via n8n</text>
    <text x="62" y="424">› WhatsApp reminder sent to Gulf Retail Co.</text>
    <text x="62" y="454">› Deal moved to “Won” → invoice drafted in Salut</text>
    <text x="62" y="484">› Weekly pipeline digest emailed to owner</text>
  </g>
</svg>`);

  const cases = [
    {
      num:'01', tag:'Marketing Dashboard', title:'Salut.ae',
      status:'In Build', statusKind:'build',
      tagline:'Know exactly what your ads are worth.',
      desc:'Salut.ae pulls Google Ads and GA4 into one clear dashboard, so you can see which campaigns drive revenue and which just burn budget. Keyword, segment, and competitive views sit alongside an AI Optimization Hub that turns your data into next steps.',
      chips:['Account Overview','Campaign Performance','Keyword Explorer','Competitive Insights','GA4 Cross-Channel','AI Optimization Hub'],
      url:'ads-dashboard-weld.vercel.app', href:'https://ads-dashboard-weld.vercel.app', img: salut
    },
    {
      num:'02', tag:'Tournament Management', title:'Neshat.ae',
      status:'Live', statusKind:'live',
      tagline:'Run a tournament without the chaos.',
      desc:'Neshat handles registration, draws, scheduling, and live results end to end, across multiple sports. Organisers get automated brackets and a single place to manage every match — so the day runs itself and players always know what\u2019s next.',
      chips:['Registration','Automated Brackets','Scheduling','Live Results','Multi-sport','AED Tiers'],
      url:'neshat.ae', href:'https://neshat.ae', img: neshat
    },
    {
      num:'03', tag:'Sports Booking + Club', title:'POOK',
      status:'In Build', statusKind:'build',
      tagline:'Play more. Manage less.',
      desc:'POOK connects players with courts and with each other — book a venue, find a match at your level, and play across multiple sports. For clubs and venues, pook.club adds the booking, payments, and member tools to run the whole operation.',
      chips:['Venue Booking','Player Matching','1.0\u20137.0 Skill Rating','Club Management','Stripe Billing','WhatsApp API'],
      url:'pook.ae · pook.club', href:'https://pook.ae', img: pook
    },
    {
      num:'04', tag:'AI SaaS', title:'Counsel',
      status:'Beta', statusKind:'beta',
      tagline:'The right AI model for every job — with your own keys.',
      desc:'Counsel is an AI SaaS that routes each task to the model best suited for it, with bring-your-own-key support and a UAE-first build. Per-role model routing means every task lands on the model that handles it best.',
      chips:['Per-role Routing','BYOK','Multi-model','UAE-first'],
      url:'counsel-saas.vercel.app', href:'https://counsel-saas.vercel.app', img: counsel
    },
    {
      num:'05', tag:'CRM for UAE SMEs', title:'Ayvan.app',
      status:'In Build', statusKind:'build',
      tagline:'A CRM that does the busywork for you.',
      desc:'Ayvan is a CRM built for UAE small and medium businesses, with automation woven in so leads, follow-ups, and updates move on their own. It brings your tools into one place and keeps your pipeline current — without the manual data entry.',
      chips:['Lead Pipeline','Automated Follow-ups','n8n Automation','Unified Tools'],
      url:'ayvan.app', href:'https://ayvan.app', img: ayvan
    },
  ];

  list.innerHTML = cases.map((c, i) => `
    <article class="case ${i % 2 ? 'flip' : ''}">
      <div class="caseInfo" data-motion-text>
        <ul>
          <li class="ctag motion-piece"><span class="num">${c.num}</span> · ${c.tag} <span class="status ${c.statusKind}">${c.status}</span></li>
          <li class="motion-piece"><h3>${c.title}</h3></li>
          <li class="motion-piece"><p class="tagline">${c.tagline}</p></li>
          <li class="motion-piece"><p>${c.desc}</p></li>
          <li class="motion-piece"><div class="chips">${c.chips.map(ch=>`<span class="chip">${ch}</span>`).join('')}</div></li>
          <li class="motion-piece">
            <a class="btn" href="${c.href}" target="_blank" rel="noopener" data-cursor-text="Open ${c.title}">
              <span class="br tl"></span><span class="br tr"></span><span class="br bl"></span><span class="br br2"></span>
              <span>Visit ${c.url}</span><span>↗</span>
            </a>
          </li>
        </ul>
      </div>
      <div class="imageMask" data-cursor-text="Open preview">
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
