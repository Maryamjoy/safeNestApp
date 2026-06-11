const twilio = require('twilio');

/**
 * THE SMS SHOUTER (Task 3.2.2)
 * This sends a text message to the user's mobile phone.
 */
exports.sendSMS = async (phoneNumber, messageBody) => {
    // We use Twilio (Industry Standard)
    const client = new twilio(
        process.env.TWILIO_ACCOUNT_SID, 
        process.env.TWILIO_AUTH_TOKEN
    );

    try {
        await client.messages.create({
            body: messageBody,
            to: phoneNumber, // The user's phone number
            from: process.env.TWILIO_PHONE_NUMBER // Your Twilio number
        });
        console.log("SMS Alert sent successfully.");
    } catch (err) {
        console.log("SMS failed to send:", err.message);
    }
};