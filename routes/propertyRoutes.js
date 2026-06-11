const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
//feature/user-module
const authController = require('../controllers/authController');

//clean extratction of the gatekeeper middleware.
const { protect, restrictTo } = authController;

//PUBLIC APP MARKETPLACE ENDPOINTS (No authentication required)
//GET /api/v1/properties/search -> custom filtering module.
router.get('/search', propertyController.searchProperties);

//GET /api/v1/properties/ -> Get all verified properties (for the public marketplace)
router.get('/', propertyController.getAllProperties);

//Apply security check globally to every endpoint written below this Point
router.use(protect);

router.route('/')
    .post(restrictTo('landlord', 'agent', 'admin'), propertyController.createProperty) //Only landlords, agents, and admins can create properties.

//PATCH /api/v1/properties/:id  securely update a specific property.
//DELETE /api/v1/properties/:id  securely delete a specific property.
router.route('/:id')
    .patch(restrictTo('landlord', 'agent', 'admin'), propertyController.updateProperty) //Only landlords, agents, and admins can update properties.
    .delete(restrictTo('landlord', 'agent', 'admin'), propertyController.deleteProperty); //Only landlords, agents, and admins can delete properties.

//ADMIN-ONLY ENDPOINTS

//PATCH /api/v1/properties/:id/verify.
router.patch('/:id/verify', restrictTo('admin'), propertyController.verifyProperty); //Only admins can verify properties.
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