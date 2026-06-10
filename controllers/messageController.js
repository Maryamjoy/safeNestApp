const Message = require('../models/message');
const Conversation = require('../models/conversation');
const nlp = require('../services/nlpService');
const notificationService = require('../services/notificationService');
const catchAsync = require('../utils/catchAsync'); // Uses our new tool
const appError = require('../utils/appError');     // Uses our new tool

/**
 * SEND MESSAGE & SECURITY SCAN
 * Attends to Tasks: 
 * 3.1.3 (NLP Scan), 3.2.1-3 (Multi-channel Alerts), 3.3.3 (Admin Urgent Alert)
 */
exports.sendMessage = catchAsync(async (req, res, next) => {
    const { conversationId, text, recipientId } = req.body;

    // 1. VALIDATION: Ensure all data is present
    if (!conversationId || !text || !recipientId) {
        return next(new appError('Please provide a conversation ID, recipient, and message text.', 400));
    }

    // 2. TASK 3.1.3: THE SECURITY SCAN (NLP)
    // We run the text through the guard before it ever reaches the other user
    const scan = nlp.scanMessage(text);

    // 3. SAVE THE MESSAGE TO DATABASE
    // We attach the 'isFlagged' and 'flagReason' results from the NLP scan
    const newMessage = await Message.create({
        conversationId,
        senderId: req.user.id, // Current logged-in user
        text,
        isFlagged: scan.isFlagged,
        flagReason: scan.reason
    });

    // 4. TASK 3.3.3: URGENT ADMIN ALERT (The Siren)
    // If the NLP robot finds a scam, we trigger an immediate alert for the Admin
    if (scan.isFlagged) {
        console.log(`🚨 TASK 3.3.3 ALERT: Urgent report generated for scam detection in Message ${newMessage._id}`);
        
        // We simulate a real-time notification to the Admin Dashboard
        await notificationService.triggerNotification(
            { _id: 'ADMIN_ID', email: 'admin@safenest.com' }, // Admin details
            "URGENT: Potential Scam Detected",
            `Conversation ${conversationId} has been flagged for: ${scan.reason}`,
            'alert' // High priority type
        );
    }

    // 5. UPDATE THE CONVERSATION METADATA
    // This updates the 'Chat List' view for the user
    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: text
    });

    // 6. TASKS 3.2.1, 3.2.2, 3.2.3: NOTIFY THE RECIPIENT
    // We assume we fetch recipient details here. 
    // This triggers Push, Email, and SMS via the Orchestrator
    const recipientUser = { _id: recipientId, email: req.body.recipientEmail, phone: req.body.recipientPhone };
    
    await notificationService.triggerNotification(
        recipientUser, 
        "New Secure Message on SafeNest", 
        scan.isFlagged ? "Message under review for safety." : text, 
        'message'
    );

    // 7. SUCCESS RESPONSE
    res.status(201).json({
        status: 'success',
        message: scan.isFlagged ? "Message sent (Flagged for Review)" : "Message sent successfully",
        data: newMessage
    });
});