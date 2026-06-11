const nodemailer = require('nodemailer');

/**
 * THE EMAIL BIRD (Task 3.2.3)
 * This sends professional emails to users.
 */
exports.sendEmail = async (options) => {
    // 1. Setup the connection to the Email Server
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // 2. Define what the email looks like
    const mailOptions = {
        from: 'SafeNest Support <support@safenest.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    // 3. Send the bird!
    await transporter.sendMail(mailOptions);
};