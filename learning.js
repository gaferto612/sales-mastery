/* Authoritative curriculum navigation, learner state, notes, bookmarks and accessibility. */
(()=>{'use strict';
const {modules,paths,capstones,research={},assessments={},levels=[],stats={modules:modules.length}}=window.SALES_MASTERY;
const STATE_KEY='salesMasteryLearningState';
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const currentId=()=>(location.pathname.match(/module-(\d+)\.html/)||[])[1]||null;
const byId=id=>modules.find(item=>item.id===id);
const bookmarks=()=>read('salesMasteryBookmarks',[]);
const notes=()=>read('salesMasteryNotes',{});

const STATUS_LEVELS = {
  'not_started': 0,
  'in_progress': 1,
  'read': 2,
  'knowledge_check_passed': 3,
  'practice_completed': 4,
  'skill_demonstrated': 5
};

function migrateState(){
  const current=read(STATE_KEY,null);
  if(current?.version===3&&current.modules)return current;
  
  const state={version:3,modules:{},migratedAt:new Date().toISOString()};
  
  // Helper to safely upgrade status without regressing
  const upgradeStatus = (id, newStatus) => {
    if (!state.modules[id]) {
      state.modules[id] = {
        status: 'not_started',
        lessonRead: false,
        knowledgeCheck: { passed: false, score: 0, total: 0, attempts: 0 },
        practice: { completed: false, selfAssessed: false },
        updatedAt: new Date().toISOString()
      };
    }
    const currentStatus = state.modules[id].status;
    if (STATUS_LEVELS[newStatus] > STATUS_LEVELS[currentStatus]) {
      state.modules[id].status = newStatus;
      state.modules[id].updatedAt = new Date().toISOString();
    }
  };

  // 1. Migrate V1 legacy arrays conservatively
  const opened=read('salesMasteryProgress',[]);
  const oldComplete=read('salesMasteryMastery',[]);
  const oldChecks=read('salesMasteryChecks',{});
  
  opened.forEach(id => {
    if(byId(id)) upgradeStatus(id, 'in_progress');
  });
  
  // Note: Old 'complete' / 'mastery' is conservative. If they were in 'salesMasteryMastery' we assume they at least read it.
  oldComplete.forEach(id => {
    if(byId(id)) {
      upgradeStatus(id, 'in_progress'); 
      // Do not automatically grant read or higher just from old array due to conflicting tracking
    }
  });

  Object.keys(oldChecks).forEach(id => {
    if(byId(id) && oldChecks[id] === true) {
      upgradeStatus(id, 'knowledge_check_passed');
      state.modules[id].knowledgeCheck.passed = true;
    }
  });

  // 2. Migrate V2 object state
  if (current?.version === 2 && current.modules) {
    Object.keys(current.modules).forEach(id => {
      if(!byId(id)) return;
      const m = current.modules[id];
      if (m.started) upgradeStatus(id, 'in_progress');
      if (m.read) {
        upgradeStatus(id, 'read');
        state.modules[id].lessonRead = true;
      }
      if (m.knowledgePassed) {
        upgradeStatus(id, 'knowledge_check_passed');
        state.modules[id].knowledgeCheck.passed = true;
        state.modules[id].knowledgeCheck.score = m.knowledgeScore || 0;
        state.modules[id].knowledgeCheck.total = m.knowledgeTotal || 0;
        state.modules[id].knowledgeCheck.attempts = m.knowledgeAttempts || 1;
      }
      if (m.practiceCompleted) {
        upgradeStatus(id, 'practice_completed');
        state.modules[id].practice.completed = true;
      }
      if (m.demonstrated) {
        upgradeStatus(id, 'skill_demonstrated');
        state.modules[id].practice.selfAssessed = true;
      }
    });
  }

  write(STATE_KEY,state);
  // Clean up legacy conflicting sources of truth
  ['salesMasteryProgress','salesMasteryMastery','salesMasteryChecks'].forEach(key=>localStorage.removeItem(key));
  return state;
}

let learningState=migrateState();
const moduleState=id=>learningState.modules[id]||{
  status: 'not_started',
  lessonRead: false,
  knowledgeCheck: { passed: false, score: 0, total: 0, attempts: 0 },
  practice: { completed: false, selfAssessed: false }
};

function updateModule(id, patchFn){
  if (!learningState.modules[id]) {
    learningState.modules[id] = {
      status: 'not_started',
      lessonRead: false,
      knowledgeCheck: { passed: false, score: 0, total: 0, attempts: 0 },
      practice: { completed: false, selfAssessed: false },
      updatedAt: new Date().toISOString()
    };
  }
  
  patchFn(learningState.modules[id]);
  
  // Recalculate status based on true state
  const m = learningState.modules[id];
  let newStatus = 'in_progress';
  if (m.lessonRead) newStatus = 'read';
  if (m.knowledgeCheck.passed) newStatus = 'knowledge_check_passed';
  if (m.practice.completed) newStatus = 'practice_completed';
  if (m.practice.selfAssessed) newStatus = 'skill_demonstrated';
  
  m.status = newStatus;
  m.updatedAt = new Date().toISOString();
  
  write(STATE_KEY, learningState);
  return learningState.modules[id];
}

const statusLabels = {
  'not_started': 'Not started',
  'in_progress': 'In progress',
  'read': 'Lesson read',
  'knowledge_check_passed': 'Knowledge check passed',
  'practice_completed': 'Practice completed',
  'skill_demonstrated': 'Skill self-assessed'
};

function statusOf(id) {
  return statusLabels[moduleState(id).status] || 'Not started';
}

const practiced = id => ['practice_completed', 'skill_demonstrated'].includes(moduleState(id).status);

function metadata(item){
  const description=item?`${item.title}: outcomes, practice, and an applied knowledge check in Sales Mastery.`:'A role-based, practice-driven sales curriculum.';
  if(!document.querySelector('meta[name="description"]')){const meta=document.createElement('meta');meta.name='description';meta.content=description;document.head.appendChild(meta)}
  [['og:title',document.title],['og:description',description],['og:type','website']].forEach(([property,content])=>{if(!document.querySelector(`meta[property="${property}"]`)){const meta=document.createElement('meta');meta.setAttribute('property',property);meta.content=content;document.head.appendChild(meta)}})
}

function accessibility(){
  if(!document.querySelector('.skip-link')){const skip=document.createElement('a');skip.className='skip-link';skip.href='#main-content';skip.textContent='Skip to main content';document.body.prepend(skip)}
  const main=document.querySelector('article.content')||document.querySelector('main')||document.querySelector('.hero');if(main&&!main.id)main.id='main-content';
  document.querySelectorAll('.topbar-nav a').forEach(link=>{const here=link.getAttribute('href')===location.pathname.split('/').pop()||(currentId()&&link.textContent.trim()==='Modules');link.classList.toggle('active',!!here);if(here)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')});
  const language=document.getElementById('langToggle');if(language){language.setAttribute('aria-label','Switch language between English and Arabic');language.setAttribute('aria-pressed',document.documentElement.lang==='ar'?'true':'false')}
  document.querySelector('.back-to-top')?.setAttribute('aria-label','Back to top')
}

function disclosures(){
  document.querySelectorAll('.accordion-trigger').forEach((trigger,index)=>{const panel=trigger.nextElementSibling;if(!panel)return;trigger.id||=`accordion-trigger-${index+1}`;panel.id||=`accordion-panel-${index+1}`;trigger.setAttribute('aria-controls',panel.id);panel.setAttribute('role','region');panel.setAttribute('aria-labelledby',trigger.id)});
  document.querySelectorAll('.tabs').forEach((tabs,group)=>{tabs.setAttribute('role','tablist');const buttons=tabs.querySelectorAll('.tab-btn'),panels=tabs.querySelectorAll('.tab-panel');buttons.forEach((button,index)=>{button.id||=`tab-${group+1}-${index+1}`;if(!panels[index])return;panels[index].id||=`tab-panel-${group+1}-${index+1}`;button.setAttribute('aria-controls',panels[index].id);panels[index].setAttribute('role','tabpanel');panels[index].setAttribute('aria-labelledby',button.id)})})
}

function learningPanel(item){
  const header=document.querySelector('.page-header');if(!header||document.querySelector('.learning-panel'))return;
  const saved=bookmarks(),panel=document.createElement('section');panel.className='learning-panel';panel.id='learning-outcomes';panel.setAttribute('aria-labelledby','learning-title');
  panel.innerHTML=`<div class="learning-panel-head"><div><span class="section-kicker">Learning contract</span><h2 id="learning-title">Know what good looks like.</h2></div><button class="bookmark-btn" type="button" aria-pressed="${saved.includes(item.id)}">${saved.includes(item.id)?'★ Bookmarked':'☆ Bookmark'}</button></div><div class="learning-grid"><div><h3>By the end, you can</h3><ul>${item.objectives.map(value=>`<li>${value}</li>`).join('')}</ul></div><div><h3>Evidence of learning</h3><p>Produce a <strong>${item.artifact.toLowerCase()}</strong> you can use or review at work.</p><div class="learning-tags"><span>${item.level}</span><span>${item.time} min lesson + practice</span>${item.paths.map(path=>`<span>${paths[path][0]}</span>`).join('')}</div></div></div>`;
  header.insertAdjacentElement('afterend',panel);
  const meta=header.querySelector('.meta-strip span:first-child');if(meta)meta.textContent=`${item.time} min lesson + practice`;
  panel.querySelector('.bookmark-btn').addEventListener('click',event=>{let state=bookmarks(),selected=state.includes(item.id);state=selected?state.filter(id=>id!==item.id):[...state,item.id];write('salesMasteryBookmarks',state);event.currentTarget.setAttribute('aria-pressed',String(!selected));event.currentTarget.textContent=!selected?'★ Bookmarked':'☆ Bookmark'})
}

function researchNote(item){
  const article=document.querySelector('article.content'),entry=research[item.id];if(!article||!entry||document.querySelector('.research-note'))return;
  const section=document.createElement('section');section.className='research-note';section.id='research-note';
  section.innerHTML=`<div class="section-kicker">Evidence update · ${entry.status}</div><h2>Research note: what the evidence supports</h2><p>${entry.summary}</p><h3>Put it into practice</h3><ul>${entry.actions.map(action=>`<li>${action}</li>`).join('')}</ul><h3>Sources</h3><ul>${entry.sources.map(source=>`<li><a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.title}</a></li>`).join('')}</ul><p><small>Frameworks organize practice; they do not guarantee outcomes. Measure results in your market and follow the law in your jurisdiction.</small></p>`;
  article.appendChild(section)
}

function studyTools(item){
  const article=document.querySelector('article.content');if(!article||document.querySelector('.study-tools'))return;
  const savedNotes=notes()[item.id]||'',state=moduleState(item.id),questions=assessments[item.id]||[{prompt:item.check[0],options:item.check[1],answer:item.check[2],explanation:item.check[3]}],section=document.createElement('section');
  const questionMarkup=questions.map((question,qIndex)=>`<fieldset class="checkpoint-question"><legend>${qIndex+1}. ${question.prompt}</legend>${question.options.map((option,oIndex)=>`<label><input type="radio" name="checkpoint-${item.id}-${qIndex}" value="${oIndex}"><span>${option}</span></label>`).join('')}<p class="question-feedback" role="status"></p></fieldset>`).join('');
  section.className='study-tools';section.id='practice-checkpoint';
  section.innerHTML=`<div class="section-kicker">Apply and retrieve</div><h2>Learning record</h2><p class="learning-state-summary" role="status" aria-live="polite">${statusOf(item.id)}</p><div class="checkpoint"><div class="checkpoint-set">${questionMarkup}</div><button type="button" class="check-answer">Check answers</button><p class="checkpoint-feedback ${state.knowledgeCheck.passed?'correct':''}" role="status" aria-live="polite">${state.knowledgeCheck.passed?`✓ Knowledge check passed · ${state.knowledgeCheck.score}/${questions.length}`:''}</p></div><div class="study-notes"><label for="module-notes"><span class="section-kicker">Private study notes</span><strong>Capture evidence, questions, and your next experiment.</strong></label><textarea id="module-notes" rows="7" placeholder="What will you apply? What evidence will tell you it worked?">${savedNotes.replace(/</g,'&lt;')}</textarea><p class="save-status" role="status" aria-live="polite">Saved on this device.</p></div><div class="mastery-action learning-actions"><div><span class="section-kicker">Module status</span><h3>Record separate evidence of learning.</h3><p><small>Practice and demonstration are self-assessed unless a teacher, manager, or peer reviews the artifact.</small></p></div><button type="button" class="mark-read">${state.lessonRead?'✓ Lesson read':'Mark lesson as read'}</button><button type="button" class="complete-practice">${state.practice.completed?'✓ Practice completed':'Mark practice completed'}</button><button type="button" class="record-demonstration" ${state.practice.completed?'':'disabled'}>${state.practice.selfAssessed?'✓ Skill self-assessed':'Self-assess skill demonstration'}</button></div>`;
  article.appendChild(section);
  
  const feedback=section.querySelector('.checkpoint-feedback'),summary=section.querySelector('.learning-state-summary'),readButton=section.querySelector('.mark-read'),practiceButton=section.querySelector('.complete-practice'),demonstrationButton=section.querySelector('.record-demonstration');
  
  const refresh=()=>{
    const next=moduleState(item.id);
    summary.textContent=statusOf(item.id);
    readButton.textContent=next.lessonRead?'✓ Lesson read':'Mark lesson as read';
    practiceButton.textContent=next.practice.completed?'✓ Practice completed':'Mark practice completed';
    demonstrationButton.disabled=!next.practice.completed;
    demonstrationButton.textContent=next.practice.selfAssessed?'✓ Skill self-assessed':'Self-assess skill demonstration';
  };
  
  section.querySelector('.check-answer').addEventListener('click',()=>{
    let score=0,answered=0;
    questions.forEach((question,qIndex)=>{
      const selected=section.querySelector(`input[name="checkpoint-${item.id}-${qIndex}"]:checked`),result=section.querySelectorAll('.question-feedback')[qIndex];
      if(!selected){result.textContent='Choose an answer, then retry.';return}
      answered++;
      const correct=Number(selected.value)===question.answer;
      if(correct)score++;
      result.textContent=`${correct?'✓ Strongest option.':'Not the strongest option.'} ${question.explanation}`;
      result.classList.toggle('correct',correct);
    });
    if(answered<questions.length){
      feedback.textContent=`Answer all ${questions.length} questions.`;
      return;
    }
    const passed=score>=Math.ceil(questions.length*.75);
    updateModule(item.id, m => {
      m.knowledgeCheck.passed = passed;
      m.knowledgeCheck.score = score;
      m.knowledgeCheck.total = questions.length;
      m.knowledgeCheck.attempts += 1;
    });
    feedback.textContent=`${passed?'✓ Knowledge check passed':'Review the explanations and retry'} · ${score}/${questions.length}`;
    feedback.classList.toggle('correct',passed);
    refresh();
  });
  
  readButton.addEventListener('click',()=>{
    updateModule(item.id, m => {
      m.lessonRead = !m.lessonRead;
    });
    refresh();
  });
  
  practiceButton.addEventListener('click',()=>{
    updateModule(item.id, m => {
      m.practice.completed = !m.practice.completed;
      if (!m.practice.completed) {
        m.practice.selfAssessed = false;
      }
    });
    refresh();
  });
  
  demonstrationButton.addEventListener('click',()=>{
    const next = moduleState(item.id);
    if(!next.practice.selfAssessed && !confirm('Record skill demonstration only after reviewing the completed artifact against the module rubric. Continue?')) return;
    updateModule(item.id, m => {
      m.practice.selfAssessed = !m.practice.selfAssessed;
    });
    refresh();
  });
  
  const textarea=section.querySelector('textarea');
  let timer;
  textarea.addEventListener('input',()=>{
    clearTimeout(timer);
    section.querySelector('.save-status').textContent='Saving…';
    timer=setTimeout(()=>{
      const saved=notes();
      saved[item.id]=textarea.value;
      write('salesMasteryNotes',saved);
      section.querySelector('.save-status').textContent='Saved on this device.';
    },350);
  });
}

function sidebar(){const aside=document.querySelector('.sidebar');if(!aside||aside.querySelector('.toc-toggle'))return;const title=aside.querySelector('.sidebar-title'),list=aside.querySelector('ul');if(!title||!list)return;const button=document.createElement('button');button.className='toc-toggle';button.type='button';button.textContent='In this module';button.setAttribute('aria-expanded','false');list.id||='module-contents';button.setAttribute('aria-controls',list.id);aside.insertBefore(button,title);title.classList.add('desktop-toc-title');button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!open));aside.classList.toggle('toc-open',!open)})}

function decorateCards(){
  document.querySelectorAll('.mod-card').forEach(card=>{
    const id=(card.getAttribute('href')?.match(/module-(\d+)\.html/)||[])[1],item=byId(id);
    if(!item)return;
    card.dataset.module=id;
    card.dataset.paths=item.paths.join(' ');
    card.dataset.search=`${item.title} ${item.objectives.join(' ')} ${item.paths.join(' ')}`.toLowerCase();
    
    // Check if progress is advanced enough to show completed UI style
    card.classList.toggle('completed', practiced(id));
    
    card.setAttribute('aria-label',`${item.title}. ${statusOf(id)}`);
    let status=card.querySelector('.state-tag');
    if(!status){
      status=document.createElement('span');
      status.className='state-tag';
      card.querySelector('.card-tags')?.appendChild(status);
    }
    status.textContent=statusOf(id);
  });
}

function homeProgress(path='all'){
  const done=modules.filter(item=>practiced(item.id));
  decorateCards();
  const count=document.getElementById('progressCount'),bar=document.getElementById('progressBar');
  if(count)count.textContent=done.length;
  if(bar){
    const percent=Math.round(done.length/stats.modules*100),track=bar.parentElement;
    bar.style.width=`${percent}%`;
    track.setAttribute('role','progressbar');
    track.setAttribute('aria-label','Course practice completion');
    track.setAttribute('aria-valuemin','0');
    track.setAttribute('aria-valuemax',String(stats.modules));
    track.setAttribute('aria-valuenow',String(done.length));
  }
  const pool=modules.filter(item=>path==='all'||item.paths.includes(path)||item.paths.includes('core')),next=pool.find(item=>!practiced(item.id)),cta=document.querySelector('.hero-cta');
  if(cta){
    cta.textContent=done.length?'Continue learning':'Start the course';
    cta.href=next?`module-${next.id}.html`:'exercises.html';
  }
}

function balanceModuleGrids(){document.querySelectorAll('.modules-grid').forEach(grid=>{const cards=[...grid.querySelectorAll('.mod-card')],visible=cards.filter(card=>!card.hidden);cards.forEach(card=>card.classList.remove('grid-wide'));if(visible.length%2===1)visible.at(-1)?.classList.add('grid-wide')})}

function navigator(){
  const section=document.querySelector('.modules-section');if(!section||document.querySelector('.pathfinder'))return;
  const nav=document.createElement('section');nav.className='pathfinder';nav.setAttribute('aria-labelledby','pathfinder-title');
  nav.innerHTML=`<div class="section-eyebrow">— Choose your route</div><h2 id="pathfinder-title">Start with the work you need to do.</h2><p>Every route includes the ethical core. Switch paths at any time; your learning record stays on this device.</p><div class="path-options">${Object.entries(paths).filter(([id])=>!['advanced','all'].includes(id)).map(([id,[label,description]])=>`<button type="button" data-path="${id}" aria-pressed="false"><strong>${label}</strong><span>${description}</span></button>`).join('')}<button type="button" data-path="all" aria-pressed="false"><strong>All modules</strong><span>Browse the complete curriculum.</span></button></div><div class="course-controls"><label class="course-search"><span>Search the curriculum</span><input id="courseSearch" type="search" placeholder="Try “negotiation”, “AI”, or “retention”"></label><label class="bookmark-filter"><input id="bookmarkFilter" type="checkbox"> Bookmarked only</label><button type="button" class="reset-progress">Clear learning status</button></div><p id="filterStatus" class="filter-status" role="status" aria-live="polite"></p>`;
  section.parentNode.insertBefore(nav,section);
  let selected=localStorage.getItem('salesMasteryPath')||'all';
  const search=nav.querySelector('#courseSearch'),only=nav.querySelector('#bookmarkFilter');
  
  const apply=()=>{
    const term=search.value.trim().toLowerCase(),saved=bookmarks();
    let visible=0;
    document.querySelectorAll('.mod-card[data-module]').forEach(card=>{
      const cardPaths=card.dataset.paths.split(' '),show=(selected==='all'||cardPaths.includes(selected)||cardPaths.includes('core'))&&(!term||card.dataset.search.includes(term))&&(!only.checked||saved.includes(card.dataset.module));
      card.hidden=!show;
      if(show)visible++;
    });
    document.querySelectorAll('.level-heading').forEach(heading=>{
      const promise=heading.nextElementSibling,grid=promise?.nextElementSibling,show=grid&&[...grid.querySelectorAll('.mod-card')].some(card=>!card.hidden);
      heading.hidden=!show;
      if(promise)promise.hidden=!show;
      if(grid)grid.hidden=!show;
    });
    balanceModuleGrids();
    nav.querySelector('#filterStatus').textContent=`Showing ${visible} of ${stats.modules} modules.`;
    homeProgress(selected);
  };
  
  nav.querySelectorAll('[data-path]').forEach(button=>{
    button.setAttribute('aria-pressed',String(button.dataset.path===selected));
    button.addEventListener('click',()=>{
      selected=button.dataset.path;
      localStorage.setItem('salesMasteryPath',selected);
      nav.querySelectorAll('[data-path]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
      apply();
    });
  });
  search.addEventListener('input',apply);
  only.addEventListener('change',apply);
  
  nav.querySelector('.reset-progress').addEventListener('click',()=>{
    if(!confirm('Clear module learning status? Notes, bookmarks, language, and path preferences will be kept.'))return;
    learningState={version:3,modules:{},migratedAt:new Date().toISOString()};
    write(STATE_KEY,learningState);
    location.reload();
  });
  decorateCards();
  apply();
}

function homeCapstones(){
  if(!document.querySelector('.modules-section')||document.querySelector('.capstone-section'))return;
  const target=document.querySelector('.pillars-section')||document.querySelector('footer');
  if(!target)return;
  const section=document.createElement('section');
  section.className='capstone-section';
  section.innerHTML=`<div class="section-eyebrow">— Demonstrate integrated work</div><h2>Four capstones built around realistic artifacts.</h2><div class="capstone-grid">${capstones.map(([id,title,brief])=>`<article><span>${paths[id][0]}</span><h3>${title}</h3><p>${brief}</p><a href="exercises.html#capstones">Open capstone brief →</a></article>`).join('')}</div>`;
  target.parentNode.insertBefore(section,target);
}

function exerciseCapstones(){
  if(!location.pathname.endsWith('exercises.html'))return;
  const article=document.querySelector('article.content');
  if(!article||document.getElementById('capstones'))return;
  const capstoneDetails={
    b2c:{
      objective:"Produce a complete B2C sales & conversion blueprint combining profile, messaging, objection handling, and retention experiments.",
      scenario:"A consumer brand is launching a new product line with high website traffic but low checkout conversion and weak repeat purchases.",
      inputs:"Customer profile data, existing landing page URL/copy, product feature list, customer feedback logs.",
      rubric:"Buyer relevance (25%), Messaging clarity & value prop (30%), Objection & retention strategy (25%), Measurement & ethics (20%).",
      variations:"<strong>Beginner:</strong> Focus on single product page critique, 1 in-person opener, and 3 top objections. | <strong>Advanced:</strong> Build an omnichannel buyer journey including post-purchase onboarding, win-back sequence, and retention metrics."
    },
    enterprise:{
      objective:"Build an enterprise deal strategy and buyer consensus package to navigate complex buying committees and procurement.",
      scenario:"Selling a €150k/yr SaaS platform to a 1,000-person enterprise with 6 decision makers across IT, Security, Finance, and Operations.",
      inputs:"Account background, stakeholder personas, champion interview notes, technical requirements, competitor comparison.",
      rubric:"Account mapping & stakeholder coverage (30%), Economic business case & evidence (25%), Demo & mutual action plan (25%), Risk mitigation & ethics (20%).",
      variations:"<strong>Beginner:</strong> Map 3 key stakeholders and produce a 1-page business case and discovery brief. | <strong>Advanced:</strong> Complete full deal room portfolio including mutual action plan, security evidence grid, procurement concession strategy, and executive sponsor deck."
    },
    founder:{
      objective:"Execute a 0-to-1 outbound and design-partner acquisition process to secure the first 10 paying customers for an early-stage venture.",
      scenario:"Early-stage B2B software startup with zero brand awareness, no dedicated sales team, and an unproven pricing model seeking early adopters.",
      inputs:"ICP target criteria, value hypothesis, draft email sequence templates, interview scripts, product demo outline.",
      rubric:"ICP definition & market signal (25%), Outbound & interview execution (30%), Offer structure & proof strategy (25%), Iteration & learning cadence (20%).",
      variations:"<strong>Beginner:</strong> Define ICP, write 3-touch cold email sequence, and run 5 customer discovery interviews. | <strong>Advanced:</strong> Execute campaign securing 3 paid design partners, validate 2 pricing tiers, and document a scalable sales playbook."
    },
    leader:{
      objective:"Design a comprehensive sales management framework covering hiring, pipeline review, coaching, and performance management.",
      scenario:"A growing sales team of 8 reps is missing targets due to inconsistent discovery quality, lumpy pipeline forecasting, and lack of structured coaching.",
      inputs:"Rep quota attainment data, win/loss conversion rates, call recording samples, pipeline velocity metrics.",
      rubric:"Hiring & competency scorecard (25%), Cadence & forecasting accuracy (25%), Coaching framework & skill improvement (30%), Systemic enablement & metrics (20%).",
      variations:"<strong>Beginner:</strong> Create a rep hiring rubric, 1-on-1 coaching template, and bi-weekly pipeline review agenda. | <strong>Advanced:</strong> Implement full manager operating cadence including skills matrix, rep ramp plan, forecast variance model, and enablement experiment."
    }
  };
  const section=document.createElement('section');
  section.id='capstones';
  section.className='capstone-briefs';
  section.innerHTML=`<div class="section-kicker">Integrated assessment</div><h2>Capstone projects</h2><p>Choose the project closest to your work. Use real or clearly fictionalized data. Completion is not professional certification; ask a peer or manager to review the artifact where possible.</p>${capstones.map(([id,title,brief])=>{
    const d=capstoneDetails[id]||{};
    return `<article class="capstone-brief"><span>${paths[id]?.[0]||id}</span><h3>${title}</h3><p>${brief}</p><p><strong>Objective:</strong> ${d.objective||''}</p><p><strong>Scenario:</strong> ${d.scenario||''}</p><p><strong>Inputs:</strong> ${d.inputs||''}</p><p><strong>Rubric:</strong> ${d.rubric||''}</p><p><strong>Variations:</strong> ${d.variations||''}</p><h4>Required evidence</h4><ul><li>Buyer or account context and assumptions</li><li>Decisions tied to relevant course modules</li><li>One tested script, message, or workflow</li><li>Risks, ethical constraints, and disconfirming evidence</li><li>A 30-day implementation and measurement plan</li></ul></article>`;
  }).join('')}<div class="rubric"><h3>Shared scoring rubric</h3><div><span>Evidence & accuracy <strong>30%</strong></span><span>Buyer relevance <strong>25%</strong></span><span>Execution quality <strong>25%</strong></span><span>Ethics & reflection <strong>20%</strong></span></div><p>Suggested self-assessment threshold: 70/100 overall and no score below 50% in ethics and reflection. This is not certification.</p></div>`;
  article.appendChild(section);
  if(location.hash==='#capstones')requestAnimationFrame(()=>section.scrollIntoView());
}

function init(){
  const id=currentId(),item=byId(id);
  metadata(item);
  accessibility();
  disclosures();
  if(item){
    updateModule(id, m => {
      // Opening a module only marks it as in_progress if it was not_started.
      // It does NOT grant 'read' or higher.
    });
    document.title=`Module ${item.id} · ${item.title} — Sales Mastery`;
    learningPanel(item);
    researchNote(item);
    studyTools(item);
    sidebar();
  }else{
    decorateCards();
    navigator();
    homeCapstones();
    exerciseCapstones();
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
document.addEventListener('keydown',event=>{if(!event.target.classList?.contains('tab-btn')||!['Home','End'].includes(event.key))return;const tabs=[...event.target.closest('.tabs').querySelectorAll('.tab-btn')];event.preventDefault();const target=event.key==='Home'?tabs[0]:tabs.at(-1);target.click();target.focus()});
})();
