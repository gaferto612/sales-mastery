import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const output = path.join(root, 'dist');
const staticOutput = path.join(output, 'static');
const serverOutput = path.join(output, 'server');
const staticExtensions = new Set(['.html', '.js', '.css', '.jpg', '.jpeg', '.png', '.webp']);

fs.rmSync(output, {recursive: true, force: true});
fs.mkdirSync(staticOutput, {recursive: true});
fs.mkdirSync(serverOutput, {recursive: true});

for (const entry of fs.readdirSync(root, {withFileTypes: true})) {
  if (!entry.isFile() || !staticExtensions.has(path.extname(entry.name).toLowerCase())) continue;
  fs.copyFileSync(path.join(root, entry.name), path.join(staticOutput, entry.name));
}

fs.writeFileSync(
  path.join(serverOutput, 'index.js'),
  `export default {\n  fetch(request, env) {\n    return env.ASSETS.fetch(request);\n  },\n};\n`,
);

const files = fs.readdirSync(staticOutput);
if (!files.includes('index.html')) throw new Error('Static build is missing index.html');
if (files.filter(file => /^module-\d{2}\.html$/.test(file)).length !== 43) {
  throw new Error('Static build must contain all 43 module pages');
}

console.log(`Built ${files.length} static assets and the Sites worker adapter.`);
