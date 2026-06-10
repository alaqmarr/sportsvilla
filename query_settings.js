const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./prisma/dev.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the dev.db database.');
});

db.all("SELECT * FROM Setting", [], (err, rows) => {
  if (err) {
    throw err;
  }
  rows.forEach((row) => {
    console.log(row.key, row.value);
  });
});

db.close();
