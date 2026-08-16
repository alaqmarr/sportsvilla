const Database = require('better-sqlite3');
const db = new Database('whatsapp.db');

const rows = db.prepare(`SELECT id, phoneNumber, type, status, errorMessage, createdAt FROM WhatsAppMessage ORDER BY createdAt DESC LIMIT 5`).all();
console.table(rows);
