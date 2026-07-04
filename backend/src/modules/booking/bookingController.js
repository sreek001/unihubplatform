const pool = require('./db');

// Maps frontend grid strings directly to your database TIME columns
const mapSlotToTimes = (slotString) => {
  const maps = {
    "08:00 to 09:00": { start: "08:00:00", end: "09:00:00" },
    "09:00 to 10:00": { start: "09:00:00", end: "10:00:00" },
    "10:00 to 11:00": { start: "10:00:00", end: "11:00:00" },
    "11:00 to 12:00": { start: "11:00:00", end: "12:00:00" },
    "12:00 to 13:00": { start: "12:00:00", end: "13:00:00" },
    "13:00 to 14:00": { start: "13:00:00", end: "14:00:00" },
    "14:00 to 15:00": { start: "14:00:00", end: "15:00:00" },
    "15:00 to 16:00": { start: "15:00:00", end: "16:00:00" },
    "16:00 to 17:00": { start: "16:00:00", end: "17:00:00" }
  };
  return maps[slotString] || { start: "08:00:00", end: "09:00:00" };
};

exports.getVenues = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM venues ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching venues:', err.message);
    res.status(500).json({ error: 'Failed to load venues.' });
  }
};

exports.getAvailability = async (req, res) => {
  const { venueId, date } = req.query;
  if (!venueId || !date) {
    return res.status(400).json({ error: 'venueId and date parameters are required.' });
  }

  try {
    const bookedSlotsQuery = await pool.query(
      `SELECT start_time, end_time, status FROM bookings 
             WHERE venue_id = $1 AND event_date = $2 AND status != 'REJECTED'`,
      [venueId, date]
    );

    // Map database records back into a clean lookup string for the frontend grid
    const availabilityMap = {};
    bookedSlotsQuery.rows.forEach(row => {
      const startStr = row.start_time.slice(0, 5); // "08:00:00" -> "08:00"
      const endStr = row.end_time.slice(0, 5);     // "09:00:00" -> "09:00"
      availabilityMap[`${startStr} to ${endStr}`] = row.status;
    });

    res.json(availabilityMap);
  } catch (err) {
    console.error('Error fetching availability:', err.message);
    res.status(500).json({ error: 'Failed to parse availability.' });
  }
};

exports.reserveSlot = async (req, res) => {
  const { venue_id, date, time_slot, event_name, user_name, user_role } = req.body;
  if (!venue_id || !date || !event_name || !time_slot) {
    return res.status(400).json({ error: 'Missing core booking properties.' });
  }

  const { start, end } = mapSlotToTimes(time_slot);

  try {
    const insertResult = await pool.query(
      `INSERT INTO bookings (venue_id, user_id, user_name, user_role, event_name, event_date, start_time, end_time, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'APPROVED') RETURNING *`,
      [venue_id, 1, user_name || 'Sreehari K.', user_role || 'STUDENT', event_name, date, start, end]
    );
    res.status(201).json({ success: true, booking: insertResult.rows[0] });
  } catch (err) {
    console.error('Error executing booking insert:', err.message);
    if (err.message.includes('no_approved_overlap')) {
      return res.status(409).json({ error: 'This venue slot is already secured.' });
    }
    res.status(500).json({ error: 'Database reservation failure.' });
  }
};