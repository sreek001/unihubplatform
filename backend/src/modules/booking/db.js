const { Pool } = require('pg');
const dns = require('dns');
require('dotenv').config();


dns.setDefaultResultOrder('ipv4first');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;

pool.connect((err) => {
  if (err) {
    console.error("❌ CONNECTION ERROR:", err.message);
  } else {
    console.log("✅ SUCCESSFULLY CONNECTED TO SUPABASE!");
  }
});