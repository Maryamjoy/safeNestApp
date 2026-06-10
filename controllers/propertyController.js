const Property = require('../models/Property');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const property = require('../models/Property');

/**
 * CREATE NEW PROPERTY LISTING
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
exports.getAllProperties = catchAsync(async (req, res) => {

    // filter: Only show 'Verified' and 'Available' houses
    const properties = await Property.find({
        verification_status: 'Verified',
        availability_status: 'Available'
    }).populate({
        path: 'Landlord_id',
        select: 'fullName phone role registrationRanking'
    });

    res.status(200).json({
        status: 'Success',
        results: properties.length,
        data: { properties }
    });


});

/**
 * SEARCH & FILTER PROPERTIES
 * Allows users to find homes based on their specific needs.
 */
exports.searchProperties = catchAsync(async (req, res) => {

    // A. THE BASE FILTER (The "Security Guard")
    let filter = {
        verification_status: 'Verified',
        availability_status: 'Available'
    };

    // B. ADDING USER FILTERS (If they provided any)

    // 1. Filter by City
    if (req.query.city) {
        // We use 'regex' so if they type "lag", they find "Lagos"
        filter.city = { $regex: req.query.city, $options: 'i' };
    }

    // 2. Filter by Property Type (e.g., ?type=Self-contain)
    if (req.query.type) {
        filter.property_type = req.query.type;
    }

    // 3. Filter by Price Range (The "Budget" filter)
    if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {};
        if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice); // Greater than or equal
        if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice); // Less than or equal
    }

    // 4. Filter by Amenities
    if (req.query.amenities) {
        const amenitiesArray = req.query.amenities.split(',');
        filter.amenities = { $all: amenitiesArray };
    }

    // C. EXECUTE THE SEARCH
    const properties = await Property.find(filter)
        .populate({
            path: 'landlord_id',
            select: 'fullName phone role'
        })
        .sort({ createdAt: -1 }); // Newest listings first

    // D. SEND THE RESULTS
    res.status(200).json({
        status: 'Success',
        results: properties.length,
        data: { properties }
    });


});

/**
 * 4. UPDATE PROPERTY DETAILS
 * Allows a landlord to change the price, description, or availability.
 */
exports.updateProperty = catchAsync(async (req, res) => {
    let property = await Property.findById(req.params.id);

    if (!property) {
        return next(new AppError("House not found", 404));
    }

    // Only the landlord who owns this property can update it
    if (property.landlord_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError("You do not have permission to update this property", 403));
    }

    await Property.findByIdAndUpdate(req.params.id);
    res.status(200).json({
        status: 'Success',
        data: null
    });

});

/**
 * 5. DELETE PROPERTY
 * Removes a house from the platform forever.
 */
exports.deleteProperty = catchAsync(async (req, res) => {

    const property = await Property.findById(req.params.id);

    if (!property) {
        return next(new AppError("House not found", 404));
    }

    if (property.landlord_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError("You do not have permission to delete this property", 403));
    }

    await Property.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status: 'Success',
        data: null
    });
});

/**
 * 6. ADMIN VERIFICATION (The "Gold Stamp")
 * This is the CORE feature of your project. Only an Admin calls this.
 */
exports.verifyProperty = catchAsync(async (req, res) => {

    const verifiedProperty = await Property.findByIdAndUpdate(
        req.params.id,
        {
            verification_status: 'Verified',
            verifiedAt: Date.now()
        },
        { new: true, runValidators: true }
    );

    if (!verifiedProperty) {
        return next(new AppError("House not found", 404));
    }

    res.status(200).json({
        status: 'Success',
        message: "Property has been officially VERIFIED!",
        data: { property: verifiedProperty }
    });

});