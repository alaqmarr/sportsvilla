const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('C:/Users/DELL/Desktop/sportsvilla/src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Revert "text-[var(--play-brand-dark)]" back to "text-white" when it's on a button with "bg-[var(--play-brand)]"
    content = content.replace(/className=(["'{`])([^"'{`]*)(["'}])/g, (match, p1, p2, p3) => {
      let classes = p2;
      if (classes.includes('bg-[var(--play-brand)]') && classes.includes('text-[var(--play-brand-dark)]')) {
        classes = classes.replace('text-[var(--play-brand-dark)]', 'text-white');
      }
      return `className=${p1}${classes}${p3}`;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Reverted ${filePath}`);
    }
  }
});
