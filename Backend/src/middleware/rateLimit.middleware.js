import rateLimit from "express-rate-limit";

// Helper to get client's IP safely
const getClientIp = (req) =>
    req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "unknown";

// Define a variable to hold the initialized limiter
let rateLimiterInstance;

// Async setup function
const setupRateLimiter = async () => {
    if (process.env.NODE_ENV === "production") {
        const { default: RedisStore } = await import("rate-limit-redis");
        const { createClient } = await import("redis");

        const redisClient = createClient({
            url: process.env.REDIS_URL || "redis://localhost:6379",
        });

        await redisClient.connect().catch(console.error);

        return rateLimit({
            store: new RedisStore({
                client: redisClient,
                prefix: "rate-limit:",
            }),
            windowMs: 15 * 60 * 1000,
            max: 100,
            standardHeaders: true,
            legacyHeaders: false,
            keyGenerator: getClientIp,
        });
    } else {
        return rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: getClientIp,
        });
    }
};

// This is the actual exported middleware function
export const rateLimitter = async (req, res, next) => {
    if (!rateLimiterInstance) {
        rateLimiterInstance = await setupRateLimiter();
    }
    return rateLimiterInstance(req, res, next);
};

// Dummy cache middleware (no Redis logic here)
export const cacheMiddleware = (duration) => {
    return async (req, res, next) => {
        next();
    };
};
