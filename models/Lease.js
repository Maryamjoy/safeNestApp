const mongoose = require('mongoose');

const LeaseSchema = new mongoose.Schema({
    propertyId: { type: mongoose.Schema.Types.ObjectId, required: true },
    landlordId: { type: mongoose.Schema.Types.ObjectId, required: true },
    renterId: { type: mongoose.Schema.Types.ObjectId },
    
    // --- TASK 6.1: CUSTOMIZATION ---
    rentAmount: { type: Number, required: true },
    leaseDuration: { type: String, required: true }, // e.g., "1 Year"
    customTerms: [String], // Array where landlord adds "No pets", etc.
    
    status: { 
        type: String, 
        enum: ['Draft', 'Sent', 'Signed', 'Active'], 
        default: 'Draft' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Lease', LeaseSchema);
