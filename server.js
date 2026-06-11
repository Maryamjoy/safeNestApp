const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/configdb.js');
const AppError = require('./utils/AppError');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');


dotenv.config(); //loads environment variables from .env file

connectDB(); //connects to the database MongoDb Atlas/localhost

const app = express();

//Global request Middleware, Parses incoming JSON payloads.
app.use(express.json()); //middleware to parse JSON request bodies(allows backend read incoming JSON data)


app.use('/api/v1/auth', authRoutes); //Mounts the auth routes
app.use('/api/v1/users', userRoutes); //Mounts the user routes
app.use('/api/v1/properties', propertyRoutes); //Mounts the property routes

app.use((req, res, next) => { 
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); //Fallback route for non-existent API routes 
});


app.use(errorMiddleware); //Global error handling middleware

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`=== Server running in ${process.env.NODE_ENV} on port ${PORT}===`);
});

// Global Safeguard, catches unhandled asynchronous promise rejections.
process.on('unhandledRejection', (err) => { 
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    server.close(() => { 
        process.exit(1); //exit with failure code
    });
});

