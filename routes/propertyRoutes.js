const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
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

module.exports = router;