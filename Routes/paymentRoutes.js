const express = require('express')
const router = express.Router();
const {
    initiatepayment,
    verifypayment,
    getMypayments
}= require('../Controller/paymentController');
const protect = require('../middleware/auth');

//protected routes
router.post('/initiate', protect, initiatepayment);
router.get('/verify/:reference', protect, verifypayment);
router.get('/my-payments', protect, getMypayments);
module.exports = router;