import fs from 'node:fs';

const moduleHref = id => `module-${String(id).padStart(2, '0')}.html`;

function linkCaseReferences() {
  const path = 'case-studies.html';
  let html = fs.readFileSync(path, 'utf8');
  html = html.replace(
    /(?<!class="module-ref" href="[^"]+">)<em>Module (\d+)<\/em>/g,
    (_, id) => `<a class="module-ref" href="${moduleHref(Number(id))}"><em>Module ${id}</em></a>`,
  );
  fs.writeFileSync(path, html);
}

function linkExerciseReferences() {
  const path = 'exercises.html';
  let html = fs.readFileSync(path, 'utf8');
  html = html.replace(
    /<span class="drill-tag module">([^<]+)<\/span>/g,
    (_, label) => {
      if (label === 'All modules') {
        return '<span class="drill-tag module"><a href="index.html#modules">All modules</a></span>';
      }
      const ids = [...label.matchAll(/\d+/g)].map(match => Number(match[0]));
      const prefix = ids.length > 1 ? 'Modules ' : 'Module ';
      const links = ids.map(id => `<a href="${moduleHref(id)}">${id}</a>`).join(', ');
      return `<span class="drill-tag module">${prefix}${links}</span>`;
    },
  );
  fs.writeFileSync(path, html);
}

linkCaseReferences();
linkExerciseReferences();
console.log('Linked case-study and exercise references to the authoritative module pages.');
