//Helper function for Development, keeps the detailed debugging-data.
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

//Helper function for production, masks senstive backend stack traces.
const sendErrorProd = (err, res) => {
    //Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }


    else {
        //programming, data or unknown system error: do not leak structural data.
        console.error('ERROR 💥', err); //log the error for internal debugging

        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!' //generic message for unknown errors
        });
    };

};

//Global error handling middleware.
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500; //default to 500 if status code is not set
    err.status = err.status || 'error'; //default to 'error' if status is not set
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = Object.assign(err); //create a shallow copy of the error object to avoid mutating the original error
        error.message = err.message; //ensure the message property is copied over to the new error object


        sendErrorProd(error, res);
    }

};