require('dotenv').config({ path: __dirname + '/.env' });
const db = require('./src/utils/db');

async function migrate() {
  try {
    console.log('Adding is_testnet column to chains table...');
    await db.query('ALTER TABLE chains ADD COLUMN IF NOT EXISTS is_testnet BOOLEAN DEFAULT FALSE');
    console.log('Column added successfully!');
  } catch (err) {
    console.error('Migration Error:', err);
  } finally {
    process.exit();
  }
}

migrate();
