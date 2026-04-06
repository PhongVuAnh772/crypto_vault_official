const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected. Running schema.sql...');
    
    // Split schema into individual commands for better error reporting if needed,
    // though executing the block is usually fine for initial setup.
    await client.query(schemaSql);
    
    console.log('✅ Database schema initialized successfully!');
  } catch (err) {
    console.error('❌ Error executing schema:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
