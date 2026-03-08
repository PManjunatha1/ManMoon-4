const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gamesmanplay12@gmail.com',
    pass: 'your_app_password_here'
  }
});

exports.sendPasswordResetEmail = functions.https.onCall(async (data, context) => {
  const { email, resetLink } = data;

  const mailOptions = {
    from: 'ManMoon <gamesmanplay12@gmail.com>',
    to: email,
    subject: '🔐 ManMoon - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #14532D; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">🌙 ManMoon</h1>
          <p style="margin: 5px 0 0 0;">Password Reset Request</p>
        </div>
        <div style="background: #F0FDF4; padding: 30px; border-radius: 0 0 8px 8px;">
          <p>Hello,</p>
          <p>We received a request to reset your ManMoon password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #14532D; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy this link: ${resetLink}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            <strong>Security Note:</strong> If you didn't request this, please ignore this email. Your account is safe.
          </p>
          <p style="color: #666; font-size: 12px;">
            This link expires in 1 hour.
          </p>
        </div>
        <div style="background: #FFFFFF; padding: 20px; text-align: center; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
          <p>© 2026 ManMoon - Legitimate Learning Platform</p>
          <p>
            <a href="https://manmoon.com/privacy" style="color: #14532D; text-decoration: none;">Privacy Policy</a> | 
            <a href="https://manmoon.com/terms" style="color: #14532D; text-decoration: none;">Terms of Service</a>
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send email');
  }
});
