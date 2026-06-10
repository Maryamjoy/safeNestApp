const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

//PUBLIC ENDPOINTS (No authentication required)
router.post('/register', authController.register);
router.post('/login', authController.login);

//PROTECTED ENDPOINTS (Authentication required for all routes below this middleware)

//The security Guard.
router.use(authController.protect);

//User profile Endpoints
router.get('/me', userController.getMe);
router.patch('/update-me', userController.updateMe);
router.patch('/update-my-password', authController.updateMyPassword);
router.delete('/delete-me', userController.deleteMe);

module.exports = router;