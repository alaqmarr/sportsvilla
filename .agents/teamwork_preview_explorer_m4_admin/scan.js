const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

const targetDir = path.resolve(__dirname, '../../src/app/(admin)');
const allFiles = walk(targetDir);

const hexRegex = /#[0-9a-fA-F]{3,8}\b/g;
const tableRegex = /<table\b/g;
const buttonRegex = /<button\b/g;
const inputRegex = /<input\b/g;
const selectRegex = /<select\b/g;
const pageHeaderRegex = /<PageHeader\b/g;

const report = {};
let totalHexCount = 0;
let totalTableCount = 0;
let totalButtonCount = 0;
let totalInputCount = 0;
let totalSelectCount = 0;
let totalPageHeaderCount = 0;

allFiles.forEach(absPath => {
  const relPath = path.relative(path.resolve(__dirname, '../../'), absPath).replace(/\\/g, '/');
  if (relPath.endsWith('.ts') || relPath.endsWith('.tsx')) {
    const content = fs.readFileSync(absPath, 'utf8');
    const hexMatches = content.match(hexRegex) || [];
    const tableMatches = content.match(tableRegex) || [];
    const buttonMatches = content.match(buttonRegex) || [];
    const inputMatches = content.match(inputRegex) || [];
    const selectMatches = content.match(selectRegex) || [];
    const pageHeaderMatches = content.match(pageHeaderRegex) || [];

    const isExcluded = relPath === 'src/app/(admin)/page.tsx' || relPath === 'src/app/(admin)/RecentBookingsClient.tsx';

    report[relPath] = {
      isExcluded,
      lines: content.split('\n').length,
      hexCount: hexMatches.length,
      hexes: Array.from(new Set(hexMatches)),
      tableCount: tableMatches.length,
      buttonCount: buttonMatches.length,
      inputCount: inputMatches.length,
      selectCount: selectMatches.length,
      hasPageHeader: pageHeaderMatches.length > 0,
    };

    if (!isExcluded) {
      totalHexCount += hexMatches.length;
      totalTableCount += tableMatches.length;
      totalButtonCount += buttonMatches.length;
      totalInputCount += inputMatches.length;
      totalSelectCount += selectMatches.length;
      totalPageHeaderCount += pageHeaderMatches.length;
    }
  }
});

console.log('=== ADMIN CODEBASE SCAN SUMMARY ===');
console.log('Total files examined:', Object.keys(report).length);
console.log('Total Raw Hex Matches (excl. M2 migrated):', totalHexCount);
console.log('Total Raw Table Matches (excl. M2 migrated):', totalTableCount);
console.log('Total Raw Button Matches (excl. M2 migrated):', totalButtonCount);
console.log('Total Raw Input Matches (excl. M2 migrated):', totalInputCount);
console.log('Total Raw Select Matches (excl. M2 migrated):', totalSelectCount);
console.log('Total PageHeader Uses (excl. M2 migrated):', totalPageHeaderCount);

fs.writeFileSync(
  path.join(__dirname, 'scan_result.json'),
  JSON.stringify({ totalHexCount, totalTableCount, totalButtonCount, totalInputCount, totalSelectCount, report }, null, 2)
);
console.log('Detailed scan written to scan_result.json');
