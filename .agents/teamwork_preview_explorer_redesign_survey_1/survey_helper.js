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

// 1. Analyze Hex codes in src/app/(admin)
const adminFiles = walk('./src/app/(admin)');
const counts = {};
const fileMap = {};
const hexRegex = /#[0-9a-fA-F]{3,8}\b/g;

adminFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.match(hexRegex) || [];
  matches.forEach(m => {
    const hex = m.toLowerCase();
    counts[hex] = (counts[hex] || 0) + 1;
    if (!fileMap[hex]) fileMap[hex] = new Set();
    fileMap[hex].add(f.replace(/\\/g, '/'));
  });
});

const sortedHex = Object.entries(counts).sort((a, b) => b[1] - a[1]);

console.log('=== HEX CODE INVENTORY IN src/app/(admin) ===');
console.log('Total files scanned:', adminFiles.length);
console.log('Total unique hex values:', sortedHex.length);
console.log('Total hex occurrences:', sortedHex.reduce((sum, [, c]) => sum + c, 0));
sortedHex.forEach(([hex, count]) => {
  console.log(`${hex}: ${count} occurrences across ${fileMap[hex].size} files`);
});

// Also scan src/components (excluding play)
const compFiles = walk('./src/components').filter(f => !f.includes('play'));
const compCounts = {};
const compFileMap = {};

compFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.match(hexRegex) || [];
  matches.forEach(m => {
    const hex = m.toLowerCase();
    compCounts[hex] = (compCounts[hex] || 0) + 1;
    if (!compFileMap[hex]) compFileMap[hex] = new Set();
    compFileMap[hex].add(f.replace(/\\/g, '/'));
  });
});

console.log('\n=== HEX CODE INVENTORY IN src/components (Admin/Shared) ===');
console.log('Total files scanned:', compFiles.length);
const sortedCompHex = Object.entries(compCounts).sort((a, b) => b[1] - a[1]);
sortedCompHex.forEach(([hex, count]) => {
  console.log(`${hex}: ${count} occurrences across ${compFileMap[hex].size} files`);
});

// 2. Scan Raw Elements across admin: <table>, <button>, card divs, badge spans
console.log('\n=== RAW UI ELEMENTS IN src/app/(admin) ===');
let tableCount = 0;
let buttonCount = 0;
let inputCount = 0;
let selectCount = 0;
let cardDivCount = 0;
let badgeSpanCount = 0;

const tableFiles = new Set();
const buttonFiles = new Set();
const inputFiles = new Set();
const selectFiles = new Set();
const cardFiles = new Set();
const badgeFiles = new Set();

adminFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const rel = f.replace(/\\/g, '/');
  
  // raw table
  const tables = (content.match(/<table[\s>]/g) || []).length;
  if (tables > 0) { tableCount += tables; tableFiles.add(rel); }
  
  // raw button
  const buttons = (content.match(/<button[\s>]/g) || []).length;
  if (buttons > 0) { buttonCount += buttons; buttonFiles.add(rel); }
  
  // raw input
  const inputs = (content.match(/<input[\s>]/g) || []).length;
  if (inputs > 0) { inputCount += inputs; inputFiles.add(rel); }

  // raw select
  const selects = (content.match(/<select[\s>]/g) || []).length;
  if (selects > 0) { selectCount += selects; selectFiles.add(rel); }

  // card-like divs: bg-[#...], bg-gray-..., bg-neutral-..., rounded-xl/lg/2xl border...
  const cards = (content.match(/className="[^"]*bg-\[#(161923|1c1f2e|181b26|11131a|0f1117)\][^"]*"/g) || []).length;
  if (cards > 0) { cardDivCount += cards; cardFiles.add(rel); }

  // badge-like spans: rounded-full px-... py-... text-xs/text-[10px]/text-[9px]
  const badges = (content.match(/<span[^>]*className="[^"]*rounded(-full|-md|-lg)?[^"]*(text-\[?[0-9a-z]+\]?|px-[0-9.]+)[^"]*"/g) || []).length;
  if (badges > 0) { badgeSpanCount += badges; badgeFiles.add(rel); }
});

console.log(`Raw <table>: ${tableCount} in ${tableFiles.size} files`);
console.log(`Raw <button>: ${buttonCount} in ${buttonFiles.size} files`);
console.log(`Raw <input>: ${inputCount} in ${inputFiles.size} files`);
console.log(`Raw <select>: ${selectCount} in ${selectFiles.size} files`);
console.log(`Card-like <div> (dark background hexes): ${cardDivCount} in ${cardFiles.size} files`);
console.log(`Badge-like <span>: ${badgeSpanCount} in ${badgeFiles.size} files`);
