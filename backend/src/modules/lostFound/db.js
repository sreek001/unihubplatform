const { Pool } = require('pg');

const pool = new Pool({
  // Point explicitly to the Academics/LostFound variable
  connectionString: process.env.ACADEMICS_DB_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000
});

pool.Promise = global.Promise;

pool.on('error', (err) => {
  console.error('[Lost & Found DB] Unexpected pool error:', err.message);
});

module.exports = pool;