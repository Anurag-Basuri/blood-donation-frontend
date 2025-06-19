import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

export const sendMail = async ({ to, subject = 'No Subject', html = '' }) => {
	try {
		const mailOptions = {
			from: `"BloodConnect 🩸" <${process.env.EMAIL_USER}>`,
			to,
			subject,
			html,
		};

		const info = await transporter.sendMail(mailOptions);
		console.log(`✅ Email sent to ${to}: ${info.messageId}`);
		return info;
	} catch (error) {
		console.error(`❌ Failed to send email to ${to}:`, error);
		throw new Error('Email sending failed');
	}
};
