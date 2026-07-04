const fs = require('fs');
const path = require('path');
const { query } = require('./db');

/**
 * Initializes the database schemas and seeds initial values by executing
 * the modular raw SQL files directly.
 */
async function initDatabase() {
  try {

    console.log('Restructuring Booking database using booking.sql...');
    const bookingSql = fs.readFileSync(
      path.join(__dirname, 'modules/booking/booking.sql'),
      'utf8'
    );
    await query(bookingSql);

    console.log('Restructuring Lost & Found database using lostFound.sql...');
    const lostFoundSql = fs.readFileSync(
      path.join(__dirname, 'modules/lostFound/lostFound.sql'),
      'utf8'
    );
    await query(lostFoundSql);

    console.log('Database initialization and seeding completed successfully!');
  } catch (err) {
    console.error('Failed to run modular SQL migrations:', err.message);
    throw err; // Let index.js catch it and trigger hybrid simulation warning
  }
}

module.exports = {
  initDatabase,
};
