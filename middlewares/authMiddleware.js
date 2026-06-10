const jwt = require('jsonwebtoken');
const appError = require('../utils/appError'); // Consistent lowercase
const catchAsync = require('../utils/catchAsync'); // Consistent lowercase

/**
 * THE SECURITY GUARD (Protects the Doors)
 * Attends to Task 3.1.1, 3.1.3: Ensures only verified users can chat/report.
 */
exports.protect = catchAsync(async (req, res, next) => {
    let token;

    // 1. Check if token exists in the Authorization Header (Bearer Token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // 2. If no token, throw a professional error (Task 4.3.2 Log Support)
    if (!token) {
        return next(new appError('You are not logged in! Please log in to get access.', 401));
    }

    // 3. Verify the token using the Secret Key in your .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Attach the User Info to the Request
    // This allows the messageController to know exactly WHO is sending a message.
    req.user = { 
        id: decoded.id, 
        role: decoded.role || 'user' 
    }; 
    
    next();
});

/**
 * THE SPECIAL ACCESS (Role Restriction)
 * Attends to Task 5.1.1: Limits KPI Dashboards to 'admin' users only.
 */
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // If the current user's role is not in the allowed list, block them
        if (!roles.includes(req.user.role)) {
            return next(new appError('You do not have permission to perform this action', 403));
        }
        next();
    };
};