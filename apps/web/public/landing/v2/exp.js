// SEEDIT capabilities — services + the n8n automation offering.
(function(){
  const grid = document.getElementById('exp-grid');
  if (!grid) return;

  // Core capabilities (left + middle columns)
  const capabilities = [
    { num:'01', title:'Full-Stack Product Development', desc:'Web apps and SaaS, built to ship — React, Next.js, FastAPI, Supabase, deployed on Vercel, Railway, and AWS.' },
    { num:'02', title:'Marketing Analytics & Performance', desc:'Google Ads + GA4 dashboards, campaign reporting, keyword and competitive analysis, plus SEO and GEO for AI-powered search.' },
    { num:'03', title:'Integrations & Messaging', desc:'Stripe billing and subscriptions, WhatsApp Business API, OAuth, and custom API integrations that tie your stack together.' },
    { num:'04', title:'Brand & Product Design', desc:'Brand identity, design systems, and UI/UX for digital products that look as good as they work.' },
  ];

  // The headline automation offering (right column, featured)
  const automation = {
    num:'05', kicker:'n8n Automation & AI Workflows', title:'Automate the work nobody wants to do.',
    desc:'We build n8n automation workflows that connect your apps and run your repetitive processes — lead capture, reporting, notifications, data sync — on autopilot. Pair it with AI agents and multi-model routing for workflows that think, not just trigger.',
    points:['Lead capture & enrichment','Automated reporting','Email & WhatsApp pipelines','AI agents · multi-model routing']
  };

  const renderCap = it => `
    <div class="item motion-piece">
      <div class="nm"><span>${it.num} |</span></div>
      <div class="title">${it.title}</div>
      <div class="desc">${it.desc}</div>
    </div>`;

  grid.innerHTML = `
    <div class="col" data-motion-text>
      <h4 class="motion-piece"><b>— Capabilities</b><span>${String(capabilities.length).padStart(2,'0')}</span></h4>
      ${capabilities.slice(0,2).map(renderCap).join('')}
    </div>
    <div class="col" data-motion-text>
      <h4 class="motion-piece"><b>— Services</b><span>&nbsp;</span></h4>
      ${capabilities.slice(2).map(renderCap).join('')}
    </div>
    <div class="col feature" data-motion-text>
      <h4 class="motion-piece"><b>— Featured</b><span>${automation.num}</span></h4>
      <div class="item motion-piece autoCard">
        <div class="nm"><span class="autoKicker">${automation.kicker}</span></div>
        <div class="title autoTitle">${automation.title}</div>
        <div class="desc">${automation.desc}</div>
        <ul class="autoList">${automation.points.map(p=>`<li>${p}</li>`).join('')}</ul>
        <a class="lnk" href="#contact" data-cursor-text="Talk automation">Automate a workflow ↗</a>
      </div>
    </div>`;
})();
