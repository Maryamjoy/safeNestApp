const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// --- TASK 5.1.1: PLATFORM SAFETY KPIs ---
// Only an Admin can enter this door to see the Fraud Rate.
router.get('/dashboard-kpis', protect, restrictTo('admin'), analyticsController.getPlatformSafetyKPIs);

module.exports = router;