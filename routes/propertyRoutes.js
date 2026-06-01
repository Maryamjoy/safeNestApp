const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

// This is the route to post a house
router.post('/create', propertyController.createProperty);

// This is the route to see all houses
router.get('/all', propertyController.getAllProperties);

module.exports = router;

// telling the app when a user visits
router.get('/search', propertyController.searchProperties);

// Route to update a house (We use PATCH for updates)
router.patch('/update/:id', propertyController.updateProperty);

// Route to delete a house
router.delete('/delete/:id', propertyController.deleteProperty);

// Route for Admins to verify a house
router.patch('/verify/:id', propertyController.verifyProperty);