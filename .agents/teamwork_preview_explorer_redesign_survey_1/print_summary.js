const fs = require('fs');
const modules = JSON.parse(fs.readFileSync('./.agents/teamwork_preview_explorer_redesign_survey_1/module_deep_dive.json', 'utf8'));

modules.forEach((m, idx) => {
  console.log((idx + 1) + '. Module: ' + m.module + ' (Files: ' + m.filesCount + ', Pages: ' + m.pages.length + ', Hex: ' + m.totalHex + ', Tables: ' + m.rawTables + ', Btns: ' + m.rawButtons + ', Inputs: ' + m.rawInputs + ', Selects: ' + m.rawSelects + ')');
  console.log('   Pages: ' + m.pages.join(', '));
  console.log('   Actions: ' + (m.actions.slice(0, 4).join(', ') + (m.actions.length > 4 ? '... (' + m.actions.length + ' total)' : '')));
  console.log('   APIs: ' + (m.apiEndpoints.join(', ') || 'None (pure server actions/prisma)'));
});
