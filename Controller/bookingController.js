const Booking = require('../Model/bookingModel');

// Create new booking (Tenant action)
const createBooking = async (req, res) => {
  try {
    const { propertyId, startDate, endDate } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (!property.isAvailable) {
      return res.status(400).json({ message: "Property is no longer available" });
    }

    const booking = new Booking({
      property: propertyId,
      tenant: req.user.id,
      landlord: property.landlord,
      startDate,
      endDate,
      totalAmount: property.pricePerMonth * 12, // Example: 1 year rent
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: "Booking request sent successfully!",
      booking
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get tenant's bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ tenant: req.user.id })
      .populate('property', 'title address city pricePerMonth images')
      .populate('landlord', 'name phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get landlord's bookings
const getLandlordBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ landlord: req.user.id })
      .populate('property', 'title address city')
      .populate('tenant', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Landlord approves or rejects booking
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body; 
    
    // approved or rejected
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only landlord can update
    if (booking.landlord.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = status;

    // If approved, mark property as unavailable
    if (status === 'approved') {
      await Property.findByIdAndUpdate(booking.property, { isAvailable: false });
    }
    await booking.save();

    res.json({
      success: true,
      message: 'Booking ${status} updated successfully'
    });
  } catch(error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getLandlordBookings,
  updateBookingStatus
};