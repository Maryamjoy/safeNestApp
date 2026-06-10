const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

//The helper function to generate a signed JWT
const signToken = (id) => {
    return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// Anti-tamper data filter to strip out malicious role-escalation
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

//AUTHENTICATION CONTROLLERS

//Register controller
exports.register = catchAsync(async (req, res, next) => {
    const { fullName, email, phone, password, role } = req.body;

    //prevents account from maliciously forcing an active verified state on signup
    const existinguser = await User.findOne({ email });
    if (existinguser) {
        return next(new AppError('Email already in use. Please use a different email.', 400));
    }
    const newUser = await User.create({
        fullName,
        email,
        phone,
        password,
        role,
        isVerified: false // forces everyone to undergo the KYC process later
    });

    //Removes password string from the output payload for clean security
    newUser.password = undefined;

    //Returns a standardized response structure
    res.status(201).json({
        status: 'success',
        message: 'Account created successfully. Please proceed to verify your account.',
        data: {
            user: newUser
        }
    });
});

// login controller
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    const user = await User.findOne({ email }).select('+password'); //explicitly select password field for authentication

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    const token = signToken(user._id);

    //Removes password string from the output payload for clean security
    user.password = undefined;

    res.status(200).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
});

//ROUTE ROUTING GATEKEEPER MIDDLEWARE

//Protection middleware (Authentication verification block)
exports.protect = catchAsync(async (req, res, next) => {
    let token;
    //checks if token exist in the authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            status: 'fail',
            message: 'You are not logged in! Please log in to get access.'
        });
    }
    //verify the token signature
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    //Check if user still exists
    const targetId = decoded.id || decoded._id;
    const currentUser = await User.findById(targetId);

    if (!currentUser) {
        return res.status(401).json({
            status: 'fail',
            message: 'The user belonging to this token does no longer exist.'
        });
    }

    //grant access to protected route
    req.user = currentUser;
    next();


});

//Middleware to restrict access based on user roles (Authorization verification block)
exports.restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('You are not logged in! Please log in to get access.', 401));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new AppError('Access Denied: You must upgrade your tier and upload your identity credentials to List properties.', 403)
            );
        }
        //User is authorized! Proceed to next middleware/controller
        next();
    };
};

//USER PROFILE AND SECURITY SETTINGS CONTROLLERS

//PATCH /api/v1/users/updateMe( update non-security profile parameters)
exports.updateMe = catchAsync(async (req, res, next) => { 
    //Throw an operational error if client attempts to pass credentials.
    if (req.body.password) {
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
    }

    //Filter out unwanted fields that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'fullName', 'email', 'phone');

    //Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
        new: true, //Returns freshly modified user document state.
        runValidators: true //Enforces schema validators on the update operation.
    });
    res.status(200).json({
        status: 'success',
        data: { user: updatedUser }
    });
});

//PATCH /api/v1/users/updateMyPassword (update password)
exports.updateMyPassword = catchAsync(async (req, res, next) => { 
    const { currentPassword, Password } = req.body;

    //Access targeted user and explicitly query hidden schema password field for authentication.
    const user = await User.findById(req.user._id).select('+password');

    //validate incoming DB string string hash matching metrics
    if (!(await user.correctPassword(currentPassword, user.password))) { 
        return next(new AppError('Your current password is incorrect.', 401));
    }

    //Re-assign clear text property to trigger pre-save middleware for password hashing
    user.password = Password;

    user.markModified('password'); //Explicitly marks the password field as modified to ensure pre-save middleware runs
    
    await user.save({ validateBeforeSave: false }); //skips validation for other fields since only password is being updated

    //Generate new JWT for the user after password update
    const token = signToken(user._id);

    //Removes db security strings from final response array.
    user.password = undefined;

    res.status(200).json({
        status: 'success',
        token,
        message: 'Password updated successfully.',
        data: { user }
    });
}); 