const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

//Security Helper function.
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

//GET /api/v1/users/me -> Get current user profile.
exports.getMe = catchAsync(async (req, res, next) => { 
    res.status(200).json({
        status: 'success',
        data: {
             user: req.user
         }
     });
});

// PATCH /api/v1/users/updateMe -> Securely update profile fields
exports.updateMe = catchAsync(async (req, res, next) => { 
    //Guardrail to block password modification on this endpoint.
    if (req.body.password || req.body.passwordConfirm  ) {
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
    }

     //to filter out unwanted fields that are not allowed to be updated
    const filterBody = filterObj(req.body, 'fullName', 'phone');

    //update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
        new: true, //return the updated document payload
        runValidators: true //run schema validators on the update operation
    });

    res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: {
            user: updatedUser
        }
    }); 
});

// DELETE /api/v1/users/deleteMe -> Soft-deactivate current profile
exports.deleteMe = catchAsync(async (req, res, next) => { 
    // Soft delete preserves user transaction records while barring access tokens from logging in
    await User.findByIdAndUpdate(req.user.id, { isActive: false });

    res.status(204).json({
        status: 'success',
        message: 'Your account has been deactivated. We hope to see you back soon!',
        data: null
    });
});
