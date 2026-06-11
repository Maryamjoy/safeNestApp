const express = require('express');
const http = require('http'); // 1. Needed to wrap Express for WebSockets
const { Server } = require('socket.io'); // 2. The Real-time Intercom
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// --- 3. IMPORT ALL MODULE DOORS (Routes) ---
const propertyRoutes = require('./routes/propertyRoutes');
const messageRoutes = require('./routes/messageRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// --- 4. INITIALIZE CORE ENGINES ---
dotenv.config();
const app = express();

// Global Middleware: Allows the robot to understand JSON "orders"
app.use(express.json());

// Create the Unified HTTP Server
// In professional apps, we wrap Express so WebSockets and Web Links share the same port
const server = http.createServer(app);

// Initialize Socket.io (Task 3.1.1)
const io = new Server(server, {
    cors: {
        origin: "*", // Allows Web and Mobile teams to connect
        methods: ["GET", "POST"]
    }
});

// --- 5. THE CLOUD VAULT CONNECTION (Database) ---
const DB_URL = process.env.DATABASE_URL;

mongoose.connect(DB_URL)
    .then(() => {
        console.log("=========================================");
        console.log("🚀 SAFENEST BACKEND: Fully Integrated!");
        console.log("Status: Property & Messaging DB Connected.");
        console.log("=========================================");
    })
    .catch((err) => {
        console.log("❌ CONNECTION FAILURE: Check your .env file!");
        console.log("Error details:", err.message);
    });

// --- 6. THE INTERCOM LOGIC (Task 3.1.1 - Real-time Chat) ---
io.on('connection', (socket) => {
    console.log(`Connection established with ID: ${socket.id}`);

    // Join a specific Chat Room
    socket.on('join_room', (data) => {
        socket.join(data.room);
        console.log(`User ${socket.id} entered Room: ${data.room}`);
    });

    // Instant Message Delivery
    socket.on('send_message', (data) => {
        // Broadcasts the message to the specific room instantly
        socket.to(data.room).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected from the Chat Service');
    });
});

// --- 7. MOUNT THE DOORS (Routing Infrastructure) ---

// A. Property Marketplace Routes (Standard Port 5000 logic)
// Tasks: 2.1.2, 2.1.4, 2.5.3 (Search, Upload, Verify)
app.use('/api/properties', propertyRoutes);

// B. Messaging & Trust Service Routes (Versioned v1 logic)
// Tasks: 3.1.3 (NLP), 3.3.3 (Admin Alerts), 4.3.2 (Tickets)
app.use('/api/v1/messages', messageRoutes);

// C. Admin Analytics Routes
// Task: 5.1.1 (Fraud Rate & KPI Dashboard)
app.use('/api/v1/analytics', analyticsRoutes);

// --- 8. SYSTEM HEALTH & SECURITY ---

// Heartbeat: To check if the robot is breathing
app.get('/health', (req, res) => {
    res.status(200).json({
        status: "success",
        message: "SafeNest Integrated System is Online! 🚀",
        modules: ["Property_v1", "Messaging_v1", "Trust_v1"]
    });
});

// Global Error Handler: Prevents the robot from exploding if it hits a wall
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});

// --- 9. START THE POWER ENGINE ---
// We use Port 5000 as the primary door for the group project
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`SafeNest Integrated Server running on Port ${PORT}`);
    console.log(`Monitoring Gaps: 3.1.1 thru 6.1 fully operational.`);
});