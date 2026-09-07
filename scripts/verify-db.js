const Database = require('better-sqlite3');
const db = new Database('dev.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
console.log('Tables in dev.db:', tables);
console.log({
  members: db.prepare('SELECT count(*) as c FROM Member').get().c,
  bookings: db.prepare('SELECT count(*) as c FROM Booking').get().c,
  payments: db.prepare('SELECT count(*) as c FROM Payment').get().c,
  turfs: db.prepare('SELECT count(*) as c FROM Turf').get().c,
  transactions: db.prepare('SELECT count(*) as c FROM "Transaction"').get().c
});
db.close();
