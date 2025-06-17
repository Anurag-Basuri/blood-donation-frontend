import crypto from "crypto";

export const generateEmailVerificationToken = () => {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    return { token, tokenExpiry };
};
