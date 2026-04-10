const db = require('./src/utils/db');
require('dotenv').config();

async function addCol() {
  try {
    console.log('Adding column if not exists...');
    await db.query('ALTER TABLE tokens ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false');
    console.log('Success!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit();
  }
}

addCol();
