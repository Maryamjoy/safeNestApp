const Property = require('../models/Property');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * CREATE NEW PROPERTY LISTING
 * This is the "Brain" that handles the logic you asked for:
 * 1. Blocks scammers if a house is already 'Available'.
 * 2. Allows 'Resale' if the previous owner is finished with the house.
 */

/**
 * CREATE NEW PROPERTY LISTING
 */
exports.createProperty = catchAsync(async (req, res, next) => {
    // A. EXTRACT DATA
    const { address, city, state } = req.body;

    // B. GENERATE THE "FINGERPRINT" (Hash)
    const generatedHash = `${address}-${city}-${state}`.toLowerCase().replace(/\s+/g, '');

    // C. SECURITY CHECK: Does this address exist in our "Vault"?
    const existingListing = await Property.findOne({ property_hash: generatedHash });

    if (existingListing) {
        // --- CASE 1: THE SCAM CHECK ---
        if (existingListing.availability_status === 'Available' || existingListing.verification_status === 'Verified') {
            return res.status(403).json({
                status: 'Flagged',
                message: "Security Alert: This property is already listed as 'Available' by another agent. An ownership dispute has been opened.",
                action: "Please upload your Certificate of Occupancy to the Dispute Section to prove you are the real owner."
            });
        }

        // --- CASE 2: THE RESALE / RE-RENT LOGIC ---
        if (existingListing.availability_status === 'Sold' || existingListing.availability_status === 'Rented') {
            console.log("Resale detected. Allowing new listing with mandatory document verification.");
            req.body.is_resale = true;
            req.body.last_transfer_date = Date.now();
        }
    }

    // D. SAVE TO THE DATABASE
    const newProperty = await Property.create({
        ...req.body,
        landlord_id: req.user._id, // Cleanly supplied by protect middleware!
        property_hash: generatedHash,
        verification_status: 'Pending'
    });

    // E. SUCCESS RESPONSE
    res.status(201).json({
        status: 'Success',
        message: "Property submitted for verification. It will appear live once our team confirms your documents.",
        data: {
            property: newProperty
        }
    });
});

/**
 * GET ALL VERIFIED PROPERTIES
 * This ensures regular users ONLY see houses that have been "Gold-Stamped" by Admin.
 */
exports.getAllProperties = async (req, res) => {
    try {
        // We filter: Only show 'Verified' and 'Available' houses
        const properties = await Property.find({ 
            verification_status: 'Verified',
            availability_status: 'Available' 
        });

        res.status(200).json({
            status: 'Success',
            results: properties.length,
            data: properties
        });
    } catch (err) {
        res.status(404).json({ status: 'Fail', message: err.message });
    }

};

/**
 * SEARCH & FILTER PROPERTIES
 * This function allows users to find homes based on their specific needs.
 */
exports.searchProperties = async (req, res) => {
    try {
        // A. THE BASE FILTER (The "Security Guard")
        // We start by saying: ONLY show Verified and Available homes.
        // This is how we solve the "Fraud Gap" in the industry.
        let filter = { 
            verification_status: 'Verified', 
            availability_status: 'Available' 
        };

        // B. ADDING USER FILTERS (If they provided any)

        // 1. Filter by City (e.g., ?city=Lagos)
        if (req.query.city) {
            // We use 'regex' so if they type "lag", they find "Lagos"
            filter.city = { $regex: req.query.city, $options: 'i' }; 
        }

        // 2. Filter by Property Type (e.g., ?type=Self-contain)
        if (req.query.type) {
            filter.property_type = req.query.type;
        }

        // 3. Filter by Price Range (The "Budget" filter)
        // This is huge for Nigerian students/professionals
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice); // Greater than or equal
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice); // Less than or equal
        }

        // 4. Filter by Amenities (e.g., ?amenities=WiFi,Borehole)
        if (req.query.amenities) {
            // Converts "WiFi,Borehole" into an array and looks for properties that have BOTH
            const amenitiesArray = req.query.amenities.split(',');
            filter.amenities = { $all: amenitiesArray };
        }

        // C. EXECUTE THE SEARCH
        // We sort by 'createdAt' so the newest houses appear first
        const properties = await Property.find(filter).sort({ createdAt: -1 });

        // D. SEND THE RESULTS
        res.status(200).json({
            status: 'Success',
            results: properties.length,
            data: properties
        });

    } catch (err) {
        res.status(400).json({
            status: 'Error',
            message: "Search failed",
            error: err.message
        });
    }
};

/**
 * 4. UPDATE PROPERTY DETAILS
 * Allows a landlord to change the price, description, or availability.
 */
exports.updateProperty = async (req, res) => {
    try {
        // We find the house by its ID and update it with the new info (req.body)
        const updatedProperty = await Property.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true } // 'new' returns the updated house, not the old one
        );

        if (!updatedProperty) {
            return res.status(404).json({ status: 'Fail', message: "House not found" });
        }

        res.status(200).json({
            status: 'Success',
            message: "Property updated successfully",
            data: updatedProperty
        });
    } catch (err) {
        res.status(400).json({ status: 'Error', message: err.message });
    }
};

/**
 * 5. DELETE PROPERTY
 * Removes a house from the platform forever.
 */
exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findByIdAndDelete(req.params.id);

        if (!property) {
            return res.status(404).json({ status: 'Fail', message: "House not found" });
        }

        res.status(204).json({ // 204 means "No Content" (Success but nothing to show)
            status: 'Success',
            data: null
        });
    } catch (err) {
        res.status(400).json({ status: 'Error', message: err.message });
    }
};

/**
 * 6. ADMIN VERIFICATION (The "Gold Stamp")
 * This is the CORE feature of your project. Only an Admin calls this.
 */
exports.verifyProperty = async (req, res) => {
    try {
        // We find the house and specifically change its status to 'Verified'
        const verifiedProperty = await Property.findByIdAndUpdate(
            req.params.id,
            { 
                verification_status: 'Verified',
                verifiedAt: Date.now() 
            },
            { new: true }
        );

        if (!verifiedProperty) {
            return res.status(404).json({ status: 'Fail', message: "House not found" });
        }

        res.status(200).json({
            status: 'Success',
            message: "Property has been officially VERIFIED!",
            data: verifiedProperty
        });
    } catch (err) {
        res.status(400).json({ status: 'Error', message: err.message });
    }
};