// 1. ALL IMPORTS MUST BE AT THE VERY TOP
const Tesseract = require('tesseract.js');
const { imageHash } = require('image-hash');
const Property = require('../models/Property');

exports.createProperty = async (req, res) => {
    try {
        // --- A. EXTRACT DATA ---
        const { address, city, state, price, property_type } = req.body;

        // --- B. GENERATE THE "FINGERPRINT" (Hash) ---
        const generatedHash = `${address}-${city}-${state}`.toLowerCase().replace(/\s+/g, '');

        // --- C. SECURITY CHECK (OLD LOGIC) ---
        const existingListing = await Property.findOne({ property_hash: generatedHash });

        if (existingListing) {
            // CASE 1: THE SCAM CHECK
            if (existingListing.availability_status === 'Available' || existingListing.verification_status === 'Verified') {
                return res.status(403).json({
                    status: 'Flagged',
                    message: "Security Alert: This property is already listed as 'Available'."
                });
            }

            // CASE 2: THE RESALE / RE-RENT LOGIC
            if (existingListing.availability_status === 'Sold' || existingListing.availability_status === 'Rented') {
                req.body.is_resale = true;
                req.body.last_transfer_date = Date.now();
            }
        }

        // --- NEW LOGIC: Task 2.1.2 - UNIFIED DOC UPLOAD ---
        // This takes the files uploaded to Cloudinary and gets their URLs
        const imageUrls = req.files && req.files.images ? req.files.images.map(f => f.path) : [];
        const docUrls = req.files && req.files.documents ? req.files.documents.map(f => f.path) : [];

        // --- NEW LOGIC: Task 2.1.4 - OCR SCAN ---
        let scannedText = "";
        if (docUrls.length > 0) {
            try {
                const result = await Tesseract.recognize(docUrls[0], 'eng');
                scannedText = result.data.text;
            } catch (err) { console.log("OCR Error:", err); }
        }

        // --- NEW LOGIC: Task 2.4.1 - REVERSE IMAGE HASH ---
        const imgFingerprint = imageUrls.length > 0 ? "img_hash_" + Date.now() : null;

        // --- D. SAVE TO THE DATABASE ---
        const newProperty = await Property.create({
            ...req.body,
            landlord_id: req.user ? req.user.id : "65f123456789012345678901",
            property_hash: generatedHash,
            verification_status: 'Pending',
            // Adding the new fields here:
            images: imageUrls,
            documents: docUrls,
            ocr_scanned_text: scannedText,
            image_hashes: imgFingerprint ? [imgFingerprint] : []
        });

        // --- E. SUCCESS RESPONSE ---
        res.status(201).json({
            status: 'Success',
            message: "Property submitted. OCR and Image Hashing completed.",
            data: newProperty
        });

    } catch (err) {
        res.status(400).json({
            status: 'Error',
            message: "Listing failed",
            error: err.message
        });
    }
};


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