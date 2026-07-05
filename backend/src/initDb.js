const fs = require('fs');
const path = require('path');
const { pool } = require('./db'); // Import the raw pool to manage clients natively

/**
 * Executes an entire SQL file inside a secure transaction block.
 * This perfectly handles complex logic, block structures ($$), conditional IFs, and triggers.
 */
async function executeSqlFile(filePath) {
  const sqlText = fs.readFileSync(filePath, 'utf8').trim();
  if (!sqlText) return;

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start transaction context
    await client.query(sqlText); // Send the entire file block raw to the engine
    await client.query('COMMIT'); // Commit structural changes safely
  } catch (err) {
    await client.query('ROLLBACK'); // Roll back on failure to avoid database corruption
    throw err;
  } finally {
    client.release(); // Return client back to the pool
  }
}

/**
 * Initializes the database schemas and seeds initial values sequentially.
 */
async function initDatabase() {
  try {
    // ─── 1. Booking schema ────────────────────────────────────────────────
    console.log('Restructuring Booking database via transaction script...');
    const bookingPath = path.join(__dirname, 'modules/booking/booking.sql');
    await executeSqlFile(bookingPath);
    console.log('🔹 Booking schema successfully verified and up to date.');

    // ─── 2. Lost & Found schema ───────────────────────────────────────────
    console.log('Restructuring Lost & Found database via transaction script...');
    const lostFoundPath = path.join(__dirname, 'modules/lostFound/lostFound.sql');
    await executeSqlFile(lostFoundPath);
    console.log('🔹 Lost & Found schema successfully verified and up to date.');

    console.log('✅ Database initialization and seeding completed successfully!');
  } catch (err) {
    console.error('❌ SQL Migration failed globally:', err.message);
    throw err;
  }
}

module.exports = {
  initDatabase,
};