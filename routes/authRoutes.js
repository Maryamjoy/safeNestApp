const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

//public route for user registration
router.post('/register', authController.register);
router.post('/login', authController.login);

//protected route for user dashboard
router.get('/me', authController.protect, (req, res) => {
    res.status(200).json({
        status: 'success',
        message: `Welcome to your dashboard, ${req.user.fullName}!`,
        data: {
            user: req.user
        }
    });
});


module.exports = router;

