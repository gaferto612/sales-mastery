import fs from 'node:fs';
import vm from 'node:vm';

const dataSource = fs.readFileSync('course-data.js', 'utf8');
const learningSource = fs.readFileSync('learning.js', 'utf8');

function run(initialStorage, pathname = '/index.html') {
  const values = new Map(Object.entries(initialStorage).map(([key, value]) => [key, JSON.stringify(value)]));
  const localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
  const element = () => ({
    className: '',
    href: '',
    textContent: '',
    content: '',
    classList: {add() {}, remove() {}, toggle() {}},
    setAttribute() {},
  });
  const document = {
    readyState: 'complete',
    title: 'Test',
    body: {prepend() {}},
    head: {appendChild() {}},
    createElement: element,
    querySelector: () => null,
    getElementById: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
  };
  const context = {
    window: {},
    localStorage,
    location: {pathname, hash: ''},
    document,
    confirm: () => true,
    requestAnimationFrame: callback => callback(),
    setTimeout,
    clearTimeout,
  };
  vm.createContext(context);
  vm.runInContext(dataSource, context);
  vm.runInContext(learningSource, context);
  return Object.fromEntries([...values].map(([key, value]) => [key, JSON.parse(value)]));
}

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const migrated = run({
  salesMasteryProgress: ['01', '02'],
  salesMasteryMastery: ['02'],
  salesMasteryChecks: {'03': true},
  salesMasteryNotes: {'02': 'Keep this note'},
  salesMasteryBookmarks: ['02'],
  salesMasteryPath: 'enterprise',
});
const state = migrated.salesMasteryLearningState;
assert(state.version === 3, `Migration did not produce version 3 (got ${state.version})`);
assert(state.modules['01'].status === 'in_progress', 'Legacy open was not preserved as in_progress');
assert(state.modules['01'].lessonRead === false, 'Legacy open was incorrectly promoted to lesson read');
assert(!state.modules['01'].knowledgeCheck.passed, 'Legacy open was incorrectly promoted to knowledge passed');
// The v3 migration is deliberately conservative: the old "mastery" array tracked a
// mix of opens and completions, so it may only raise a module to in_progress.
assert(state.modules['02'].status === 'in_progress', 'Legacy mastery entry was not preserved as in_progress');
assert(state.modules['02'].lessonRead === false, 'Legacy mastery entry was incorrectly promoted to lesson read');
assert(state.modules['03'].status === 'knowledge_check_passed', 'Legacy knowledge check did not raise status');
assert(state.modules['03'].knowledgeCheck.passed === true, 'Legacy knowledge check was not preserved');
assert(!('salesMasteryProgress' in migrated), 'Legacy progress key was not removed');
assert(!('salesMasteryMastery' in migrated), 'Legacy mastery key was not removed');
assert(!('salesMasteryChecks' in migrated), 'Legacy check key was not removed');
assert(migrated.salesMasteryNotes['02'] === 'Keep this note', 'Notes were changed during migration');
assert(migrated.salesMasteryBookmarks[0] === '02', 'Bookmarks were changed during migration');
assert(migrated.salesMasteryPath === 'enterprise', 'Path preference was changed during migration');

const opened = run({}, '/module-01.html').salesMasteryLearningState.modules['01'];
assert(opened.status === 'in_progress', 'Opening a module did not record in-progress state');
assert(opened.lessonRead === false, 'Opening a module incorrectly marked the lesson read');
assert(!opened.knowledgeCheck.passed, 'Opening a module incorrectly passed the knowledge check');
assert(!opened.practice.completed, 'Opening a module incorrectly completed practice');
assert(!opened.practice.selfAssessed, 'Opening a module incorrectly recorded skill demonstration');

// A module already at a higher status must not be regressed by simply reopening it.
const reopened = run(
  {
    salesMasteryLearningState: {
      version: 3,
      modules: {
        '01': {
          status: 'skill_demonstrated',
          lessonRead: true,
          knowledgeCheck: {passed: true, score: 4, total: 4, attempts: 1},
          practice: {completed: true, selfAssessed: true},
        },
      },
    },
  },
  '/module-01.html'
).salesMasteryLearningState.modules['01'];
assert(reopened.status === 'skill_demonstrated', 'Reopening a completed module regressed its status');
assert(reopened.knowledgeCheck.passed === true, 'Reopening a completed module discarded knowledge-check state');
assert(reopened.practice.selfAssessed === true, 'Reopening a completed module discarded practice state');

console.log(JSON.stringify({
  migration: 'pass',
  openingBehavior: 'pass',
  noRegressionOnReopen: 'pass',
  preservedUserData: 'pass',
}, null, 2));
