const mongoose = require('mongoose');

const LeaseSchema = new mongoose.Schema({
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    monthlyRent: Number,
    duration: String, // e.g., "1 year"
    terms: [String], // Task 6.1: Customization
    status: { type: String, enum: ['Draft', 'Active', 'Terminated'], default: 'Draft' }
}, { timestamps: true });

module.exports = mongoose.model('Lease', LeaseSchema);
