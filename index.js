const express = require('express');
const http = require('http'); // Required to wrap Express for WebSockets
const { Server } = require('socket.io'); // Attends to Task 3.1.1
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// --- 1. IMPORT THE ROUTE MODULES (The "Hallways") ---
// These links connect the URL to the Brains (Controllers) we built
const messageRoutes = require('./routes/messageRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// --- 2. LOAD ENVIRONMENT VARIABLES ---
dotenv.config();

const app = express();

// --- 3. GLOBAL MIDDLEWARE ---
// This allows the server to parse and understand JSON data sent from users
app.use(express.json());

// --- 4. CREATE THE HTTP SERVER ---
// We wrap the Express app because Socket.io needs a standard HTTP server to run
const server = http.createServer(app);

// --- 5. INITIALIZE WEBSOCKETS (Attends to Task 3.1.1) ---
// This is the "Live Connection" that makes chat work like WhatsApp
const io = new Server(server, {
    cors: {
        origin: "*", // Allows any frontend (Web or Mobile) to connect
        methods: ["GET", "POST"]
    }
});

// --- 6. DATABASE CONNECTION LOGIC ---
const DB = process.env.DATABASE_URL;

mongoose.connect(DB)
    .then(() => {
        console.log("=========================================");
        console.log("🚀 MESSAGING SERVICE: Database Connected!");
        console.log("Cloud Warehouse: MessagingDB is Online.");
        console.log("=========================================");
    })
    .catch(err => {
        console.log("❌ DB CONNECTION ERROR:", err.message);
    });

// --- 7. REAL-TIME COMMUNICATION ENGINE (Task 3.1.1 Logic) ---
io.on('connection', (socket) => {
    console.log(`User Connected to WebSocket: ${socket.id}`);

    // Logic: User joins a specific "Chat Room" (Task 3.1.1)
    socket.on('join_room', (data) => {
        socket.join(data.room);
        console.log(`User ${socket.id} joined Chat Room: ${data.room}`);
    });

    // Logic: Instant Message Delivery
    socket.on('send_message', (data) => {
        // This broadcasts the message to the other person instantly
        socket.to(data.room).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected from Chat Service');
    });
});

// --- 8. MOUNT THE ROUTES (The "Access Points") ---
// This is where we plug in the logic we discussed in Phase 5.
// We use versioning (/v1) to follow industry best practices.

// Attends to Tasks: 3.1.1, 3.1.3, 3.2.1-3, 3.3.3, 4.3.2
app.use('/api/v1/messages', messageRoutes); 

// Attends to Task: 5.1.1 (Fraud & Anomaly Dashboard)
app.use('/api/v1/analytics', analyticsRoutes); 

// --- 9. THE HEARTBEAT (Health Check) ---
// Used to verify that the microservice is alive and running
app.get('/health', (req, res) => {
    res.status(200).send("Trust & Messaging Service is Healthy! 🚀");
});

// --- 10. GLOBAL ERROR HANDLING ---
// This prevents the server from crashing if a controller has a bug
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});

// --- 11. START THE POWER ENGINE ---
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`Trust & Messaging Service is live on Port ${PORT}`);
    console.log(`COMPLIANCE STATUS: Monitoring Tasks 3.1.1 thru 6.1`);
});