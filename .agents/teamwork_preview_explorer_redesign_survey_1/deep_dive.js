const fs = require('fs');
const path = require('path');

const adminDir = './src/app/(admin)';
const subDirs = fs.readdirSync(adminDir).filter(f => fs.statSync(path.join(adminDir, f)).isDirectory());

const modules = [];

subDirs.forEach(sub => {
  const subPath = path.join(adminDir, sub);
  
  function walk(dir) {
    let files = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const full = path.join(dir, file);
      const stat = fs.statSync(full);
      if (stat && stat.isDirectory()) files = files.concat(walk(full));
      else files.push(full);
    });
    return files;
  }

  const allFiles = walk(subPath);
  const tsxFiles = allFiles.filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
  
  const pages = tsxFiles.filter(f => f.endsWith('page.tsx'));
  const clients = tsxFiles.filter(f => f.endsWith('Client.tsx'));
  const actions = tsxFiles.filter(f => f.endsWith('actions.ts'));

  let totalHex = 0;
  const hexMap = {};
  let rawTables = 0;
  let rawButtons = 0;
  let rawInputs = 0;
  let rawSelects = 0;

  const apiEndpointsCalled = new Set();
  const serverActionNames = new Set();

  tsxFiles.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    const hexes = content.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
    totalHex += hexes.length;
    hexes.forEach(h => {
      const lower = h.toLowerCase();
      hexMap[lower] = (hexMap[lower] || 0) + 1;
    });

    rawTables += (content.match(/<table[\s>]/g) || []).length;
    rawButtons += (content.match(/<button[\s>]/g) || []).length;
    rawInputs += (content.match(/<input[\s>]/g) || []).length;
    rawSelects += (content.match(/<select[\s>]/g) || []).length;

    // find fetch calls
    const fetchMatches = content.matchAll(/fetch\s*\(\s*[`'"]([^`'"]+)[`'"]/g);
    for (const m of fetchMatches) {
      apiEndpointsCalled.add(m[1]);
    }

    // find exported actions
    if (f.endsWith('actions.ts')) {
      const actionMatches = content.matchAll(/export\s+(async\s+)?function\s+([a-zA-Z0-9_]+)/g);
      for (const m of actionMatches) {
        serverActionNames.add(m[2]);
      }
    }
  });

  modules.push({
    module: sub,
    filesCount: tsxFiles.length,
    pages: pages.map(p => p.replace(/\\/g, '/').replace('src/app/(admin)/', '')),
    clients: clients.map(c => path.basename(c)),
    actions: Array.from(serverActionNames),
    apiEndpoints: Array.from(apiEndpointsCalled),
    totalHex,
    topHex: Object.entries(hexMap).sort((a,b) => b[1]-a[1]).slice(0, 5),
    rawTables,
    rawButtons,
    rawInputs,
    rawSelects
  });
});

fs.writeFileSync('./.agents/teamwork_preview_explorer_redesign_survey_1/module_deep_dive.json', JSON.stringify(modules, null, 2));
console.log('Processed', modules.length, 'submodules.');
