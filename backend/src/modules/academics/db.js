const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.ACADEMICS_DB_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000
});

pool.Promise = global.Promise;

pool.on('error', (err) => {
  console.error('[Academics DB] Unexpected pool error:', err.message);
});

module.exports = pool;