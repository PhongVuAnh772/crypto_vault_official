const db = require('./src/utils/db');
require('dotenv').config();

async function fixTokensTable() {
  try {
    console.log('Adding updated_at column to tokens table...');
    await db.query('ALTER TABLE tokens ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()');
    console.log('Success!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit();
  }
}

fixTokensTable();
