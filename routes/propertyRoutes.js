const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const upload = require('../utils/cloudinary'); // 1. IMPORT OUR NEW UPLOADER

// --- A. THE CREATE ROUTE (Task 2.1.2 & 2.1.4) ---
// We add 'upload.fields' here. This tells the app to wait for files 
// called "images" and "documents" before running the controller.
router.post('/create', 
    upload.fields([
        { name: 'images', maxCount: 5 },    // Accept up to 5 photos
        { name: 'documents', maxCount: 2 } // Accept up to 2 verification docs
    ]), 
    propertyController.createProperty
);

// --- B. DISCOVERY ROUTES ---
router.get('/all', propertyController.getAllProperties);
router.get('/search', propertyController.searchProperties);

// --- C. MANAGEMENT ROUTES ---
router.patch('/update/:id', propertyController.updateProperty);
router.delete('/delete/:id', propertyController.deleteProperty);

// --- D. ADMIN ROUTES ---
router.patch('/verify/:id', propertyController.verifyProperty);

module.exports = router;