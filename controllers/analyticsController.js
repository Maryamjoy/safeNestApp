const Message = require('../models/message'); // Lowercase consistency
const Report = require('../models/report');   // Added for Dispute KPIs
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');

/**
 * GET PLATFORM SAFETY KPIs
 * Attends to Task: 5.1.1 (Fraud Rate & Anomaly Detection)
 */
exports.getPlatformSafetyKPIs = catchAsync(async (req, res, next) => {
    
    // 1. CALCULATE MESSAGE FRAUD RATE (Task 5.1.1)
    const totalMessages = await Message.countDocuments();
    const flaggedMessages = await Message.countDocuments({ isFlagged: true });
    
    // The Math: (Flagged / Total) * 100
    const currentFraudRate = totalMessages > 0 ? (flaggedMessages / totalMessages) * 100 : 0;

    // 2. DISPUTE RESOLUTION KPIs (Task 4.3.2 logs)
    const totalDisputes = await Report.countDocuments();
    const resolvedDisputes = await Report.countDocuments({ status: 'Resolved' });
    const resolutionRate = totalDisputes > 0 ? (resolvedDisputes / totalDisputes) * 100 : 0;

    // 3. STORY 5.1: ANOMALY DETECTION LOGIC
    // If the fraud rate goes above 5%, the system triggers an 'Anomaly Alert'
    let anomalyAlert = false;
    let safetyLevel = "Safe";

    if (currentFraudRate > 5) {
        anomalyAlert = true;
        safetyLevel = "High Alert: Fraud Spike Detected";
    } else if (currentFraudRate > 2) {
        safetyLevel = "Caution: Moderate Activity";
    }

    // 4. ADMIN DASHBOARD PAYLOAD
    res.status(200).json({
        status: 'success',
        generatedAt: new Date(),
        data: {
            messagingStats: {
                totalScanned: totalMessages,
                totalBlocked: flaggedMessages,
                fraudRate: `${currentFraudRate.toFixed(2)}%`
            },
            disputeStats: {
                totalTickets: totalDisputes,
                resolved: resolvedDisputes,
                resolutionRate: `${resolutionRate.toFixed(2)}%`
            },
            systemHealth: {
                safetyLevel: safetyLevel,
                isAnomalyDetected: anomalyAlert, // Task 5.1.1 Logic
                platformTrustScore: (100 - currentFraudRate).toFixed(1) + "/100"
            }
        }
    });
});