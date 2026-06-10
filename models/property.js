const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Unique identifier for security

const PropertySchema = new mongoose.Schema({
    
    // ==========================================
    // 1. SYSTEM IDENTIFIERS (The "ID Cards")
    // ==========================================
    
    // Unique ID used for the frontend (hides our internal DB structure)
    uuid: {
        type: String,
        default: () => uuidv4(), // a new uuid is generated for each property
        unique: true
    },
    // Links this property to the specific Landlord/Agent in the User table
    landlord_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "A listing must be attached to a verified user"]
    },

    // ==========================================
    // 2. CORE LISTING DETAILS (The "Basics")
    // ==========================================
    
    title: {
        type: String,
        required: [true, "Property title is required (e.g. Luxury 2-Bedroom in Lekki)"],
        trim: true,
        maxlength: [100, "Title is too long"]
    },
    description: {
        type: String,
        required: [true, "A detailed description is mandatory for transparency"],
    },
    property_type: {
        type: String,
        required: [true, "You must specify the type of property"],
        enum: {
            values: ['Flat', 'Self-contain', 'Duplex', 'Studio', 'Office', 'Bungalow', 'Mansionette'],
            message: '{VALUE} is not a valid property type'
        }
    },

    // ==========================================
    // 3. GEOGRAPHIC DATA (The "Map")
    // ==========================================
    
    address: { 
        type: String, 
        required: [true, "Street address is required"] 
    },
    city: { 
        type: String, 
        required: [true, "City is required"] 
    },
    state: { 
        type: String, 
        required: [true, "State is required (e.g., Lagos, Abuja, Rivers)"] 
    },
    // GPS Coordinates: Prevents "Ghost Listings" by fixing the house to the earth
    location: {
        type: { type: String, default: 'Point' },
        coordinates: {
            type: [Number], // [Longitude, Latitude]
            required: [true, "GPS coordinates are required for verification"]
        }
    },

    // ==========================================
    // 4. FINANCIALS (The "Money" & Transparency)
    // ==========================================
    
    price: {
        type: Number,
        required: [true, "The base rent/sale price must be stated"]
    },
    currency: {
        type: String,
        default: 'NGN',
        enum: ['NGN', 'USD']
    },
    // Nigerian Transparency Fees: No more "Hidden Charges"
    agency_fee: { type: Number, default: 0 },
    legal_fee: { type: Number, default: 0 },
    caution_fee: { type: Number, default: 0 },
    service_charge: { type: Number, default: 0 },
    inspection_fee: { 
        type: Number, 
        default: 0, 
        help: "The fee the agent charges for viewing the property" 
    },

    // ==========================================
    // 5. AMENITIES & SPECS (The "Living Quality")
    // ==========================================
    
    amenities: {
        type: [String], // Array: ["WiFi", "Swimming Pool", "24/7 Security"]
        default: []
    },
    electricity_type: {
        type: String,
        enum: ['Prepaid Meter', 'Postpaid', 'Solar Only', 'None'],
        default: 'Prepaid Meter'
    },
    water_source: {
        type: String,
        enum: ['Borehole', 'Public Water', 'Well', 'Tanker Only'],
        default: 'Borehole'
    },

    // ==========================================
    // 6. MEDIA & TRUST ASSETS (The "Evidence")
    // ==========================================
    
    // Photos of the property (Hosted on Cloudinary/S3)
    images: {
        type: [String],
        required: [true, "A minimum of 3 property images is required"]
    },
    // Verification documents (C of O, Deed, Utility Bills)
    documents: {
        type: [String],
        required: [true, "Proof of ownership/authority to list must be uploaded"]
    },

    // ==========================================
    // 7. STATUS & TRUST (The "Security Guard")
    // ==========================================
    
    verification_status: {
        type: String,
        enum: ['Pending', 'Verified', 'Rejected', 'Under Review'],
        default: 'Pending'
    },
    availability_status: {
        type: String,
        enum: ['Available', 'Rented', 'Sold', 'Under Maintenance', 'Off-Market'],
        default: 'Available'
    },

    // ==========================================
    // 8. ADVANCED ANTI-FRAUD & RESALE LOGIC
    // ==========================================
    
    // The "Fingerprint": A hash of the address + city + state
    property_hash: {
        type: String,
        unique: true
    },
    // Tracks if this property was previously listed and sold/transferred
    is_resale: {
        type: Boolean,
        default: false
    },
    last_transfer_date: {
        type: Date
    },
    // If a second person tries to list an 'Available' house, it creates a dispute
    is_disputed: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true, // Automatically track 'createdAt' and 'updatedAt'
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ==========================================
// SMART LOGIC & VIRTUALS
// ==========================================

/**
 * 1. THE TOTAL PACKAGE CALCULATOR
 * Automatically sums up all fees so the Renter sees the final cost immediately.
 */
PropertySchema.virtual('total_package').get(function() {
    return this.price + this.agency_fee + this.legal_fee + this.caution_fee + this.service_charge;
});

/**
 * 2. ADDRESS FINGERPRINTING (Pre-Save Hook)
 * This prevents two people from listing the same house address at the same time.
 */
PropertySchema.pre('save', async function(next) {
    // Generate the hash
    const generatedHash = `${this.address}-${this.city}-${this.state}`
        .toLowerCase()
        .replace(/\s+/g, '');
    
    this.property_hash = generatedHash;

});

// ==========================================
// PERFORMANCE INDEXING
// ==========================================
// Makes the app super fast when searching through thousands of houses
PropertySchema.index({ price: 1, city: 1, verification_status: 1 });
PropertySchema.index({ location: '2dsphere' }); // For searching "Houses near me"

module.exports = mongoose.model('Property', PropertySchema);