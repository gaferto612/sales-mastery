import fs from 'node:fs';
import vm from 'node:vm';

const context = {window: {}};
vm.createContext(context);
vm.runInContext(fs.readFileSync('course-data.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('research-data.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('assessment-data.js', 'utf8'), context);

const {modules, paths, capstones, research, assessments, levels, stats} = context.window.SALES_MASTERY;
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const count = (text, pattern) => [...text.matchAll(pattern)].length;
const moduleFile = id => `module-${String(id).padStart(2, '0')}.html`;

/* Depth floor for the rebuilt curriculum. Every module must carry a full
   lesson, a worked example, a scored practice brief, and a knowledge check —
   which no module below this length can do. */
const MIN_MODULE_WORDS = 1800;

const distAssessmentPath = 'dist/static/assessment-data.js';
assert(fs.existsSync(distAssessmentPath), `${distAssessmentPath} does not exist`);

if (fs.existsSync(distAssessmentPath)) {
  const rootAssessmentBuffer = fs.readFileSync('assessment-data.js');
  const distAssessmentBuffer = fs.readFileSync(distAssessmentPath);
  assert(
    rootAssessmentBuffer.equals(distAssessmentBuffer),
    'dist/static/assessment-data.js is not byte-for-byte identical to root assessment-data.js'
  );

  const distContext = { window: { SALES_MASTERY: {} } };
  vm.createContext(distContext);
  try {
    vm.runInContext(distAssessmentBuffer.toString('utf8'), distContext);
    assert(
      distContext.window.SALES_MASTERY &&
      distContext.window.SALES_MASTERY.assessments &&
      typeof distContext.window.SALES_MASTERY.assessments === 'object' &&
      Object.keys(distContext.window.SALES_MASTERY.assessments).length > 0,
      'dist/static/assessment-data.js did not populate window.SALES_MASTERY.assessments'
    );
  } catch (err) {
    assert(false, `dist/static/assessment-data.js failed VM execution: ${err.message}`);
  }
}

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
  const questions = assessments[module.id];
  assert(
    Array.isArray(questions) && questions.length >= 3 && questions.length <= 5,
    `Module ${module.id} is missing required assessment questions (expected 3-5)`
  );
  for (const [index, question] of (questions ?? []).entries()) {
    const where = `Module ${module.id} question ${index + 1}`;
    assert(typeof question.prompt === 'string' && question.prompt.length > 20, `${where} has no usable prompt`);
    assert(Array.isArray(question.options) && question.options.length === 3, `${where} must offer exactly three options`);
    assert(new Set(question.options).size === 3, `${where} repeats an option`);
    assert(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 3, `${where} has an out-of-range answer index`);
    assert(typeof question.explanation === 'string' && question.explanation.length > 20, `${where} has no usable explanation`);
  }
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
  assert(html.includes('id="practice"'), `${file} has no practice section`);
  assert(html.includes('id="knowledge-check"'), `${file} has no applied knowledge check`);
  /* Continuity spine: every module applies its framework to the same running
     deal, names a specific failure mode with its mechanism, and gives the
     learner a rubric to grade the artifact's quality rather than its existence. */
  assert(html.includes('id="brayford"'), `${file} has no "Applied to the Brayford deal" case-thread box`);
  assert(html.includes('id="failure-mode"'), `${file} has no "Where this fails" section`);
  assert(/class="mechanism"/.test(html), `${file} states a failure mode without naming its mechanism`);
  assert(html.includes('Artifact quality rubric'), `${file} has no artifact quality rubric`);
  assert(/class="artifact-rubric"/.test(html), `${file} rubric is not in the gradeable table wrapper`);
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  assert(words >= MIN_MODULE_WORDS, `${file} is below the depth floor (${words} words, minimum ${MIN_MODULE_WORDS})`);
  if (module.id < stats.modules - 1) {
    assert(html.includes(moduleFile(Number(module.id) + 1)), `${file} next-module link is wrong`);
  }
}

/* The course takes an explicit, arguable stance in a handful of places, and
   each one must state the counter-argument rather than assert into a vacuum. */
const positionModules = modules
  .map(module => moduleFile(module.id))
  .filter(file => fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes('callout position'));
assert(positionModules.length >= 5, `Expected at least five stated course positions, found ${positionModules.length}`);
for (const file of positionModules) {
  const html = fs.readFileSync(file, 'utf8');
  assert(html.includes("The course's position"), `${file} states a position without labelling it as the course's opinion`);
  assert(/class="counter"/.test(html), `${file} states a position without acknowledging the counter-argument`);
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
/* Every drill must say why it reinforces its module, not merely which one. */
assert(
  count(exercises, /class="drill-why"/g) === stats.drills,
  `Only ${count(exercises, /class="drill-why"/g)} of ${stats.drills} drills explain what they reinforce`
);
for (const match of exercises.matchAll(/<div class="drill-meta">([\s\S]*?)<\/div>/g)) {
  assert(/href="module-\d{2}\.html"/.test(match[1]), 'A drill has no linked module reference');
}

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
assert(learning.includes("m.started"), 'Legacy opens are not migrated safely to started');
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

/* The throughline runs both ways: a module points at the drill and case that
   practise it, and the deep links must land on anchors that actually exist. */
const modulesNamedByDrills = new Set(
  [...exercises.matchAll(/<div class="drill-meta">([\s\S]*?)<\/div>/g)]
    .flatMap(match => [...match[1].matchAll(/href="(module-\d{2}\.html)"/g)].map(href => href[1]))
);
const modulesNamedByCases = new Set(
  [...cases.matchAll(/class="module-ref" href="(module-\d{2}\.html)"/g)].map(match => match[1])
);
for (const module of modules) {
  const file = moduleFile(module.id);
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/href="exercises\.html#(drill-\d+)"/g)) {
    assert(exercises.includes(`id="${match[1]}"`), `${file} deep-links to missing exercise anchor #${match[1]}`);
  }
  for (const match of html.matchAll(/href="case-studies\.html#(case-\d+)"/g)) {
    assert(cases.includes(`id="${match[1]}"`), `${file} deep-links to missing case anchor #${match[1]}`);
  }
  /* If a drill or case names this module, the module must point back. */
  if (modulesNamedByDrills.has(file) || modulesNamedByCases.has(file)) {
    assert(/class="practise-it"/.test(html), `${file} is referenced by a drill or case but does not link back`);
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

