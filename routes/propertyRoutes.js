const express = require('express');
const propertyController = require('../controllers/propertyController');
const authController = require('../controllers/authController');

const router = express.Router();

//Public Routes
router.get('/', propertyController.getAllProperties);
router.post('/', authController.protect, propertyController.createProperty);


//Protected Routes must be logged in to post listing.
router.get('/:id', propertyController.getProperty);
router.patch('/:id', authController.protect, propertyController.updateProperty);
router.delete('/:id', authController.protect, propertyController.deleteProperty);

module.exports = router;