const { Pool } = require('pg');
const logger = require('./logger');

const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.SUPABASE_DATABASE_URL;

if (!connectionString) {
  logger.warn(
    '[DB] Missing DATABASE_URL/SUPABASE_DB_URL. Backend DB queries will fail until configured.',
  );
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  logger.info('Connected to Supabase PostgreSQL');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  // Do NOT exit, the pool will handle reconnecting on next query
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
