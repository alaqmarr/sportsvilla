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

const adminPages = walk('./src/app/(admin)').filter(f => f.endsWith('page.tsx'));

const pageSummaries = adminPages.map(pageFile => {
  const relPath = pageFile.replace(/\\/g, '/');
  const dir = path.dirname(pageFile);
  const content = fs.readFileSync(pageFile, 'utf8');
  const isClient = content.includes('"use client"') || content.includes("'use client'");
  
  // Find associated files in the same directory
  const siblingFiles = fs.readdirSync(dir).map(f => path.join(dir, f).replace(/\\/g, '/'));
  const clientFiles = siblingFiles.filter(f => f.endsWith('Client.tsx'));
  const actionFiles = siblingFiles.filter(f => f.endsWith('actions.ts'));

  // Detect data fetching in page.tsx
  const usesPrismaInPage = content.includes('prisma.') || content.includes('prismaClient.');
  const usesFetchInPage = content.includes('fetch(');
  const usesServerSession = content.includes('getServerSession');

  // Detect data fetching in Client file if exists
  let clientContent = '';
  let usesFetchInClient = false;
  let usesSwrInClient = false;
  let clientActionsImported = [];
  
  if (clientFiles.length > 0) {
    clientContent = fs.readFileSync(clientFiles[0], 'utf8');
    usesFetchInClient = clientContent.includes('fetch(');
    usesSwrInClient = clientContent.includes('useSWR');
    // find imports from ./actions or actions
    const actionImports = clientContent.match(/import\s+{([^}]+)}\s+from\s+['"][^'"]*actions['"]/);
    if (actionImports) {
      clientActionsImported = actionImports[1].split(',').map(s => s.trim());
    }
  }

  // Detect exported actions in actions.ts if exists
  let exportedActions = [];
  if (actionFiles.length > 0) {
    const actionContent = fs.readFileSync(actionFiles[0], 'utf8');
    const actions = actionContent.match(/export\s+(async\s+)?function\s+([a-zA-Z0-9_]+)/g) || [];
    exportedActions = actions.map(a => a.replace(/export\s+(async\s+)?function\s+/, ''));
  }

  // Determine route
  let route = relPath.replace('src/app/(admin)', '').replace('/page.tsx', '');
  if (route === '') route = '/';

  return {
    route,
    relPath,
    isClient,
    siblingFiles: siblingFiles.map(f => path.basename(f)),
    usesPrismaInPage,
    usesFetchInPage,
    usesServerSession,
    clientFile: clientFiles[0] ? path.basename(clientFiles[0]) : null,
    usesFetchInClient,
    usesSwrInClient,
    clientActionsImported,
    exportedActions
  };
});

fs.writeFileSync(
  './.agents/teamwork_preview_explorer_redesign_survey_1/pages_analysis.json',
  JSON.stringify(pageSummaries, null, 2)
);

console.log('Processed', pageSummaries.length, 'admin pages.');
pageSummaries.forEach(p => {
  console.log(`\nRoute: ${p.route}`);
  console.log(`  File: ${p.relPath}`);
  console.log(`  Architecture: ${p.isClient ? 'Client Component' : 'Server Component' + (p.clientFile ? ` -> delegates to <${p.clientFile}>` : ' (pure server/direct)')}`);
  if (p.usesPrismaInPage) console.log(`  Data Fetching (Page): direct Prisma query`);
  if (p.exportedActions.length > 0) console.log(`  Server Actions (${p.exportedActions.length}): ${p.exportedActions.slice(0, 5).join(', ')}${p.exportedActions.length > 5 ? '...' : ''}`);
  if (p.clientActionsImported.length > 0) console.log(`  Client imports actions: ${p.clientActionsImported.slice(0, 5).join(', ')}`);
  if (p.usesFetchInClient) console.log(`  Client uses fetch()`);
  if (p.usesSwrInClient) console.log(`  Client uses SWR`);
});
