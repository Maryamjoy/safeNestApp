const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

//The security Guard: Protects all the routes that comes after this middleeware line.
router.use(authController.protect);

//User profile Endpoints
router.get('/me', userController.getMe);
router.patch('/update-me', userController.updateMe);
router.delete('/delete-me', userController.deleteMe);

module.exports = router;