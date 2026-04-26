const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runUltimateReset() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🚀 Starting Ultimate Database Reset...');
    await client.connect();
    console.log('✅ Connected to Database.');

    // 1. Run Nuclear Reset
    console.log('☢️ Running nuclear_reset.sql...');
    const resetSql = fs.readFileSync(path.join(__dirname, 'nuclear_reset.sql'), 'utf8');
    await client.query(resetSql);
    console.log('🗑️ Old database cleaned successfully.');

    // 2. Run Ultimate Schema
    console.log('🛠️ Running ultimate_schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'ultimate_schema.sql'), 'utf8');
    await client.query(schemaSql);
    console.log('✨ New database schema initialized successfully.');

    console.log('\n✅ ALL DONE! Your database is now fresh and fully linked.');
  } catch (err) {
    console.error('\n❌ ERROR during reset:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runUltimateReset();
