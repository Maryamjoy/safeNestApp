const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');

//Protects Middleware, verifies the short-expiration token.
const protect = catchAsync(async (req, res, next) => { 
    let token;

    //Extracts JWT from the Authorization header.
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {  
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    //Verify the token cryptographically.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //checks if the user associated with the token still exists.
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) { 
        return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    //Grant access and save the user data to the request object for downstream use.
    req.user = currentUser; // Grant access to protected route
    next();
});

//Restricts to Middleware, enforces Role-Base Access controller
const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {

        //if the user's role isn't included in the allowed params, block them.
        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };

};

module.exports = { protect, restrictTo };