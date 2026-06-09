const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

const { protect } = require('../controllers/authController');


// This is the route to post a house
router.post('/create', protect, propertyController.createProperty);

// This is the route to see all houses
router.get('/all', propertyController.getAllProperties);


// telling the app when a user visits
router.get('/search', propertyController.searchProperties);

// Route to update a house (We use PATCH for updates)
router.patch('/update/:id', protect, propertyController.updateProperty);

// Route to delete a house
router.delete('/delete/:id', protect, propertyController.deleteProperty);

// Route for Admins to verify a house
router.patch('/verify/:id', protect, propertyController.verifyProperty);


module.exports = router;