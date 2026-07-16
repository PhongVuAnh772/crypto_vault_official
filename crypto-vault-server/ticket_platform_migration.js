/**
 * Ticket Platform Migration Runner
 * Runs the ticket_platform_schema.sql against the database
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./src/utils/db');

async function runMigration() {
  console.log('🎫 Running Ticket Platform Migration...');
  console.log('========================================');

  try {
    const schemaPath = path.join(__dirname, 'ticket_platform_schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf-8');

    // Split by semicolons and filter empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let skipCount = 0;

    for (const statement of statements) {
      try {
        await db.query(statement + ';');
        successCount++;
        // Extract table/index name for logging
        const match = statement.match(/CREATE\s+(?:TABLE|INDEX|TYPE)\s+(?:IF NOT EXISTS\s+)?(\S+)/i);
        if (match) {
          console.log(`  ✅ Created: ${match[1]}`);
        }
      } catch (err) {
        if (err.message.includes('already exists')) {
          skipCount++;
          const match = statement.match(/CREATE\s+(?:TABLE|INDEX|TYPE)\s+(?:IF NOT EXISTS\s+)?(\S+)/i);
          if (match) {
            console.log(`  ⏭️  Skipped (exists): ${match[1]}`);
          }
        } else {
          console.error(`  ❌ Error: ${err.message}`);
          console.error(`     Statement: ${statement.substring(0, 100)}...`);
        }
      }
    }

    console.log('========================================');
    console.log(`✅ Migration complete: ${successCount} created, ${skipCount} skipped`);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }

  process.exit(0);
}

runMigration();
