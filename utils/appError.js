/**
 * TASK 4.3.2: TICKET & LOG GENERATION SUPPORT
 * This class helps us create professional error messages that 
 * can be logged and turned into dispute tickets.
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Marks this as a known error, not a system crash

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;