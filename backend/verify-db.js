// 1. Setup - load dotenv at the very top
require('dotenv').config();

const { Pool } = require('pg');

// 2. Debugging - Let's see what Node.js sees
console.log('--- DEBUGGING ---');
console.log('DATABASE_URL found:', !!process.env.DATABASE_URL);

// 3. Connect
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('Attempting connection to:', process.env.DATABASE_URL ? 'URL IS SET' : 'URL IS MISSING');
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Success! Database connected.');
    console.log('Database Time:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Connection failed. Error details:');
    console.error(err.message);
  } finally {
    await pool.end();
  }
}

testConnection();