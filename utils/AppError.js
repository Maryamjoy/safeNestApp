class AppError extends Error {
    constructor(message, statusCode) { 
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; //indicates that this is an operational error (not a programming error)

        Error.captureStackTrace(this, this.constructor); //captures the stack trace and excludes the constructor from it
    }
}

module.exports = AppError;