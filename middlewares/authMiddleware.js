const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Ensure your model name is lowercase 'user.js'
const appError = require('../utils/apperror'); // Standardized lowercase
const catchAsync = require('../utils/catchasync'); // Standardized lowercase

/**
 * 1. THE PROTECT GUARD
 * Ensures the user is logged in and their account is still active.
 * Attends to Tasks: 1.1.1, 1.2.1, 3.1.1
 */
exports.protect = catchAsync(async (req, res, next) => {
    let token;

    // A. Check if token exists in the "Authorization" header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // B. If no token is found, block access
    if (!token) {
        return next(new appError('You are not logged in! Please log in to get access.', 401));
    }

    // C. Verify the token (Check if the "ID card" is fake or expired)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // D. DATABASE CHECK: Does the user still exist in our system?
    // This stops deleted users/scammers from using old tokens.
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new appError('The user belonging to this token no longer exists.', 401));
    }

    // E. GRANT ACCESS
    // We save the FULL user document to 'req.user'
    // Now any controller can see req.user.fullName, req.user.role, etc.
    req.user = currentUser; 
    next();
});

/**
 * 2. THE ROLE RESTRICTOR
 * Ensures only specific people (like Admins) can enter special doors.
 * Attends to Tasks: 1.4.1 (Admin Badges), 5.1.1 (KPI Dashboard)
 */
exports.restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        // req.user was set by the 'protect' function above
        if (!allowedRoles.includes(req.user.role)) {
            return next(new appError('Access Denied: You do not have permission for this action.', 403));
        }
        next();
    };
};