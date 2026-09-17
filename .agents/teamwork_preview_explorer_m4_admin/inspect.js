const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'scan_result.json'), 'utf8'));
const report = data.report;

function printGroup(name, filterFn) {
  console.log(`\n================== ${name} ==================`);
  let count = 0;
  Object.entries(report).forEach(([file, info]) => {
    if (filterFn(file)) {
      count++;
      const hexStr = info.hexCount > 0 ? `${info.hexCount} hex (${info.hexes.join(', ')})` : '0 hex';
      const uiStr = `btn: ${info.buttonCount}, tbl: ${info.tableCount}, in: ${info.inputCount}, sel: ${info.selectCount}, header: ${info.hasPageHeader}`;
      console.log(`- ${file} (${info.lines} lines) -> ${hexStr} | ${uiStr}`);
    }
  });
  console.log(`Total in ${name}: ${count} files`);
}

printGroup("1. Core & Bookings", f => f.includes('/bookings') || f.includes('/calendar') || f.includes('/checkin'));
printGroup("2. Members & Loyalty", f => f.includes('/members') || f.includes('/plans') || f.includes('/attendance') || f.includes('/loyalty') || f.includes('/coupons'));
printGroup("3. Revenue & Dashboards", f => f.includes('/razorpay') || f.includes('/phonepe') || f.includes('/reports') || f.includes('/wallets'));
printGroup("4. Tools & Operations", f => f.includes('/sports') || f.includes('/turfs') || f.includes('/tournaments') || f.includes('/banners') || f.includes('/audit') || f.includes('/app-logs') || f.includes('/app-versions') || f.includes('/server'));
printGroup("5. Admin NFC & Settings", f => f.includes('/settings') || f.includes('/admin/'));
printGroup("6. WhatsApp Modules", f => f.includes('/whatsapp'));
printGroup("7. Root & Layout", f => f.startsWith('src/app/(admin)/layout') || f.startsWith('src/app/(admin)/loading') || f.startsWith('src/app/(admin)/template') || f.startsWith('src/app/(admin)/page') || f.startsWith('src/app/(admin)/RecentBookingsClient'));
