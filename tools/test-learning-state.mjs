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
assert(state.version === 2, 'Migration did not produce version 2');
assert(state.modules['01'].started === true, 'Legacy open was not preserved as started');
assert(!state.modules['01'].read, 'Legacy open was incorrectly promoted to read');
assert(!state.modules['01'].knowledgePassed, 'Legacy open was incorrectly promoted to knowledge passed');
assert(state.modules['02'].read === true && state.modules['02'].knowledgePassed === true, 'Legacy completion was not safely preserved');
assert(state.modules['03'].knowledgePassed === true, 'Legacy knowledge check was not preserved');
assert(!('salesMasteryProgress' in migrated), 'Legacy progress key was not removed');
assert(!('salesMasteryMastery' in migrated), 'Legacy mastery key was not removed');
assert(!('salesMasteryChecks' in migrated), 'Legacy check key was not removed');
assert(migrated.salesMasteryNotes['02'] === 'Keep this note', 'Notes were changed during migration');
assert(migrated.salesMasteryBookmarks[0] === '02', 'Bookmarks were changed during migration');
assert(migrated.salesMasteryPath === 'enterprise', 'Path preference was changed during migration');

const opened = run({}, '/module-01.html').salesMasteryLearningState.modules['01'];
assert(opened.started === true, 'Opening a module did not record in-progress state');
assert(!opened.read, 'Opening a module incorrectly marked it read');
assert(!opened.knowledgePassed, 'Opening a module incorrectly passed the knowledge check');
assert(!opened.practiceCompleted, 'Opening a module incorrectly completed practice');
assert(!opened.demonstrated, 'Opening a module incorrectly recorded skill demonstration');

console.log(JSON.stringify({migration: 'pass', openingBehavior: 'pass', preservedUserData: 'pass'}, null, 2));
