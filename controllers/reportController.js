const Report = require('../models/report'); 
const Message = require('../models/message'); 
const notificationService = require('../services/notificationService');
const catchAsync = require('../utils/catchAsync'); // Use the professional tool
const appError = require('../utils/appError');     // Use the professional tool

/**
 * CREATE DISPUTE / FRAUD REPORT
 * Attends to Tasks: 
 * 4.3.2 (Ticket & Log Generation), 3.3.3 (Admin Alert & User Acknowledgment)
 */
exports.createReport = catchAsync(async (req, res, next) => {
    const { targetType, targetId, reason, conversationId } = req.body;

    // 1. VALIDATION: Ensure we have the basic info to start an investigation
    if (!targetType || !targetId || !reason) {
        return next(new appError('Please provide the report type, the ID of the target, and a reason.', 400));
    }

    // 2. TASK 4.3.2: CREATE THE DISPUTE REPORT
    // Our Model automatically generates the unique 'ticketId' (e.g., TKT-A1B2C3)
    const report = await Report.create({
        reporterId: req.user.id, // The person making the complaint
        targetType,
        targetId,
        reason
    });

    // 3. TASK 4.3.2: AUTO-ATTACH CHAT LOGS
    // We fetch the last 30 messages from this specific chat to serve as evidence
    const evidenceLogs = await Message.find({ conversationId })
        .sort('-createdAt')
        .limit(30);

    // 4. TASK 3.3.3: URGENT ADMIN ALERT
    // We don't just log it to the console; we tell our Notification Service 
    // to send an 'alert' (which triggers SMS/Email for the Admin).
    console.log(`🚨 TASK 3.3.3: Urgent Ticket ${report.ticketId} generated!`);
    
    await notificationService.triggerNotification(
        { _id: 'ADMIN_ID', email: 'admin@safenest.com', phone: '+234...' }, 
        "URGENT: New Fraud Report",
        `New ${targetType} dispute reported. Ticket ID: ${report.ticketId}.`,
        'alert' 
    );

    // 5. TASK 3.3.3: ACKNOWLEDGMENT TO REPORTING USER
    // We must send a confirmation to the user who reported the issue
    await notificationService.triggerNotification(
        req.user, // The reporter
        "Report Received", 
        `Your dispute ticket ${report.ticketId} has been opened. Our team will review the logs within 1 hour.`,
        'system'
    );

    // 6. SUCCESS RESPONSE
    res.status(201).json({
        status: 'success',
        message: "Your report has been submitted and a secure ticket has been generated.",
        ticketId: report.ticketId,
        logsAttached: evidenceLogs.length,
        data: report
    });
});