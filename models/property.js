const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Property title is required'],
        trim: true,
        maxlength: [100, 'Property title must be less than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Property description is required'],
        trim: true,
    },
    propertyType: {
        type: String,
        required: [true, 'Specify the property type.'],
        enum: {
            values: ['apartment', 'house', 'self-contain', 'office', 'studio', 'shop'],
            message: 'Property type must be either: apartment, house, self-contain, office, studio, or shop'
        }
    },
    price: {
        type: Number,
        required: [true, 'Property price is required'],
        min: [0, 'Price must be a positive number']
    },
    pricePeriod: {
        type: String,
        required: [true, 'Specify the price period (e.g., monthly, yearly).'],
        enum: ['per-month', 'per-year'],
        default: 'per-year'
    },
    location: {
        address: { type: String, required: [true, 'Property address is required'], trim: true },
        city: { type: String, required: [true, 'City is required'], trim: true },
        state: { type: String, required: [true, 'State is required'], trim: true }
    },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    images: [String],
    documents: [String], // Added for Task 2.1.2

    // --- ANTI-FRAUD & SECURITY FIELDS ---
    property_hash: { type: String, unique: true }, // For Address Fingerprinting
    image_hashes: [String],                        // Task 2.4.1: For Reverse Image Search
    ocr_scanned_text: { type: String },            // Task 2.1.4: For OCR Setup
    
    // --- FINANCIAL TRANSPARENCY FIELDS ---
    agency_fee: { type: Number, default: 0 },
    legal_fee: { type: Number, default: 0 },
    caution_fee: { type: Number, default: 0 },
    service_charge: { type: Number, default: 0 },

    landlord: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A property must belong to a landlord or verified agent.']
    },
    isPropertyVerified: {
        type: Boolean,
        default: false
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    availability_status: {
        type: String,
        enum: ['Available', 'Rented', 'Sold', 'Under Maintenance'],
        default: 'Available'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// =======================================================
// SMART LOGIC, MIDDLEWARE & VIRTUALS (ALL RESOLVED HERE)
// =======================================================

// 1. POPULATE LANDLORD: Automatically show landlord details when finding a house
PropertySchema.pre(/^find/, function (next) {
    this.populate({
        path: 'landlord',
        select: 'fullName email role isVerified'
    });
    next();
});

/**
 * 2. THE TOTAL PACKAGE CALCULATOR
 * Automatically sums up all fees so the Renter sees the final cost immediately.
 */
PropertySchema.virtual('total_package').get(function() {
    return this.price + this.agency_fee + this.legal_fee + this.caution_fee + this.service_charge;
});

/**
 * 3. ADDRESS FINGERPRINTING (Pre-Save Hook)
 * This prevents two people from listing the same house address at the same time.
 */
PropertySchema.pre('save', async function (next) {
    // Generate the unique hash from location fields
    const generatedHash = `${this.location.address}-${this.location.city}-${this.location.state}`
        .toLowerCase()
        .replace(/\s+/g, '');
    
    this.property_hash = generatedHash;
    next();
});

const Property = mongoose.model('Property', PropertySchema);
module.exports = Property;