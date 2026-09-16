const fs = require('fs');
const path = require('path');

function replaceTimezone(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  // Simple regex for empty or no-argument calls
  content = content.replace(/\.toLocaleDateString\(\)/g, `.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })`);
  content = content.replace(/\.toLocaleTimeString\(\)/g, `.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })`);
  
  // Regex for calls with 'en-IN', { ... } but missing timeZone
  content = content.replace(/\.toLocaleDateString\('en-IN', \{([^}]+)\}\)/g, (match, p1) => {
    if (!p1.includes('timeZone')) {
      return `.toLocaleDateString('en-IN', {${p1}, timeZone: 'Asia/Kolkata'})`;
    }
    return match;
  });
  content = content.replace(/\.toLocaleTimeString\('en-IN', \{([^}]+)\}\)/g, (match, p1) => {
    if (!p1.includes('timeZone')) {
      return `.toLocaleTimeString('en-IN', {${p1}, timeZone: 'Asia/Kolkata'})`;
    }
    return match;
  });
  
  // Regex for calls with undefined, { ... } missing timeZone
  content = content.replace(/\.toLocaleDateString\((undefined|'default'|'en-US'), \{([^}]+)\}\)/g, (match, p1, p2) => {
    if (!p2.includes('timeZone')) {
      return `.toLocaleDateString(${p1}, {${p2}, timeZone: 'Asia/Kolkata'})`;
    }
    return match;
  });
  content = content.replace(/\.toLocaleTimeString\((undefined|'default'|'en-US'), \{([^}]+)\}\)/g, (match, p1, p2) => {
    if (!p2.includes('timeZone')) {
      return `.toLocaleTimeString(${p1}, {${p2}, timeZone: 'Asia/Kolkata'})`;
    }
    return match;
  });
  
  fs.writeFileSync(filePath, content);
}

const frontendFiles = [
  'src/app/(client)/play/(authenticated)/wallet/WalletClient.tsx',
  'src/app/(client)/play/(authenticated)/offers/page.tsx',
  'src/app/(client)/play/(authenticated)/tournaments/[id]/page.tsx',
  'src/app/(client)/play/(authenticated)/tournaments/my-registrations/page.tsx',
  'src/app/(client)/play/(authenticated)/join-game/[code]/page.tsx',
  'src/app/(client)/play/(authenticated)/profile/page.tsx'
];

frontendFiles.forEach(file => {
  const absolutePath = path.join(__dirname, file);
  if (fs.existsSync(absolutePath)) {
    replaceTimezone(absolutePath);
    console.log("Timezone patched: " + file);
  }
});

// SWR fixes
function fixSWR(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  // Look for if (error) return ...
  // Change to if (error || data?.success === false) return <div>{data?.message || 'Failed to load'}</div>
  content = content.replace(
    /if \(error\) return (?:<[^>]+>|)Failed to load[^<]*(?:<\/[^>]+>|;)/,
    `if (error || data?.success === false) return <div className="p-4 text-red-500">{data?.message || error?.message || 'Failed to load data.'}</div>;`
  );
  content = content.replace(
    /if \(error\) return <div[^>]*>Error loading[^<]*<\/div>/,
    `if (error || data?.success === false) return <div className="text-center p-8 text-red-500">{data?.message || error?.message || 'Error loading data.'}</div>;`
  );
  fs.writeFileSync(filePath, content);
}

const swrFiles = [
  'src/app/(client)/play/(authenticated)/offers/page.tsx',
  'src/app/(client)/play/(authenticated)/leaderboard/page.tsx'
];

swrFiles.forEach(file => {
  const absolutePath = path.join(__dirname, file);
  if (fs.existsSync(absolutePath)) {
    fixSWR(absolutePath);
    console.log("SWR patched: " + file);
  }
});

console.log("Frontend fixes complete");
