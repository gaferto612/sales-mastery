import fs from 'node:fs';
import vm from 'node:vm';

const context = {window: {}};
vm.createContext(context);
vm.runInContext(fs.readFileSync('course-data.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('research-data.js', 'utf8'), context);

const {modules, paths, capstones, research, levels, stats} = context.window.SALES_MASTERY;
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const count = (text, pattern) => [...text.matchAll(pattern)].length;
const moduleFile = id => `module-${String(id).padStart(2, '0')}.html`;

assert(modules.length === stats.modules, `Module source has ${modules.length}; stats says ${stats.modules}`);
assert(levels.length === stats.levels, `Level source has ${levels.length}; stats says ${stats.levels}`);
assert(Object.keys(paths).filter(key => !['all', 'advanced'].includes(key)).length === stats.rolePaths, `Role-path source does not match stats ()`);
assert(capstones.length === stats.capstones, `Capstone source has ${capstones.length}; stats says ${stats.capstones}`);
assert(new Set(modules.map(module => module.id)).size === stats.modules, 'Module IDs are not unique');
assert(modules.every((module, index) => Number(module.id) === index), 'Module IDs must be contiguous from 0');
assert(Object.keys(research).length === stats.modules, `Expected ${stats.modules} research notes, found ${Object.keys(research).length}`);

const levelIds = levels.flatMap(level => level.modules);
assert(levelIds.length === stats.modules, `Levels contain ${levelIds.length} placements, expected ${stats.modules}`);
assert(new Set(levelIds).size === stats.modules, 'A module appears in multiple levels');

for (const module of modules) {
  const file = moduleFile(module.id);
  assert(fs.existsSync(file), `Missing ${file}`);
  assert(levelIds.includes(module.id), `Module ${module.id} is absent from levels`);
  assert(research[module.id], `Missing research note for module ${module.id}`);
  assert(module.objectives?.length === 3, `Module ${module.id} needs three objectives`);
  assert(module.artifact, `Module ${module.id} has no artifact`);
  assert(module.check?.[1]?.length === 3, `Module ${module.id} checkpoint is malformed`);
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const titleNumber = html.match(/<title>Module\s+(\d+)/)?.[1];
  assert(titleNumber == null || Number(titleNumber) === Number(module.id), file + ' title says Module ' + titleNumber);
  assert(!html.includes('PhD Level Masterclass'), file + ' contains an inflated PhD-level label');
  assert(html.includes('script.js'), `${file} does not load the shared bootstrap`);
  assert(html.includes('article class="content"'), `${file} lacks the protected content layout`);
  if (module.id < stats.modules - 1) {
    assert(html.includes(moduleFile(Number(module.id) + 1)), `${file} next-module link is wrong`);
  }
}

const index = fs.readFileSync('index.html', 'utf8');
assert(index.includes(`${stats.modules} modules`), 'Homepage hero module count is stale');
assert(index.includes(`>${stats.modules}</div>`), 'Homepage metric module count is stale');
assert(index.includes(`<div class="hero-meta-num">${stats.cases}</div>`), "Homepage case count is stale");
assert(index.includes(`/ ${stats.modules} Practice Completed`), 'Homepage progress label is stale');
assert(!/Modules Mastered|mastered/i.test(index), 'Homepage still equates a lightweight check with mastery');
assert(count(index, /<a href="module-\d{2}\.html" class="mod-card">/g) === stats.modules, `Homepage does not contain exactly ${stats.modules} module cards`);
for (const module of modules) {
  assert(index.includes(`href="${moduleFile(module.id)}"`), `Homepage is missing module ${module.id}`);
}

const exercises = fs.readFileSync('exercises.html', 'utf8');
const drillNumbers = [...exercises.matchAll(/class="acc-num">(\d{2})</g)].map(match => Number(match[1]));
assert(new Set(drillNumbers).size === stats.drills, `Found ${new Set(drillNumbers).size} drills, expected ${stats.drills}`);
assert(exercises.includes('href="module-14.html" class="prev"'), 'Exercise footer AI link is not Module 14');
assert(!/<span class="drill-tag module">(?:Module|Modules) \d/.test(exercises), 'An exercise module reference is not linked');

const cases = fs.readFileSync('case-studies.html', 'utf8');
const caseIds = [...cases.matchAll(/\bid="case-(\d+)"/g)].map(match => Number(match[1]));
assert(new Set(caseIds).size === stats.cases, `Found ${new Set(caseIds).size} cases, expected ${stats.cases}`);
assert(!/<li><em>Module \d+<\/em>/.test(cases), 'A case-study module reference is not linked');
for (const match of cases.matchAll(/<a class="module-ref" href="module-(\d{2})\.html"><em>Module (\d+)<\/em><\/a>/g)) {
  assert(Number(match[1]) === Number(match[2]), `Case reference label/href mismatch: ${match[0]}`);
  assert(fs.existsSync(`module-${match[1]}.html`), `Case reference target is missing: module-${match[1]}.html`);
}

const learning = fs.readFileSync('learning.js', 'utf8');
const bootstrap = fs.readFileSync('script.js', 'utf8');
assert(learning.includes("const STATE_KEY='salesMasteryLearningState'"), 'Authoritative learning-state key is missing');
assert(learning.includes('function migrateState()'), 'Legacy-state migration is missing');
assert(learning.includes("started:true"), 'Legacy opens are not migrated safely to started');
assert(learning.includes('knowledgePassed'), 'Knowledge-check state is missing');
assert(learning.includes('practiceCompleted'), 'Practice-completed state is missing');
assert(learning.includes('demonstrated'), 'Skill-demonstrated state is missing');
assert(!bootstrap.includes('salesMasteryProgress'), 'Shared bootstrap still owns legacy progress state');

const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/href="([^"#?]+\.html)(?:#[^"]*)?"/g)) {
    assert(fs.existsSync(match[1]), `${file} links to missing ${match[1]}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  const moduleWords = modules
    .map(module => fs.readFileSync(moduleFile(module.id), 'utf8').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length)
    .reduce((sum, words) => sum + words, 0);
  console.log(JSON.stringify({
    modules: stats.modules,
    levels: stats.levels,
    paths: stats.rolePaths,
    drills: stats.drills,
    capstones: stats.capstones,
    cases: stats.cases,
    researchNotes: Object.keys(research).length,
    moduleWords,
    status: 'pass',
  }, null, 2));
}
