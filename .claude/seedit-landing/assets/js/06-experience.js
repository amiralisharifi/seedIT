// Experience grid content
(function(){
  const grid = document.getElementById('exp-grid');
  if (!grid) return;

  const history = [
    { num:'01', when:'2023 — Now', where:'SEED IT', role:'Founder & Lead Builder', desc:'Running vibe coding sessions with founders. From whiteboard to live MVP in a week. Shipped 40+ products.' },
    { num:'02', when:'2021 — 2023', where:'Freelance', role:'Full-stack Developer', desc:'End-to-end builds for startups and indie founders — design, dev, deploy. Specialized in fast turnaround SaaS work.' },
    { num:'03', when:'2019 — 2021', where:'Agency X', role:'Frontend Engineer', desc:'Client projects at scale. Built component libraries, perf-tuned marketing sites, led a small frontend pod.' },
    { num:'04', when:'2017 — 2019', where:'Startup Y', role:'UI/UX + Dev Hybrid', desc:'Designed and shipped early products — dashboards, prototypes, onboarding flows. Wore every hat in the building.' },
  ];
  const skills = [
    { num:'01', title:'Rapid MVP development', desc:'From idea to deployed product in days, not months.' },
    { num:'02', title:'AI integration', desc:'Embed LLMs, agents, and automation into real products.' },
    { num:'03', title:'Design systems', desc:'Clean, scalable component libraries for fast iteration.' },
    { num:'04', title:'Vibe coding', desc:'Flow-state development — fast, intuitive, creative.' },
    { num:'05', title:'Full-stack delivery', desc:'React, Next.js, Node, Supabase, Postgres, APIs.' },
    { num:'06', title:'Product strategy', desc:'Scope, prioritize, and ship what actually matters.' },
  ];
  const tools = [
    { num:'01', title:'Seed starter kit', desc:'A boilerplate for launching SaaS MVPs with auth, billing, and AI built in.', link:'View project' },
    { num:'02', title:'Vibe stack', soon:true, desc:'A curated toolkit of components, prompts, and patterns for vibe coders.' },
  ];

  const renderCol = (label, count, items, render) => `
    <div class="col" data-motion-text>
      <h4 class="motion-piece"><b>— ${label}</b><span>${String(count).padStart(2,'0')}</span></h4>
      ${items.map(render).join('')}
    </div>`;

  const renderHist = it => `
    <div class="item motion-piece">
      <div class="nm"><span>${it.num} | <span class="when">${it.when}</span></span></div>
      <div class="title"><span class="where">${it.where}</span></div>
      <div class="role">${it.role}</div>
      <div class="desc">${it.desc}</div>
    </div>`;
  const renderSkill = it => `
    <div class="item motion-piece">
      <div class="nm"><span>${it.num} |</span></div>
      <div class="title">${it.title}</div>
      <div class="desc">${it.desc}</div>
    </div>`;
  const renderTool = it => `
    <div class="item motion-piece">
      <div class="nm"><span>${it.num} |</span>${it.soon?'<span class="soon">SOON</span>':''}</div>
      <div class="title">${it.title}</div>
      <div class="desc">${it.desc}</div>
      ${it.link?`<a class="lnk" href="#" data-cursor-text="View project">${it.link} ↗</a>`:''}
    </div>`;

  grid.innerHTML =
    renderCol('Experience', history.length, history, renderHist) +
    renderCol('Skills', skills.length, skills, renderSkill) +
    renderCol('Personal projects', tools.length, tools, renderTool);
})();
