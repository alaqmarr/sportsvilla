// scripts/migrate-safe.js
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.resolve(process.cwd(), 'dev.db');
if (!fs.existsSync(dbPath)) {
  console.error(`Database not found at ${dbPath}`);
  process.exit(1);
}

// 1. Force WAL checkpoint
console.log('Checkpointing SQLite WAL...');
const db = new Database(dbPath);
const checkpoint = db.pragma('wal_checkpoint(FULL)');
console.log('WAL Checkpoint result:', checkpoint);
db.close();

// 2. Create physical backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.resolve(process.cwd(), `dev.db.backup.${timestamp}`);
fs.copyFileSync(dbPath, backupPath);
console.log(`Backup created successfully: ${backupPath}`);
