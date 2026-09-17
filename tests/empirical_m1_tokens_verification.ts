import fs from "fs";
import path from "path";
import { adminTokens, playTokens, rawAdminTokens, rawPlayTokens, tokens } from "../src/lib/tokens";

interface CheckResult {
  category: string;
  name: string;
  status: "PASS" | "FAIL";
  details?: any;
}

const results: CheckResult[] = [];

function record(category: string, name: string, passed: boolean, details?: any) {
  results.push({ category, name, status: passed ? "PASS" : "FAIL", details });
  const mark = passed ? "[PASS]" : "[FAIL]";
  console.log(`${mark} [${category}] ${name}`);
  if (!passed && details !== undefined) {
    console.error("       Details:", typeof details === "object" ? JSON.stringify(details) : details);
  }
}

function extractCssVars(filePath: string, prefix: string): Map<string, string> {
  const content = fs.readFileSync(filePath, "utf-8");
  const varMap = new Map<string, string>();
  const rootMatches = content.matchAll(/:root\s*\{([^}]+)\}/gs);
  for (const rootMatch of rootMatches) {
    const rootContent = rootMatch[1];
    const varRegex = /(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g;
    let m;
    while ((m = varRegex.exec(rootContent)) !== null) {
      const varName = m[1].trim();
      const varValue = m[2].trim();
      if (varName.startsWith(prefix)) {
        varMap.set(varName, varValue);
      }
    }
  }
  return varMap;
}

const globalsCssPath = path.resolve(__dirname, "../src/app/globals.css");
const globalsPlayCssPath = path.resolve(__dirname, "../src/app/(client)/play/globals.play.css");
const layoutPath = path.resolve(__dirname, "../src/app/layout.tsx");
const tailwindConfigPath = path.resolve(__dirname, "../tailwind.config.js");

console.log("=== STARTING EMPIRICAL M1 VERIFICATION SUITE ===\n");

// 1. Check globals.css (--sv-*)
const svVars = extractCssVars(globalsCssPath, "--sv-");
record("CSS: Admin", "globals.css defines sufficient --sv-* custom properties", svVars.size >= 25, { count: svVars.size });

const emptySvVars: string[] = [];
const danglingSvVars: { name: string; ref: string }[] = [];
for (const [name, val] of svVars.entries()) {
  if (!val || val.trim().length === 0) emptySvVars.push(name);
  const varMatch = val.match(/var\((--[a-zA-Z0-9_-]+)\)/);
  if (varMatch) {
    const target = varMatch[1];
    if (!svVars.has(target)) {
      danglingSvVars.push({ name, ref: target });
    }
  }
}
record("CSS: Admin", "All --sv-* variables have non-empty syntax", emptySvVars.length === 0, emptySvVars);
record("CSS: Admin", "All var() references inside --sv-* resolve within globals.css", danglingSvVars.length === 0, danglingSvVars);

// Check essential token categories for Admin
const expectedSvCategories = [
  "--sv-bg", "--sv-surface", "--sv-border", "--sv-text-primary",
  "--sv-brand", "--sv-status-success", "--sv-status-warning", "--sv-status-error", "--sv-status-info",
  "--sv-shadow-sm", "--sv-radius-md", "--sv-ease-default", "--sv-duration-fast"
];
const missingSvCategories = expectedSvCategories.filter(k => !svVars.has(k));
record("CSS: Admin", "All essential token categories exist in --sv-* namespace", missingSvCategories.length === 0, missingSvCategories);

// 2. Check globals.play.css (--play-*)
const playVars = extractCssVars(globalsPlayCssPath, "--play-");
record("CSS: Play", "globals.play.css defines sufficient --play-* custom properties", playVars.size >= 25, { count: playVars.size });

const emptyPlayVars: string[] = [];
const danglingPlayVars: { name: string; ref: string }[] = [];
for (const [name, val] of playVars.entries()) {
  if (!val || val.trim().length === 0) emptyPlayVars.push(name);
  const varMatch = val.match(/var\((--[a-zA-Z0-9_-]+)\)/);
  if (varMatch) {
    const target = varMatch[1];
    if (!playVars.has(target)) {
      danglingPlayVars.push({ name, ref: target });
    }
  }
}
record("CSS: Play", "All --play-* variables have non-empty syntax", emptyPlayVars.length === 0, emptyPlayVars);
record("CSS: Play", "All var() references inside --play-* resolve within globals.play.css", danglingPlayVars.length === 0, danglingPlayVars);

const expectedPlayCategories = [
  "--play-bg", "--play-surface", "--play-border", "--play-text",
  "--play-brand", "--play-accent", "--play-status-success", "--play-status-warning", "--play-status-error",
  "--play-shadow-sm", "--play-radius-md", "--play-ease-default", "--play-duration-fast"
];
const missingPlayCategories = expectedPlayCategories.filter(k => !playVars.has(k));
record("CSS: Play", "All essential token categories exist in --play-* namespace", missingPlayCategories.length === 0, missingPlayCategories);

// 3. Check tokens.ts
function collectVars(obj: any): string[] {
  const list: string[] = [];
  function walk(curr: any) {
    if (typeof curr === "string") {
      const match = curr.match(/var\((--[a-zA-Z0-9_-]+)\)/);
      if (match) list.push(match[1]);
    } else if (typeof curr === "object" && curr !== null) {
      for (const v of Object.values(curr)) walk(v);
    }
  }
  walk(obj);
  return list;
}

const adminTokenVars = collectVars(adminTokens);
const invalidAdminTokenVars = adminTokenVars.filter(v => !svVars.has(v));
record("TS Tokens", "Every CSS variable in adminTokens exists in globals.css", invalidAdminTokenVars.length === 0, invalidAdminTokenVars);

const playTokenVars = collectVars(playTokens);
const invalidPlayTokenVars = playTokenVars.filter(v => !playVars.has(v));
record("TS Tokens", "Every CSS variable in playTokens exists in globals.play.css", invalidPlayTokenVars.length === 0, invalidPlayTokenVars);

// Raw tokens matching
const rawAdminMismatches: { key: string; rawHex: string; foundCss?: string }[] = [];
for (const [k, hex] of Object.entries(rawAdminTokens)) {
  const kebab = k.replace(/([A-Z])/g, "-$1").toLowerCase();
  const candidates = [`--sv-${kebab}`, `--sv-status-${kebab}`, `--sv-text-${kebab}`];
  let matched = false;
  for (const cand of candidates) {
    if (svVars.has(cand)) {
      const val = svVars.get(cand)!.toLowerCase();
      if (val === hex.toLowerCase() || val.includes(hex.toLowerCase())) {
        matched = true;
        break;
      }
    }
  }
  if (!matched) {
    rawAdminMismatches.push({ key: k, rawHex: hex, foundCss: svVars.get(`--sv-${kebab}`) });
  }
}
record("TS Tokens", "rawAdminTokens match declared hex/rgba in globals.css", rawAdminMismatches.length === 0, rawAdminMismatches);

const rawPlayMismatches: { key: string; rawHex: string; foundCss?: string }[] = [];
for (const [k, hex] of Object.entries(rawPlayTokens)) {
  const kebab = k.replace(/([A-Z])/g, "-$1").toLowerCase();
  const candidates = [`--play-${kebab}`, `--play-status-${kebab}`, `--play-brand-${kebab}`, `--play-accent-${kebab}`];
  let matched = false;
  for (const cand of candidates) {
    if (playVars.has(cand)) {
      const val = playVars.get(cand)!.toLowerCase();
      if (val === hex.toLowerCase() || val.includes(hex.toLowerCase())) {
        matched = true;
        break;
      }
    }
  }
  if (!matched) {
    rawPlayMismatches.push({ key: k, rawHex: hex, foundCss: playVars.get(`--play-${kebab}`) });
  }
}
record("TS Tokens", "rawPlayTokens match declared hex/rgba in globals.play.css", rawPlayMismatches.length === 0, rawPlayMismatches);

record("TS Tokens", "tokens object exports admin, play, and raw namespaces", 
  Boolean(tokens.admin && tokens.play && tokens.raw && tokens.raw.admin && tokens.raw.play));

// 4. Check tailwind.config.js mappings
const twConfigContent = fs.readFileSync(tailwindConfigPath, "utf-8");
const twVarMatches = [...twConfigContent.matchAll(/var\((--(sv|play)-[a-zA-Z0-9_-]+)\)/g)].map(m => m[1]);
const unmappedTwVars: string[] = [];
for (const v of twVarMatches) {
  if (v.startsWith("--sv-") && !svVars.has(v)) {
    unmappedTwVars.push(v);
  } else if (v.startsWith("--play-") && !playVars.has(v)) {
    unmappedTwVars.push(v);
  }
}
record("Tailwind Config", "Every CSS variable referenced in tailwind.config.js exists in CSS files", unmappedTwVars.length === 0, unmappedTwVars);

const twHasSvColors = twConfigContent.includes("sv:") && twConfigContent.includes("play:");
const twHasBorderRadius = twConfigContent.includes('"sv-sm":') && twConfigContent.includes('"play-sm":');
const twHasBoxShadow = twConfigContent.includes('"sv-sm":') && twConfigContent.includes('"play-sm":');
const twHasFontFamily = twConfigContent.includes("--font-geist-sans") && twConfigContent.includes("--font-plus-jakarta");
const twHasTransitions = twConfigContent.includes("transitionTimingFunction") && twConfigContent.includes("transitionDuration");

record("Tailwind Config", "Tailwind config extends colors with sv and play namespaces", twHasSvColors);
record("Tailwind Config", "Tailwind config extends borderRadius with sv and play tokens", twHasBorderRadius);
record("Tailwind Config", "Tailwind config extends boxShadow with sv and play tokens", twHasBoxShadow);
record("Tailwind Config", "Tailwind config extends fontFamily with Geist and Plus Jakarta Sans", twHasFontFamily);
record("Tailwind Config", "Tailwind config extends transitions with timing functions and durations", twHasTransitions);

// 5. Check Typography Setup
const layoutContent = fs.readFileSync(layoutPath, "utf-8");
const globalsContent = fs.readFileSync(globalsCssPath, "utf-8");
const playGlobalsContent = fs.readFileSync(globalsPlayCssPath, "utf-8");

const importsNextGoogleFont = /from\s+["']next\/font\/google["']/.test(layoutContent);
const importsGeist = /Geist\b/.test(layoutContent);
const importsGeistMono = /Geist_Mono\b/.test(layoutContent);
const importsPlusJakarta = /Plus_Jakarta_Sans\b/.test(layoutContent);
record("Typography", "layout.tsx imports Geist, Geist_Mono, and Plus_Jakarta_Sans from next/font/google",
  importsNextGoogleFont && importsGeist && importsGeistMono && importsPlusJakarta);

const configuresGeistVar = /variable:\s*["']--font-geist-sans["']/.test(layoutContent);
const configuresGeistMonoVar = /variable:\s*["']--font-geist-mono["']/.test(layoutContent);
const configuresPlusJakartaVar = /variable:\s*["']--font-plus-jakarta["']/.test(layoutContent);
record("Typography", "layout.tsx configures correct CSS variables for each font",
  configuresGeistVar && configuresGeistMonoVar && configuresPlusJakartaVar);

const htmlTagMatch = layoutContent.match(/<html[^>]*>/s);
const injectsOnHtml = Boolean(
  htmlTagMatch &&
  htmlTagMatch[0].includes("geistSans.variable") &&
  htmlTagMatch[0].includes("geistMono.variable") &&
  htmlTagMatch[0].includes("plusJakartaSans.variable")
);
record("Typography", "layout.tsx injects all 3 font variables onto <html className=...>", injectsOnHtml);

const noGoogleFontsImportInCss = !/@import\s+url\([^)]*fonts\.googleapis\.com/.test(globalsContent);
record("Typography", "globals.css does NOT contain render-blocking Google Fonts @import", noGoogleFontsImportInCss);

const hasFontUtilityClasses = /\.font-sans\b/.test(globalsContent) && /\.font-mono\b/.test(globalsContent) && /\.font-play\b/.test(globalsContent);
record("Typography", "globals.css defines .font-sans, .font-mono, and .font-play utility classes", hasFontUtilityClasses);

const playUsesPlusJakarta = /font-family:\s*var\(--font-plus-jakarta\)/.test(playGlobalsContent);
record("Typography", "globals.play.css sets body font-family to var(--font-plus-jakarta)", playUsesPlusJakarta);

// Summary
const totalPassed = results.filter(r => r.status === "PASS").length;
const totalFailed = results.filter(r => r.status === "FAIL").length;
console.log(`\n=== VERIFICATION SUMMARY: ${totalPassed} PASSED, ${totalFailed} FAILED ===`);

if (totalFailed > 0) {
  console.error("FAILED CHECKS:");
  results.filter(r => r.status === "FAIL").forEach(r => console.error(` - [${r.category}] ${r.name}`));
  process.exit(1);
} else {
  console.log("ALL EMPIRICAL CHECKS PASSED CLEANLY.");
  process.exit(0);
}

