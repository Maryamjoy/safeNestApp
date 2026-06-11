const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    // We categorize notifications so the UI can show different icons
    type: { 
        type: String, 
        enum: ['message', 'alert', 'verification', 'payment'], 
        default: 'message' 
    },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);