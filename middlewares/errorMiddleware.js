module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500; //default to 500 if status code is not set
    err.status = err.status || 'error'; //default to 'error' if status is not set

    //Operational messaging client app
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};