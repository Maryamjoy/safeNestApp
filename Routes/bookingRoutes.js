const express = require('express');
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getLandlordBookings,
  updateBookingStatus
} = require('../Controller/bookingController');

const protect = require('../middleware/auth');

// Tenant Routes
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);

// Landlord Routes
router.get('/landlord-bookings', protect, getLandlordBookings);
router.put('/:bookingId/status', protect, updateBookingStatus);

module.exports = router;