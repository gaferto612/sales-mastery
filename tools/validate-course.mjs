import fs from 'node:fs';
import vm from 'node:vm';

const context={window:{}};
vm.createContext(context);
vm.runInContext(fs.readFileSync('course-data.js','utf8'),context);
vm.runInContext(fs.readFileSync('research-data.js','utf8'),context);
const {modules,levels,research}=context.window.SALES_MASTERY;
const errors=[];
const assert=(condition,message)=>{if(!condition)errors.push(message)};

assert(modules.length===43,`Expected 43 modules, found ${modules.length}`);
assert(new Set(modules.map(module=>module.id)).size===43,'Module IDs are not unique');
assert(Object.keys(research).length===43,`Expected 43 research notes, found ${Object.keys(research).length}`);
for(const module of modules){
  const file=`module-${module.id}.html`;
  assert(fs.existsSync(file),`Missing ${file}`);
  assert(research[module.id],`Missing research note for module ${module.id}`);
  assert(module.objectives.length===3,`Module ${module.id} needs three objectives`);
  assert(module.artifact,`Module ${module.id} has no artifact`);
  assert(module.check?.[1]?.length===3,`Module ${module.id} checkpoint is malformed`);
  if(fs.existsSync(file)){
    const html=fs.readFileSync(file,'utf8');
    assert(html.includes('script.js'),`${file} does not load the shared bootstrap`);
    assert(html.includes('article class="content"'),`${file} lacks the protected content layout`);
  }
}
const levelIds=levels.flatMap(level=>level.modules);
assert(levelIds.length===43,`Levels contain ${levelIds.length} placements, expected 43`);
assert(new Set(levelIds).size===43,'A module appears in multiple levels');
for(const module of modules)assert(levelIds.includes(module.id),`Module ${module.id} is absent from levels`);
for(const [key,note] of Object.entries(research)){
  assert(note.sources.length>0,`Research note ${key} has no sources`);
  for(const source of note.sources)assert(source?.url?.startsWith('http'),`Research note ${key} has an invalid source`);
}
for(let id=31;id<=42;id++){
  const html=fs.readFileSync(`module-${id}.html`,'utf8');
  if(id>31)assert(html.includes(`module-${String(id-1).padStart(2,'0')}.html`),`Module ${id} previous link is wrong`);
  if(id<42)assert(html.includes(`module-${String(id+1).padStart(2,'0')}.html`),`Module ${id} next link is wrong`);
}
const index=fs.readFileSync('index.html','utf8');
assert(index.includes('43 modules'),'Homepage hero count is stale');
assert(index.includes('>43</div>'),'Homepage metric count is stale');
assert(index.includes('/ 43 Modules Mastered'),'Homepage progress count is stale');
const learning=fs.readFileSync('learning.js','utf8');
assert(learning.includes('curriculumLevels()'),'Dynamic level renderer is missing');
assert(learning.includes("levels=[]"),'Level data is not loaded by the interface');

if(errors.length){console.error(errors.join('\n'));process.exitCode=1}
else{
  const words=Array.from({length:43},(_,i)=>fs.readFileSync(`module-${String(i).padStart(2,'0')}.html`,'utf8').replace(/<[^>]+>/g,' ').split(/\s+/).filter(Boolean).length).reduce((a,b)=>a+b,0);
  console.log(JSON.stringify({modules:modules.length,levels:levels.length,researchNotes:Object.keys(research).length,moduleWords:words,status:'pass'},null,2));
}


