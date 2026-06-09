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
            values: ['apartment', 'house', 'self-contain', 'office', 'studio', 'shop',],
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
        address: {
            type: String,
            required: [true, 'Property address is required'],
            trim: true
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            trim: true
        }

    },
    bedrooms: {
        type: Number,
        default: 0
    },
    bathrooms: {
        type: Number,
        default: 0
    },
    images: [String], // Array of image URLs (will connect to file uploads later)

    //ANTI-FRAUD AND RELATIONSHIP FIELDS
    landlord: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // Links this property directly to a registered User document
        required: [true, 'A property must belong to a landlord or verified agent.']
    },
    isPropertyVerified: {
        type: Boolean,
        default: false // Set to false by default until admin verifies C of O or structural documents
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
},
    {
        timestamps: true, // Automatically manages createdAt and updatedAt fields
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

//populate middleware: Automatically attaches basic landlord details (name, email) when querying properties.
PropertySchema.pre(/^find/, async function () {
    this.populate({
        path: 'landlord',
        select: 'fullName email role isVerified'
    });
});

const Property = mongoose.model('Property', PropertySchema);

module.exports = Property;

    image_hashes: [String],
    ocr_scanned_text: { type: String },
    availability_status: { 
        type: String, 
        enum: ['Available', 'Rented', 'Sold', 'Under Maintenance'], 
        default: 'Available' 
    },