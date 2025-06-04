import twilio from 'twilio';

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

export const sendSMS = async ({ to, body }) => {
    try {
        if (!to || !body) throw new Error('Missing "to" or "body" in SMS payload');

        const message = await client.messages.create({
            body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
        });

        console.log(`✅ SMS sent to ${to}: ${message.sid}`);
        return message;
    } catch (error) {
    console.error(`❌ Failed to send SMS to ${to}:`, error.message);
    throw new Error('SMS sending failed');
    }
};