const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) results = results.concat(walk(full));
    else if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(full);
  });
  return results;
}

const files = walk('./src/app/(admin)');
const fileSizes = files.map(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n').length;
  return { file: f.replace(/\\/g, '/').replace('src/app/(admin)/', ''), lines };
}).sort((a, b) => b.lines - a.lines);

console.log('Top 25 largest files in src/app/(admin):');
fileSizes.slice(0, 25).forEach((f, i) => {
  console.log(`${(i + 1).toString().padStart(2)}. ${f.lines.toString().padStart(5)} lines : ${f.file}`);
});
