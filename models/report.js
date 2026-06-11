const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Task 4.3.2 requirement

const ReportSchema = new mongoose.Schema({
    reporterId: { type: mongoose.Schema.Types.ObjectId, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // The scammer or fake house
    reason: { type: String, required: true },
    
    // --- TASK 4.3.2: AUTOMATED TICKET GENERATION ---
    // This creates a unique ID like "TKT-A7B8C9" automatically
    ticketId: { 
        type: String, 
        unique: true, 
        default: () => `TKT-${uuidv4().substring(0, 8).toUpperCase()}` 
    },

    // --- TASK 3.3.3: ADMIN PRIORITY ---
    status: { 
        type: String, 
        enum: ['Open', 'Investigating', 'Resolved'], 
        default: 'Open' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);