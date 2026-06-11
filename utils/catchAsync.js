/**
 * This helper function prevents our server from crashing 
 * if an async function (like database saving) fails.
 */
module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};