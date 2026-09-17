const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'scan_result.json'), 'utf8'));
const report = data.report;

// Frequency of hex codes across all non-excluded files
const hexFreq = {};
Object.entries(report).forEach(([filePath, info]) => {
  if (info.isExcluded) return;
  info.hexes.forEach(h => {
    const norm = h.toLowerCase();
    hexFreq[norm] = (hexFreq[norm] || 0) + 1;
  });
});

const sortedHex = Object.entries(hexFreq).sort((a, b) => b[1] - a[1]);

// Categorize files by sub-module
const modules = {
  "Core & Bookings": [],
  "Members & Loyalty": [],
  "Revenue & Dashboards": [],
  "Tools & Settings & Operations": [],
  "Layout & Root": []
};

function getCategory(filePath) {
  if (filePath.includes('/bookings') || filePath.includes('/calendar') || filePath.includes('/checkin')) {
    return "Core & Bookings";
  }
  if (filePath.includes('/members') || filePath.includes('/plans') || filePath.includes('/attendance') || filePath.includes('/loyalty') || filePath.includes('/coupons')) {
    return "Members & Loyalty";
  }
  if (filePath.includes('/razorpay') || filePath.includes('/phonepe') || filePath.includes('/reports') || filePath.includes('/wallets')) {
    return "Revenue & Dashboards";
  }
  if (filePath.startsWith('src/app/(admin)/layout') || filePath.startsWith('src/app/(admin)/loading') || filePath.startsWith('src/app/(admin)/template') || filePath.startsWith('src/app/(admin)/page') || filePath.startsWith('src/app/(admin)/RecentBookingsClient')) {
    return "Layout & Root";
  }
  return "Tools & Settings & Operations";
}

Object.entries(report).forEach(([filePath, info]) => {
  const cat = getCategory(filePath);
  modules[cat].push({ filePath, ...info });
});

console.log('--- TOP 25 RAW HEX CODES IN (ADMIN) ---');
sortedHex.slice(0, 25).forEach(([hex, count]) => {
  console.log(`${hex.padEnd(10)}: in ${count} files`);
});

console.log('\n--- MODULE BREAKDOWN ---');
Object.entries(modules).forEach(([modName, files]) => {
  const totalHex = files.filter(f => !f.isExcluded).reduce((sum, f) => sum + f.hexCount, 0);
  const totalButtons = files.filter(f => !f.isExcluded).reduce((sum, f) => sum + f.buttonCount, 0);
  const totalTables = files.filter(f => !f.isExcluded).reduce((sum, f) => sum + f.tableCount, 0);
  console.log(`${modName}: ${files.length} files | ${totalHex} hexes | ${totalButtons} buttons | ${totalTables} tables`);
});

fs.writeFileSync(
  path.join(__dirname, 'categorized_modules.json'),
  JSON.stringify({ topHexes: sortedHex, modules }, null, 2)
);
