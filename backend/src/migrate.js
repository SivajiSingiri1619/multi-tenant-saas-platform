const fs = require('fs');
const path = require('path');
const { pool } = require('./config/db');

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'migrate.sql')).toString();
    await pool.query(sql);
    console.log('✅ Migrations completed');
    process.exit(0);
  } catch (e) {
    console.error('❌ Migration error', e);
    process.exit(1);
  }
})();
