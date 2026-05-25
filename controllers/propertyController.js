const Property = require('../models/Property');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

//Create new property
exports.createProperty = catchAsync(async (req, res, next) => {
    //the lanlord's ID has to be the logged-in user ID
    req.body.landlord = req.user.id;
    
    //Ensures that the property is not automatically verified upon creation, even if the client tries to set isPropertyVerified to true in the request body. This is a security measure to prevent unauthorized property verification.
    if (req.body.isPropertyVerified) req.body.isPropertyVerified = false;
    req.body.verificationStatus = 'pending';

    const newProperty = await Property.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            property: newProperty
        }
    });
});

//Get all properties
exports.getAllProperties = catchAsync(async (req, res, next) => {
    //fetch all the properties from the database
    const properties = await Property.find();

    res.status(200).json({
        status: 'success',
        results: properties.length,
        data: {
            properties
        }
    });
});

//get a single property by ID
exports.getProperty = catchAsync(async (req, res, next) => { 
    const property = await Property.findById(req.params.id);
     
    //if no property matches the provided ID, return a 404 error response with a message indicating that no property was found with that ID. 
    if (!property) { 
        return next(new AppError('No property found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            property
        }
    });
});

//update an existing property.
exports.updateProperty = catchAsync(async (req, res, next) => {
    if (req.body.isPropertyVerified) req.body.isPropertyVerified = false;
    if (req.body.verificationStatus) req.body.verificationStatus = 'pending';

    const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!property) {
        return next(new AppError('No property found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            property
        }
    });
    
});

//Delete a property listing

exports.deleteProperty = catchAsync(async (req, res, next) => {
    const property = await property.findByIdAndDelete(req.params.id);

    if (!property) {
        return next(new AppError('No property found with that ID', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
});