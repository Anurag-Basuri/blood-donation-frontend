const config = {
    port: process.env.PORT || 8000,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiry: process.env.JWT_EXPIRY,
    openaiKey: process.env.OPENAI_API_KEY,
    googleMapsKey: process.env.GOOGLE_MAPS_API_KEY,
    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER
    }
};

export default config;