const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    // The two people in the chat (Renter and Landlord)
    participants: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    }],
    // Task 3.1.1: Context - Which house are they talking about?
    propertyId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    lastMessage: { type: String },
    unreadCount: { type: Number, default: 0 }
}, { 
    timestamps: true // Automatically adds 'createdAt' and 'updatedAt'
});

module.exports = mongoose.model('Conversation', ConversationSchema);