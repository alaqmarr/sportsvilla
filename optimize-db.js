const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

console.log('Optimizing SQLite Database for concurrency...');

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('busy_timeout = 5000');

console.log('Current journal_mode:', db.pragma('journal_mode', { simple: true }));
console.log('Current synchronous:', db.pragma('synchronous', { simple: true }));

db.close();
console.log('Optimization complete!');
