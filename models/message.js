const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversationId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Conversation', 
        required: true 
    },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    text: { type: String, required: true },

    // --- TASK 3.1.3: NLP SECURITY ---
    // If the Robot finds a scam, it turns 'isFlagged' to true
    isFlagged: { type: Boolean, default: false }, 
    flagReason: { type: String }, // e.g., "Attempt to move payment off-platform"
    
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);