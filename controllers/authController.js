const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

//The helper function to generate a signed JWT
const signToken = (id) => {
    return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.register = catchAsync(async (req, res, next) => {
    const { fullName, email, phone, password, role } = req.body;

    //prevents accounnt from maliciously forcing an active verified state on sgnup
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

const { promisify } = require('util');

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
    req.user = currentUser; // Grant access to protected route
    next();

});
