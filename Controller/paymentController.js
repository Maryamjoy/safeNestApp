const Payment = require('../Model/paymentModel');
const Booking = require('../Model/bookingModel');
const paystack = require('paystack-api')(process.env.PAYSTACK_SECRET_KEY);

// Initiate Payment
const initiatePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('property')
      .populate('tenant');

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.tenant.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (booking.status !== 'approved') {
      return res.status(400).json({ message: "Booking must be approved first" });
    }

    const amountInKobo = booking.totalAmount * 100;

    const payment = new Payment({
      booking: bookingId,
      property: booking.property._id,
      tenant: req.user.id,
      landlord: booking.landlord,
      amount: booking.totalAmount,
      reference: `RENT-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      status: 'pending',
    });

    await payment.save();

    const response = await paystack.transaction.initialize({
      amount: amountInKobo,
      email: booking.tenant.email,
      reference: payment.reference,
      callback_url: `${process.env.FRONTEND_URL}/payment/callback`, // e.g. http://localhost:3000
      metadata: {
        bookingId,
        paymentId: payment._id.toString()
      }
    });

    res.status(200).json({
      success: true,
      authorization_url: response.data.authorization_url,
      reference: payment.reference,
      payment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to initialize payment", error: error.message });
  }
};

//Verify Payment
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const payment = await Payment.findOne({ reference });
    if (!payment) return res.status(404).json({ message: "Payment record not found" });

    const response = await paystack.transaction.verify(reference);

    if (response.data.status === "success") {
      payment.status = 'successful';
      payment.transactionId = response.data.id;
      await payment.save();

      // Update Booking
      await Booking.findByIdAndUpdate(payment.booking, {
        status: 'active',
        paymentStatus: 'paid'
      });

      res.json({ success: true, message: "Payment successful!", payment });
    } else {
      payment.status = 'failed';
      await payment.save();
      res.json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
};

const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ tenant: req.user.id })
      .populate('property', 'title')
      .populate('booking')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
  getMyPayments
};