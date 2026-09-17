import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';

import { pathToFileURL } from 'url';

const rootDir = process.cwd();
const globalsCssPath = path.join(rootDir, 'src/app/globals.css');
const playGlobalsCssPath = path.join(rootDir, 'src/app/(client)/play/globals.play.css');
const tailwindConfigPath = path.join(rootDir, 'tailwind.config.js');
const tokensTsPath = path.join(rootDir, 'src/lib/tokens.ts');

console.log('--- STARTING ADVERSARIAL TOKEN & TYPOGRAPHY TESTS ---');

// 1. Read files
const globalsCss = fs.readFileSync(globalsCssPath, 'utf8');
const playGlobalsCss = fs.readFileSync(playGlobalsCssPath, 'utf8');
const tailwindConfig = (await import(pathToFileURL(tailwindConfigPath).href)).default;

const tokensTs = fs.readFileSync(tokensTsPath, 'utf8');

// 2. Extract CSS variables defined in globals.css and globals.play.css
function extractDeclaredVars(css) {
  const varRegex = /(--[a-zA-Z0-9_-]+)\s*:/g;
  const declared = new Set();
  let match;
  while ((match = varRegex.exec(css)) !== null) {
    declared.add(match[1]);
  }
  return declared;
}

const svVars = extractDeclaredVars(globalsCss);
const playVars = extractDeclaredVars(playGlobalsCss);
const allDeclaredVars = new Set([...svVars, ...playVars]);

console.log(`Declared in globals.css: ${svVars.size} variables`);
console.log(`Declared in globals.play.css: ${playVars.size} variables`);

// Check CSS syntax: mismatched braces
function checkBraces(name, content) {
  let depth = 0;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') depth--;
    if (depth < 0) {
      console.error(`[SYNTAX ERROR] ${name}: Unmatched closing brace at char ${i}`);
      return false;
    }
  }
  if (depth !== 0) {
    console.error(`[SYNTAX ERROR] ${name}: Unclosed opening brace (depth: ${depth})`);
    return false;
  }
  console.log(`[PASS] ${name}: Braces are balanced`);
  return true;
}

checkBraces('globals.css', globalsCss);
checkBraces('globals.play.css', playGlobalsCss);

// 3. Extract all var(--...) used in tailwind.config.js
const tailwindRaw = fs.readFileSync(tailwindConfigPath, 'utf8');
function extractReferencedVars(str) {
  const varRefRegex = /var\(\s*(--[a-zA-Z0-9_-]+)\s*\)/g;
  const refs = new Set();
  let match;
  while ((match = varRefRegex.exec(str)) !== null) {
    refs.add(match[1]);
  }
  return refs;
}

const tailwindRefs = extractReferencedVars(tailwindRaw);
const tokensRefs = extractReferencedVars(tokensTs);

console.log(`Referenced in tailwind.config.js: ${tailwindRefs.size} variables`);
console.log(`Referenced in tokens.ts: ${tokensRefs.size} variables`);

// Check for missing references
let hasMissingRefs = false;
for (const v of tailwindRefs) {
  // Check if declared in globals, playGlobals, or next/font/layout
  const fontVars = ['--font-geist-sans', '--font-geist-mono', '--font-plus-jakarta', '--background', '--foreground'];
  if (!allDeclaredVars.has(v) && !fontVars.includes(v)) {
    console.error(`[FAIL] tailwind.config.js references undefined CSS variable: ${v}`);
    hasMissingRefs = true;
  }
}
if (!hasMissingRefs) {
  console.log('[PASS] All CSS variables referenced in tailwind.config.js are declared!');
}

let hasMissingTokensRefs = false;
for (const v of tokensRefs) {
  if (!allDeclaredVars.has(v)) {
    console.error(`[FAIL] tokens.ts references undefined CSS variable: ${v}`);
    hasMissingTokensRefs = true;
  }
}
if (!hasMissingTokensRefs) {
  console.log('[PASS] All CSS variables referenced in tokens.ts are declared!');
}

// 4. Test Tailwind Utility Class Compilation
const testClasses = [
  // Admin Backgrounds & Surfaces
  'bg-sv-bg', 'bg-sv-bg-subtle', 'bg-sv-bg-surface', 'bg-sv-surface', 'bg-sv-surface-raised', 'bg-sv-surface-hover', 'bg-sv-surface-active',
  // Admin Borders
  'border-sv-border', 'border-sv-border-subtle', 'border-sv-border-focus', 'border-sv-border-strong',
  // Admin Text
  'text-sv-text', 'text-sv-text-primary', 'text-sv-text-secondary', 'text-sv-text-muted', 'text-sv-text-disabled', 'text-sv-text-inverse',
  // Admin Brand
  'bg-sv-brand', 'bg-sv-brand-hover', 'bg-sv-brand-subtle', 'text-sv-brand-foreground',
  // Admin Status
  'text-sv-status-success', 'text-sv-status-warning', 'text-sv-status-error', 'text-sv-status-info',
  'bg-sv-success', 'bg-sv-success-subtle', 'border-sv-success-border', 'text-sv-success-text',
  'bg-sv-warning', 'bg-sv-warning-subtle', 'border-sv-warning-border', 'text-sv-warning-text',
  'bg-sv-error', 'bg-sv-error-subtle', 'border-sv-error-border', 'text-sv-error-text',
  'bg-sv-info', 'bg-sv-info-subtle', 'border-sv-info-border', 'text-sv-info-text',
  // Admin Radius & Shadow & Motion
  'rounded-sv-xs', 'rounded-sv-sm', 'rounded-sv-md', 'rounded-sv-lg', 'rounded-sv-xl', 'rounded-sv-full',
  'shadow-sv-sm', 'shadow-sv-md', 'shadow-sv-lg', 'shadow-sv-xl', 'shadow-sv-glow',
  'ease-sv-default', 'ease-sv-in', 'ease-sv-out', 'ease-sv-spring',
  'duration-sv-fast', 'duration-sv-normal', 'duration-sv-slow',

  // Play Backgrounds & Surfaces
  'bg-play-bg', 'bg-play-bg-subtle', 'bg-play-surface', 'bg-play-surface-alt', 'bg-play-surface-subtle', 'bg-play-surface-hover', 'bg-play-surface-raised',
  // Play Borders
  'border-play-border', 'border-play-border-subtle', 'border-play-border-strong',
  // Play Text
  'text-play-text', 'text-play-text-secondary', 'text-play-text-muted', 'text-play-text-light', 'text-play-text-inverse',
  // Play Brand & Accent
  'bg-play-brand', 'bg-play-brand-hover', 'bg-play-brand-dark', 'bg-play-brand-light',
  'bg-play-accent', 'bg-play-accent-hover', 'bg-play-accent-subtle',
  // Play Status
  'text-play-status-success', 'text-play-status-warning', 'text-play-status-error', 'text-play-status-info',
  'bg-play-success', 'bg-play-success-subtle', 'border-play-success-border', 'text-play-success-text',
  'bg-play-warning', 'bg-play-warning-subtle', 'border-play-warning-border', 'text-play-warning-text',
  'bg-play-error', 'bg-play-error-subtle', 'border-play-error-border', 'text-play-error-text',
  'bg-play-info', 'bg-play-info-subtle', 'border-play-info-border', 'text-play-info-text',
  // Play Radius & Shadow & Motion
  'rounded-play-sm', 'rounded-play-md', 'rounded-play-lg', 'rounded-play-xl', 'rounded-play-full', 'rounded-play-pill',
  'shadow-play-sm', 'shadow-play-md', 'shadow-play-lg', 'shadow-play-xl', 'shadow-play-colored', 'shadow-play-inner',
  'ease-play-default', 'ease-play-spring',
  'duration-play-fast', 'duration-play-normal', 'duration-play-slow',

  // Fonts
  'font-sans', 'font-mono', 'font-play'
];

console.log(`\nTesting compilation of ${testClasses.length} utility classes with Tailwind...`);

const htmlSnippet = `<div class="${testClasses.join(' ')}"></div>`;

const result = await postcss([
  tailwindcss({
    ...tailwindConfig,
    content: [{ raw: htmlSnippet, extension: 'html' }]
  })
]).process('@tailwind utilities;', { from: undefined });

console.log(`Generated CSS size: ${result.css.length} bytes`);
console.log('\nSample compiled CSS rules:\n' + result.css.slice(0, 800) + '\n...');

const failedClasses = [];
for (const cls of testClasses) {
  // Escape for class name lookup in CSS output
  const cssClassPattern = cls.replace(/([:\[\]\/])/g, '\\$1');
  if (!result.css.includes(cssClassPattern)) {
    failedClasses.push(cls);
  }
}

if (failedClasses.length > 0) {
  console.error(`[FAIL] ${failedClasses.length} utility classes failed to generate CSS:`, failedClasses);
} else {
  console.log(`[PASS] ALL ${testClasses.length} utility classes compiled and generated valid CSS rules!`);
}

// 5. Typography Scope Audit
console.log('\n--- TYPOGRAPHY SCOPE AUDIT ---');
const rootLayout = fs.readFileSync(path.join(rootDir, 'src/app/layout.tsx'), 'utf8');
const playLayout = fs.readFileSync(path.join(rootDir, 'src/app/(client)/play/layout.tsx'), 'utf8');

if (rootLayout.includes('--font-geist-sans') && rootLayout.includes('--font-geist-mono') && rootLayout.includes('--font-plus-jakarta')) {
  console.log('[PASS] Root layout sets all 3 font variables on <html>');
} else {
  console.error('[FAIL] Root layout is missing some font variables');
}

// Check play layout font
if (playLayout.includes('font-sans')) {
  console.warn('[WARNING/NOTICE] play/layout.tsx specifies class "font-sans". Since font-sans maps to var(--font-geist-sans), child elements may inherit Geist Sans instead of Plus Jakarta Sans unless overridden by body or .font-play.');
}

console.log('\n--- TEST SUMMARY COMPLETED ---');
