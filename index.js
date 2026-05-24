const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Import your property routes (The "Doors" we built in Phase 2)
const propertyRoutes = require('./routes/propertyRoutes');

// 1. LOAD THE SECRET VAULT
// This line tells the app: "Go look inside the .env file for the keys."
dotenv.config();

const app = express();

// 2. THE TRANSLATOR (Middleware)
// This allows the server to understand the data people send from Postman.
app.use(express.json());

// 3. THE CONNECTION ENGINE (The Bridge to the Cloud)
// We get the URL from your .env file
const DB_URL = process.env.DATABASE_URL;

mongoose.connect(DB_URL)
    .then(() => {
        // This only shows up if everything is PERFECT
        console.log("=========================================");
        console.log("🚀 SUCCESS: Mena_Chris, your Database is Connected!");
        console.log("Your cloud warehouse is now open for business.");
        console.log("=========================================");
    })
    .catch((err) => {
        // This shows up if there is a mistake (like a wrong password)
        console.log("❌ CONNECTION ERROR: Hey Chris, something went wrong!");
        console.log("Error details:", err.message);
    });

// 4. THE ROUTES (The Entry Doors)
// This tells the app: "Any link that starts with /api/properties should use your routes."
app.use('/api/properties', propertyRoutes);

// 5. START THE SERVER (The Power Button)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is breathing and active on port ${PORT}`);
});