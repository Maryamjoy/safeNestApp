const mongoose = require ('mongoose');

const connectDB = async () => { 
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
    } catch (error) {
        console.error(`Database Connection Failure: ${error.message}`);
        process.exit(1); //crashes the server if DB connection is unreachable
    }
};

module.exports = connectDB;