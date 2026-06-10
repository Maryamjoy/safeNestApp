const Notification = require('../models/Notification');
const emailService = require('./emailService');
const smsService = require('./smsService');

/**
 * THE NOTIFICATION ORCHESTRATOR (Attends to Tasks 3.2.1, 3.2.2, 3.2.3)
 * This is the central hub for all alerts on the platform.
 */
exports.triggerNotification = async (user, title, body, type = 'message') => {
    try {
        // 1. TASK 3.2.1: IN-APP NOTIFICATION (The "Bell" icon)
        // We save it to our MongoDB so the user sees it when they log in.
        const inAppAlert = await Notification.create({
            recipient: user._id,
            title: title,
            message: body,
            type: type
        });
        console.log(`[IN-APP] Notification saved for user ${user._id}`);

        // 2. TASK 3.2.3: EMAIL ALERT
        // We tell the Email Bird to fly
        await emailService.sendEmail({
            email: user.email,
            subject: title,
            message: body
        });

        // 3. TASK 3.2.2: SMS ALERT
        // We only send SMS for "Alert" or "Payment" types to save money, 
        // or if the user is offline.
        if (type === 'alert' || type === 'payment') {
            await smsService.sendSMS(user.phone, `${title}: ${body}`);
        }

        return inAppAlert;
    } catch (err) {
        console.error("Notification Orchestrator Error:", err.message);
    }
};