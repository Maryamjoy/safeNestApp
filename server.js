const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/configdb');
const globalErrorHandler = require('./middlewares/errorMiddleware');
const AppError = require('./utils/AppError');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');


dotenv.config(); //loads environment variables from .env file

connectDB(); //connects to the database MongoDb Atlas/localhost

const app = express();

app.use(express.json()); //middleware to parse JSON request bodies(allows backend read incoming JSON data)

app.use('/api/v1/auth', authRoutes); //Mounts the auth routes
app.use('/api/v1/users', userRoutes); //Mounts the user routes
app.use('/api/v1/properties', propertyRoutes); //Mounts the property routes

app.use((req, res, next) => { 
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); //Fallback route for non-existennt API routes 
});


app.use(globalErrorHandler); //Global error handling middleware

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`=== Server running in ${process.env.NODE_ENV} on port ${PORT}===`);
});