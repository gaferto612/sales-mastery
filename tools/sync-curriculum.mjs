import fs from 'node:fs';
import vm from 'node:vm';

const context = { window: {} };
vm.runInNewContext(fs.readFileSync('course-data.js', 'utf8'), context);
const { modules, levels, stats } = context.window.SALES_MASTERY;
const byId = new Map(modules.map(module => [module.id, module]));

const cards = levels.map(level => {
  const items = level.modules.map(id => {
    const module = byId.get(id);
    if (!module) throw new Error(`Unknown module ${id} in ${level.id}`);
    return `    <a href="module-${id}.html" class="mod-card">
      <div class="mod-num">${id} · ${module.title}</div>
      <div class="mod-title">${module.artifact}</div>
      <div class="mod-desc">${module.objectives.join(' · ')}</div>
      <div class="card-tags"><span>${module.level}</span><span>${module.time} min</span></div>
      <div class="mod-arrow">→</div>
    </a>`;
  }).join('\n');
  return `  <h3 class="phase-heading level-heading"><span>${level.label}</span>${level.title}</h3>
  <p class="level-promise">${level.promise}</p>
  <div class="modules-grid">
${items}
  </div>`;
}).join('\n\n');

const curriculum = `<section class="modules-section">
  <div class="section-eyebrow">— The curriculum</div>
  <h2 class="section-heading">Forty-three modules, built to teach <em>and</em> to learn from.</h2>

  <div class="progress-container">
    <div class="progress-text"><span id="progressCount">0</span> / ${stats.modules} Practice Completed</div>
    <div class="progress-track">
      <div id="progressBar" class="progress-fill" style="width: 0%;"></div>
    </div>
  </div>

${cards}
</section>`;

const path = 'index.html';
let html = fs.readFileSync(path, 'utf8');
html = html.replace(
  /<section class="modules-section">[\s\S]*?<\/section>\s*(?=<section class="pillars-section">)/,
  `${curriculum}\n\n`
);
html = html
  .replace(/<div class="hero-meta-num">\d+<\/div>\s*<div class="hero-meta-label">Modules<\/div>/, `<div class="hero-meta-num">${stats.modules}</div>\n        <div class="hero-meta-label">Modules</div>`)
  .replace(/<div class="hero-meta-num">\d+<\/div>\s*<div class="hero-meta-label">Case studies<\/div>/, `<div class="hero-meta-num">${stats.cases}</div>\n        <div class="hero-meta-label">Case studies</div>`);
fs.writeFileSync(path, html);
