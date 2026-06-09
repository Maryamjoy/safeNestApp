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

    // --- ANTI-FRAUD & SECURITY FIELDS (The New Gaps) ---
    property_hash: { type: String, unique: true }, // For Address Fingerprinting
    image_hashes: [String],                        // Task 2.4.1: For Reverse Image Search
    ocr_scanned_text: { type: String },            // Task 2.1.4: For OCR Setup
    
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

// Middleware to automatically show landlord details
PropertySchema.pre(/^find/, function (next) {
    this.populate({
        path: 'landlord',
        select: 'fullName email role isVerified'
    });
    next();
});

const Property = mongoose.model('Property', PropertySchema);
module.exports = Property;