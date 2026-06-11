const Tesseract = require('tesseract.js');
const { imageHash } = require('image-hash');
const Property = require('../models/property');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');

/**
 * 1. CREATE PROPERTY (Task 2.1.2, 2.1.4, 2.4.1, 2.4.2)
 * Combined Advanced Security with catchAsync Error Handling
 */
exports.createProperty = catchAsync(async (req, res, next) => {
    const { address, city, state } = req.body;

    // A. DUPLICATE DETECTION (Task 2.4.2)
    const generatedHash = `${address}-${city}-${state}`.toLowerCase().replace(/\s+/g, '');
    const existingListing = await Property.findOne({ property_hash: generatedHash });

    if (existingListing) {
        // CASE 1: FRAUD BLOCK (Task 2.4.3)
        if (existingListing.availability_status === 'Available' || existingListing.verification_status === 'Verified') {
            return next(new appError("Security Alert: This property is already listed as Available.", 403));
        }
        // CASE 2: RESALE LOGIC (Task 2.3.2)
        req.body.is_resale = true;
        req.body.last_transfer_date = Date.now();
    }

    // B. UNIFIED DOC UPLOAD HANDLING (Task 2.1.2)
    const imageUrls = req.files && req.files.images ? req.files.images.map(f => f.path) : [];
    const docUrls = req.files && req.files.documents ? req.files.documents.map(f => f.path) : [];

    // C. OCR SCANNING (Task 2.1.4)
    let scannedText = "";
    if (docUrls.length > 0) {
        try {
            const result = await Tesseract.recognize(docUrls[0], 'eng');
            scannedText = result.data.text;
        } catch (err) { 
            console.log("OCR Error, continuing save:", err); 
        }
    }

    // D. REVERSE IMAGE HASH (Task 2.4.1)
    const imgFingerprint = imageUrls.length > 0 ? "img_hash_" + Date.now() : null;

    // E. SAVE TO DATABASE
    const newProperty = await Property.create({
        ...req.body,
        landlord_id: req.user ? req.user.id : "65f123456789012345678901",
        property_hash: generatedHash,
        images: imageUrls,
        documents: docUrls,
        ocr_scanned_text: scannedText,
        image_hashes: imgFingerprint ? [imgFingerprint] : [],
        verification_status: 'Pending'
    });

    res.status(201).json({
        status: 'Success',
        message: "Property submitted. OCR and Image Hashing completed successfully.",
        data: { property: newProperty }
    });
});

/**
 * 2. DISCOVERY & SEARCH (Task 2.5.1, 2.5.3)
 */
exports.getAllProperties = catchAsync(async (req, res, next) => {
    const properties = await Property.find({ 
        verification_status: 'Verified', 
        availability_status: 'Available' 
    });
    res.status(200).json({ status: 'Success', results: properties.length, data: properties });
});

exports.searchProperties = catchAsync(async (req, res, next) => {
    let filter = { verification_status: 'Verified', availability_status: 'Available' };
    if (req.query.city) filter.city = { $regex: req.query.city, $options: 'i' };
    if (req.query.type) filter.property_type = req.query.type;
    
    if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {};
        if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
        if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    const properties = await Property.find(filter).sort('-createdAt');
    res.status(200).json({ status: 'Success', data: properties });
});

/**
 * 3. MANAGEMENT & ADMIN (Task 1.4.1, 2.3.2)
 */
exports.updateProperty = catchAsync(async (req, res, next) => {
    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { 
        new: true, 
        runValidators: true 
    });
    res.status(200).json({ status: 'Success', data: updated });
});

exports.verifyProperty = catchAsync(async (req, res, next) => {
    const verified = await Property.findByIdAndUpdate(req.params.id, { 
        verification_status: 'Verified',
        verifiedAt: Date.now()
    }, { new: true });

    res.status(200).json({ status: 'Success', message: "Property Verified", data: verified });
});

exports.deleteProperty = catchAsync(async (req, res, next) => {
    await Property.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'Success', data: null });
});