import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

// Directories to scan
const targetDirs = [
  'src/app/(admin)',
  'src/app/(client)/play'
];

// File extensions to include
const validExtensions = new Set(['.tsx', '.ts', '.jsx', '.js', '.css']);

// Allowlist for definitions or known exceptions
// globals.play.css declares the --play-* tokens using root hex definitions.
const ignoreFiles = new Set([
  path.normalize('src/app/(client)/play/globals.play.css')
]);

// Hex regex: matches # followed by 3, 4, 6, or 8 hex digits
// Supports boundary checks and excludes non-hex anchors like #section or #faq
const hexRegex = /#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g;

function walk(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (validExtensions.has(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

console.log('====================================================');
console.log('         AUTOMATED ZERO-HEX AUDIT SCANNER           ');
console.log('====================================================\n');

let grandTotalViolations = 0;
const summary = [];

for (const relDir of targetDirs) {
  const absDir = path.join(projectRoot, relDir);
  if (!fs.existsSync(absDir)) {
    console.warn(`[WARN] Directory not found: ${relDir}`);
    continue;
  }

  const files = walk(absDir);
  let dirViolations = 0;
  const fileViolations = [];

  for (const file of files) {
    const relativeFilePath = path.relative(projectRoot, file);
    if (ignoreFiles.has(path.normalize(relativeFilePath))) {
      continue;
    }

    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);
    const violationsInFile = [];

    lines.forEach((line, lineIndex) => {
      // Skip comments if desired, or keep strict
      let match;
      hexRegex.lastIndex = 0;
      while ((match = hexRegex.exec(line)) !== null) {
        // Exclude CSS variable declarations like `--play-brand: #059669;` if found in css files
        if (line.trim().startsWith('--') && line.includes(':')) {
          continue;
        }

        violationsInFile.push({
          line: lineIndex + 1,
          hex: match[0],
          column: match.index + 1,
          snippet: line.trim()
        });
      }
    });

    if (violationsInFile.length > 0) {
      dirViolations += violationsInFile.length;
      fileViolations.push({
        file: relativeFilePath,
        count: violationsInFile.length,
        details: violationsInFile
      });
    }
  }

  grandTotalViolations += dirViolations;
  summary.push({
    directory: relDir,
    filesScanned: files.length,
    filesWithViolations: fileViolations.length,
    totalViolations: dirViolations,
    details: fileViolations
  });
}

console.log('--- SCAN RESULTS BY DIRECTORY ---');
summary.forEach(s => {
  console.log(`\nDirectory: ${s.directory}`);
  console.log(`  Files scanned: ${s.filesScanned}`);
  console.log(`  Files with raw hex: ${s.filesWithViolations}`);
  console.log(`  Total hex occurrences: ${s.totalViolations}`);

  if (s.filesWithViolations > 0) {
    console.log('  Top offending files:');
    s.details
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)
      .forEach(f => {
        console.log(`    - ${f.file} (${f.count} matches)`);
        f.details.slice(0, 3).forEach(d => {
          console.log(`        L${d.line}: ${d.hex} -> ${d.snippet.slice(0, 80)}`);
        });
      });
  }
});

console.log('\n====================================================');
console.log(`GRAND TOTAL RAW HEX OCCURRENCES: ${grandTotalViolations}`);
console.log('====================================================');

process.exit(grandTotalViolations > 0 ? 1 : 0);
