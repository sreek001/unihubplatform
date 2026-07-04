const express = require('express');
const router = express.Router();

const bookingController = require('./bookingController');


// Booking Routes
router.get('/venues', bookingController.getVenues);
router.get('/availability', bookingController.getAvailability);
router.post('/reserve', bookingController.reserveSlot);



module.exports = router;