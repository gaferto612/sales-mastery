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
      title:"B2C conversion sprint",
      badge:"Practice portfolio item",
      statusLabel:"Capstone completed (Self-assessed)",
      scenario:"A D2C ergonomic workspace brand with 120,000 monthly website visits faces a 1.2% checkout conversion rate and 8% 90-day repeat purchase rate. Paid ad acquisition costs have risen 35%, making paid channels unprofitable without improving conversion and customer lifetime value.",
      learnerRole:"Lead E-Commerce & B2C Sales Growth Consultant.",
      customerContext:"Mid-career remote knowledge workers experiencing physical posture fatigue; product price point €180–€450; primary traffic from social ad campaigns and organic search.",
      availableEvidence:"Google Analytics conversion funnel drop-off logs, 50 recorded user session replays, post-purchase survey responses (N=240), competitor landing page tear-downs, and customer support ticket transcripts.",
      missingInformation:"Quantitative data on exact checkout step drop-off causes (mobile payment gateway vs hidden shipping fee friction), customer willingness-to-pay for bundled accessories, and post-purchase onboarding email open rates.",
      constraints:"Must deliver recommendations within a €5,000 implementation budget, zero changes to core product manufacturing, and full compliance with GDPR/ePrivacy consent regulations.",
      requiredAssumptions:"Assume customer support response times remain under 4 hours, website traffic volume stays stable over the next 90 days, and logistics delivery windows remain 3–5 business days.",
      deliverables:"Ideal Customer Profile (ICP) & persona map, Value proposition matrix & hero copy critique, Live-chat/in-person opening script & objection handling matrix, Post-purchase retention experiment & email sequence design, 30-day implementation & measurement roadmap.",
      evaluationRubric:"Buyer relevance & empathy (25%), Value proposition & messaging clarity (30%), Objection & retention strategy (25%), Ethics & measurement rigor (20%). Passing threshold: >=70% overall with no dimension <50%.",
      beginnerVersion:"Focus on single product page copy critique, 1 live-chat opening script, and objection responses for top 3 customer hesitations.",
      advancedVersion:"Build an end-to-end B2C conversion & retention engine including pre-purchase interactive quiz, post-purchase onboarding workflow, win-back sequence, and 90-day LTV simulation model.",
      partialStrongSubmission:"\"Customer Profile: 'Desk-Bound Knowledge Worker' (Age 28-45). Primary Pain: Lower back fatigue after 6+ hours of remote desk work. Unaddressed Concern: 'Will this fit my small home office setup without complex assembly?' Solution Opener: 'Rather than listing desk dimensions, replace the hero banner with a 15-second video showing unboxing-to-setup in under 3 minutes, paired with a 30-day risk-free trial guarantee.'\"",
      selfAssessmentQuestions:"1. Did your value proposition isolate a specific customer struggle rather than listing generic product specifications? 2. How did your objection script distinguish between price sensitivity and lack of risk mitigation? 3. What disconfirming metric would prove your retention experiment failed?",
      relatedModules:'<a class="module-ref" href="module-01.html"><em>Module 1</em></a>, <a class="module-ref" href="module-03.html"><em>Module 3</em></a>, <a class="module-ref" href="module-05.html"><em>Module 5</em></a>, <a class="module-ref" href="module-09.html"><em>Module 9</em></a>, <a class="module-ref" href="module-11.html"><em>Module 11</em></a>',
      riskAnalysis:"False scarcity or fake countdown timers destroy brand trust; dark patterns in checkout violate consumer protection laws; over-promising ergonomic health outcomes risks regulatory compliance issues."
    },
    enterprise:{
      title:"Enterprise deal room",
      badge:"Practice portfolio item",
      statusLabel:"Capstone completed (Self-assessed)",
      scenario:"Selling a €150k/year enterprise B2B workflow & compliance software platform to a 1,200-employee financial services firm. The sales cycle has reached month 4 with 6 distinct stakeholders across IT, Cyber Security, Legal, Procurement, Operations, and Business Leadership.",
      learnerRole:"Enterprise Account Executive (AE) / Commercial Lead.",
      customerContext:"Heavily regulated financial institution using legacy premise software; experiencing operational audit delays costing €400k annually; high security governance and strict vendor onboarding requirements.",
      availableEvidence:"Champion interview transcripts, IT security questionnaire (80 questions), technical architecture diagram, competitor ROI slide deck, past 3-year audit findings report.",
      missingInformation:"True economic buyer decision criteria, internal political dynamics between IT and Business Ops, legal liability cap limits, and budget allocation timeline for the upcoming fiscal quarter.",
      constraints:"Must achieve SOC 2 Type II compliance validation, adhere to a strict 90-day deal registration window, and operate within a 12% maximum discount governance policy.",
      requiredAssumptions:"Procurement will mandate a legal redline review cycle, executive sponsorship requires a quantified NPV business case, and implementation drag must not exceed 30 engineering hours.",
      deliverables:"Stakeholder account map & 2x2 influence grid, Discovery brief & diagnostic question plan, Security & compliance evidence grid, Economic business case & payback model, Mutual Action Plan (MAP) storyboard, Negotiation give-get trade sheet.",
      evaluationRubric:"Account mapping & consensus coverage (30%), Economic business case & evidence rigor (25%), Demo storyboard & Mutual Action Plan (25%), Risk mitigation & ethical contracting (20%). Passing threshold: >=70% overall with no dimension <50%.",
      beginnerVersion:"Map 3 core stakeholders (Champion, IT, Economic Buyer), produce a 1-page executive summary business case, and draft a 5-step Mutual Action Plan.",
      advancedVersion:"Complete full enterprise deal room package: 6-stakeholder map, 3-year NPV cash flow model with 2D sensitivity matrix, SOC 2 compliance mapping, legal redline trade log, and executive alignment deck.",
      partialStrongSubmission:"\"Economic Business Case: 'The current manual compliance audit requires 1,200 staff hours per quarter @ €85/hr (€408k/yr). Platform automation reduces audit prep time by 65%, generating €265k annual savings. At €150k ARR, Payback is achieved in Month 6.8 with a 3-year NPV of €412k at an 8% discount rate. Sensitivity analysis shows payback remains under 10 months even if audit efficiency gains drop to 40%.'\"",
      selfAssessmentQuestions:"1. Have you identified an Economic Buyer with budget authority, or are you relying solely on a friendly Champion? 2. How does your Mutual Action Plan bind both buyer and seller to verifiable milestone dates? 3. What tradeable concessions have you prepared to defend price against procurement discounting pressure?",
      relatedModules:'<a class="module-ref" href="module-06.html"><em>Module 6</em></a>, <a class="module-ref" href="module-23.html"><em>Module 23</em></a>, <a class="module-ref" href="module-24.html"><em>Module 24</em></a>, <a class="module-ref" href="module-34.html"><em>Module 34</em></a>, <a class="module-ref" href="module-36.html"><em>Module 36</em></a>, <a class="module-ref" href="module-37.html"><em>Module 37</em></a>',
      riskAnalysis:"Single-threaded deals stall when champions leave; over-committing custom features damages engineering roadmap; discounting without getting term commitments erodes gross margin."
    },
    founder:{
      title:"First ten customers",
      badge:"Practice portfolio item",
      statusLabel:"Capstone completed (Self-assessed)",
      scenario:"An early-stage B2B SaaS startup with zero brand awareness, no dedicated sales team, and $15k monthly burn is seeking its first 10 paying design partners for a developer automation tool.",
      learnerRole:"Founder / CEO carrying the primary sales motion.",
      customerContext:"Engineering leads and CTOs at Series A/B tech startups (50-200 employees); high technical skepticism; overwhelmed by vendor cold outreach.",
      availableEvidence:"Product demo video recording, technical documentation, list of 100 ICP target accounts on LinkedIn, preliminary user feedback from 5 free beta testers.",
      missingInformation:"Willingness-to-pay threshold for commercial software vs open-source alternatives, exact buyer job title responsible for software budget, and primary channel for reaching engineering leaders.",
      constraints:"Zero marketing budget, sales cycle must close within 45 days, founder can dedicate maximum 15 hours/week to outbound sales.",
      requiredAssumptions:"The product MVP is functional for core use cases, setup takes under 30 minutes, and founders can offer direct 1-on-1 slack channel support to early design partners.",
      deliverables:"ICP definition & market signal diagnostic, Customer discovery interview script & question bank, 3-touch outbound cold outreach email sequence, Design-partner offer package & pricing hypothesis, Customer proof plan & learning dashboard.",
      evaluationRubric:"ICP definition & market signal clarity (25%), Outbound message relevance & interview rigor (30%), Offer packaging & proof plan (25%), Learning velocity & iteration discipline (20%). Passing threshold: >=70% overall with no dimension <50%.",
      beginnerVersion:"Define ICP, write a 3-email cold outreach campaign, and execute 5 customer discovery interviews.",
      advancedVersion:"Complete full 0-to-1 playbook: ICP qualification matrix, 15 discovery call tear-downs, paid design-partner agreement framework ($500/mo setup + feedback SLA), pricing validation model, and scalable outbound playbook.",
      partialStrongSubmission:"\"Design Partner Offer: 'Instead of offering a free pilot, we invite 5 Series A CTOs to join as Paid Design Partners at $500/month. In exchange, they receive priority feature requests, weekly founder engineering office hours, and a guaranteed 50% discount on commercial launch pricing. This filters out curiosity seekers and validates actual budget commitment.'\"",
      selfAssessmentQuestions:"1. Did your outreach message pitch product features or focus on a specific, observable engineering bottleneck? 2. How did you test willingness-to-pay without resorting to un-monetized free trials? 3. What feedback signals indicate your ICP definition is too broad?",
      relatedModules:'<a class="module-ref" href="module-02.html"><em>Module 2</em></a>, <a class="module-ref" href="module-04.html"><em>Module 4</em></a>, <a class="module-ref" href="module-07.html"><em>Module 7</em></a>, <a class="module-ref" href="module-08.html"><em>Module 8</em></a>, <a class="module-ref" href="module-13.html"><em>Module 13</em></a>, <a class="module-ref" href="module-15.html"><em>Module 15</em></a>',
      riskAnalysis:"Customizing the core product for one noisy design partner creates a dead-end product; offering free pilots yields false usage signals; aggressive cold outreach burns domain reputation."
    },
    leader:{
      title:"Manager operating system",
      badge:"Practice portfolio item",
      statusLabel:"Capstone completed (Self-assessed)",
      scenario:"A mid-market B2B software company with 8 Account Executives (AEs) and 2 SDRs has missed revenue targets for 2 consecutive quarters. Win rates have dropped from 28% to 19%, forecast variance is +/-35%, rep ramp time is 8 months, and discovery call quality is inconsistent.",
      learnerRole:"VP of Sales / Sales Operations & Enablement Director.",
      customerContext:"Enterprise mid-market buyers facing economic budget scrutiny; sales team selling across 3 distinct sub-verticals without standardized playbooks.",
      availableEvidence:"CRM pipeline stage reports, rep quota attainment history, 20 recorded Gong/Chorus discovery call recordings, win/loss audit survey results, existing comp plan documents.",
      missingInformation:"Root cause of deal slippage (rep discovery skill vs buyer budget freezes), individual AE competency gaps, and accuracy of stage-exit criteria in CRM.",
      constraints:"No increase in sales headcount budget, comp plan changes can only take effect next quarter, manager time dedicated to coaching capped at 8 hours/week per rep.",
      requiredAssumptions:"Product-market fit is established in core verticals, lead flow remains constant, and current AE base possesses basic sales baseline skills.",
      deliverables:"Structured rep hiring scorecard & BARS evaluation rubric, Forecast governance framework & Brier score calibration model, Pipeline review agenda & stage-gate exit criteria dictionary, 1-on-1 coaching framework & call review rubric, 30-60-90 day practice-based onboarding matrix, Enablement experiment & telemetry dashboard.",
      evaluationRubric:"Hiring scorecard & competency framework (25%), Forecast calibration & pipeline discipline (25%), Coaching framework & behavior rubric (30%), Enablement system & telemetry design (20%). Passing threshold: >=70% overall with no dimension <50%.",
      beginnerVersion:"Create rep hiring scorecard, 1-on-1 coaching template, and weekly pipeline review agenda.",
      advancedVersion:"Build full Manager Operating Cadence: rep competency matrix across 8 dimensions, 30-60-90 onboarding gate system with work-sample certifications, forecast variance model, call recording audit framework, and comp plan guardrail design.",
      partialStrongSubmission:"\"Coaching Framework: 'Replace vague pipeline reviews with a 4-dimension call audit rubric (Diagnostic Probing, Consensus Building, Commercial Defense, Next Steps). Managers review 1 call per rep bi-weekly using BARS scoring (1-5 scale). Reps scoring <3 on Diagnostic Probing undergo 2 mandatory roleplay practice sessions before attending live enterprise meetings.'\"",
      selfAssessmentQuestions:"1. Does your management cadence measure activity volume (vanity) or observable skill execution and buyer evidence? 2. How does your forecast model eliminate rep 'happy ears' and unverified close dates? 3. What guardrails in your comp plan prevent reps from discounting margin to hit short-term quotas?",
      relatedModules:'<a class="module-ref" href="module-35.html"><em>Module 35</em></a>, <a class="module-ref" href="module-38.html"><em>Module 38</em></a>, <a class="module-ref" href="module-39.html"><em>Module 39</em></a>, <a class="module-ref" href="module-40.html"><em>Module 40</em></a>, <a class="module-ref" href="module-41.html"><em>Module 41</em></a>, <a class="module-ref" href="module-42.html"><em>Module 42</em></a>',
      riskAnalysis:"Over-monitoring creates rep disengagement; rigid forecasting gates without seller coaching leads to CRM sandbagging; changing comp plans mid-year destroys team trust."
    }
  };
  const section=document.createElement('section');
  section.id='capstones';
  section.className='capstone-briefs';
  section.innerHTML=`
    <div class="section-kicker">Integrated assessment · Practice portfolio item</div>
    <h2>Capstone projects</h2>
    <div class="callout non-accreditation-disclaimer" style="margin-bottom: 24px; border-left: 4px solid var(--orange); background: var(--surface-subtle); padding: 16px;">
      <div class="callout-label" style="font-weight: bold; margin-bottom: 4px;">Non-Accreditation Disclosure</div>
      <p style="margin: 0; font-size: 14px;">Completion of these capstones produces self-assessed practice portfolio items. They are designed for self-directed skill application and peer/manager review. Completion does NOT constitute formal, academic, or professional certification.</p>
    </div>
    ${capstones.map(([id,briefTitle,briefSummary])=>{
      const d=capstoneDetails[id]||{};
      return `
        <article class="capstone-brief" id="capstone-${id}" style="margin-bottom: 36px; padding: 24px; border: 1px solid var(--border); border-radius: 8px;">
          <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
            <span class="capstone-tag" style="background: var(--surface-subtle); padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${paths[id]?.[0]||id}</span>
            <span class="capstone-tag" style="background: var(--surface-subtle); padding: 2px 8px; border-radius: 4px; font-size: 12px;">${d.badge||'Practice portfolio item'}</span>
            <span class="capstone-tag" style="background: var(--surface-subtle); padding: 2px 8px; border-radius: 4px; font-size: 12px; color: var(--text-muted);">${d.statusLabel||'Capstone completed (Self-assessed)'}</span>
            <span class="capstone-tag" style="background: var(--surface-subtle); padding: 2px 8px; border-radius: 4px; font-size: 12px; color: var(--text-muted);">Artifact self-assessed</span>
          </div>
          <h3 style="margin-top: 0;">${d.title||briefTitle}</h3>
          <p class="capstone-summary"><strong>Summary:</strong> ${briefSummary}</p>
          <p><strong>1. Learner Role:</strong> ${d.learnerRole||''}</p>
          <p><strong>2. Scenario:</strong> ${d.scenario||''}</p>
          <p><strong>3. Customer Context:</strong> ${d.customerContext||''}</p>
          <p><strong>4. Available Evidence:</strong> ${d.availableEvidence||''}</p>
          <p><strong>5. Missing Information:</strong> ${d.missingInformation||''}</p>
          <p><strong>6. Constraints:</strong> ${d.constraints||''}</p>
          <p><strong>7. Required Assumptions:</strong> ${d.requiredAssumptions||''}</p>
          <p><strong>8. Deliverables:</strong> ${d.deliverables||''}</p>
          <p><strong>9. Evaluation Rubric:</strong> ${d.evaluationRubric||''}</p>
          <p><strong>10. Beginner Version:</strong> ${d.beginnerVersion||''}</p>
          <p><strong>11. Advanced Version:</strong> ${d.advancedVersion||''}</p>
          <p><strong>12. Partial Strong Submission Excerpt:</strong> <em>${d.partialStrongSubmission||''}</em></p>
          <p><strong>13. Self-Assessment Questions:</strong> ${d.selfAssessmentQuestions||''}</p>
          <p><strong>14. Related Modules:</strong> ${d.relatedModules||''}</p>
          <p><strong>15. Risk Analysis:</strong> ${d.riskAnalysis||''}</p>
        </article>
      `;
    }).join('')}
    <div class="rubric" style="margin-top: 24px;">
      <h3>Shared scoring rubric (Self-Assessed)</h3>
      <div><span>Evidence & accuracy <strong>30%</strong></span><span>Buyer relevance <strong>25%</strong></span><span>Execution quality <strong>25%</strong></span><span>Ethics & reflection <strong>20%</strong></span></div>
      <p>Suggested self-assessment threshold: 70/100 overall and no score below 50% in ethics and reflection. Artifacts are self-assessed portfolio items; this is not professional accreditation.</p>
    </div>
  `;
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
