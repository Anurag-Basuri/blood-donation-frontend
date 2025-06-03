import nodemailer from 'nodemailer';
// Create nodemailer transporter 
const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD } });

/**

Sends an OTP verification email to the user

@param {string} email - The recipient's email address

@param {string} otp - The one-time password

@param {string} name - The recipient's name (optional)

@returns {Promise<boolean>} - Whether the email was sent successfully */
export const sendOTPEmail = async (email, otp, name = '') => {
  try {
	const mailOptions = {
	  from: process.env.EMAIL_USER,
	  to: email,
	  subject: 'Blood Donation - Email Verification',
	  html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
	<h2 style="color: #d32f2f; text-align: center;">Blood Donation Account Verification</h2>
	<p>Hello ${name || 'there'},</p>
	<p>Thank you for registering with our Blood Donation platform. To complete your registration, please use the following verification code:</p>
	<div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
	  ${otp}
	</div>
	<p style="margin-top: 20px;">This code will expire in 10 minutes.</p>
	<p>If you didn't request this verification, please ignore this email.</p>
	<div style="margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 15px; text-align: center; color: #757575; font-size: 12px;">
	  <p>This is an automated email, please do not reply.</p>
	</div>
  </div>`,
	};

	const info = await transporter.sendMail(mailOptions);
	console.log('Email sent successfully:', info.messageId);
	return true;
  } catch (error) {
    if (error.code === 'EAUTH') {
      console.error('Authentication error: Please check your EMAIL_USER and EMAIL_APP_PASSWORD environment variables.');
    } else {
      console.error('Error sending email:', error);
    }
    return false;
  }
};

/**
Generates a random 6-digit OTP
@returns {string} 6-digit OTP */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

