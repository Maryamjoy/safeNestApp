const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const upload = require('../utils/cloudinary'); 
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// --- A. THE CREATE ROUTE ---
// Task 2.1.2 & 2.1.4: Multi-platform upload + Security
router.post('/create', 
    protect, 
    restrictTo('landlord', 'agent', 'admin'), 
    upload.fields([
        { name: 'images', maxCount: 5 },
        { name: 'documents', maxCount: 2 }
    ]), 
    propertyController.createProperty
);

// --- B. DISCOVERY ROUTES ---
// Task 2.5.1: Search and Browse verified listings
router.get('/all', propertyController.getAllProperties);
router.get('/search', propertyController.searchProperties);

// --- C. MANAGEMENT ROUTES ---
// Task 2.3.2: Allow landlords to manage their listings securely
router.patch('/update/:id', protect, propertyController.updateProperty);
router.delete('/delete/:id', protect, propertyController.deleteProperty);

// --- D. ADMIN ROUTES ---
// Task 1.4.1: Admin-only verification for badges
router.patch('/verify/:id', protect, restrictTo('admin'), propertyController.verifyProperty);

module.exports = router;