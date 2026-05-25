module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next); //catches any errors thrown in the async function and passes them to the next middleware (error handling middleware)
    };
};