// This uses the 'require' syntax which matches bad-words version 3.0.4
const Filter = require('bad-words'); 
const filter = new Filter();

/**
 * TASK 3.1.3: NLP FLAGGING SERVICE
 * This service scans text for profanity and specific scam triggers 
 * common in the Nigerian rental market.
 */

// We add custom words that indicate a scammer is trying to move off-platform
const nigerianScamTriggers = [
    'whatsapp me', 
    'pay upfront', 
    'outside the app', 
    'viewing fee', 
    'form money', 
    'secure the house', 
    'send money to confirm',
    'pay to my account'
];

exports.scanMessage = (text) => {
    try {
        // 1. Check for standard bad language (Profanity)
        let isFlagged = filter.isProfane(text);
        let reason = isFlagged ? "Profanity/Inappropriate language detected" : "";

        // 2. Check for Scam Phrases
        const lowercaseText = text.toLowerCase();
        
        nigerianScamTriggers.forEach(phrase => {
            if (lowercaseText.includes(phrase)) {
                isFlagged = true;
                reason = `Potential Scam Detected: Mention of "${phrase}".`;
            }
        });

        // 3. Return the results to the Controller
        return {
            isFlagged,
            reason
        };
    } catch (error) {
        console.error("NLP Scan Error:", error);
        return { isFlagged: false, reason: "Scan failed" };
    }
};