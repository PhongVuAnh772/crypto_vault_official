const { Pool } = require('pg');
const logger = require('./logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  logger.info('Connected to Supabase (PostgreSQL)');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  // Do NOT exit, the pool will handle reconnecting on next query
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
