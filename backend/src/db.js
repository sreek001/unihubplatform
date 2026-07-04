const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres.wzojlmakqklkdwnbjafg:UniHubSecureDb2026!@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres",
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000
});

// Create a query function that uses the pool
const query = (text, params) => pool.query(text, params);

module.exports = {
  query, // Now you are exporting the function 'query'
  pool
};