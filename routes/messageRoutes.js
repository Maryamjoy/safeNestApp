const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const reportController = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');

// --- TASK 3.1.1 & 3.1.3: SEND MESSAGE ---
// The 'protect' guard checks the ID, then 'sendMessage' scans for scams.
router.post('/send', protect, messageController.sendMessage);

// --- TASK 3.3.3 & 4.3.2: REPORT & DISPUTE ---
// This door leads to the Ticket Generation brain.
router.post('/report', protect, reportController.createReport);

module.exports = router;