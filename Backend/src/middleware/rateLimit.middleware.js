import rateLimit from "express-rate-limit";

// Helper to get client's IP safely
const getClientIp = (req) =>
    req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "unknown";

// Variable to hold the async-initialized limiter
let limiterPromise;

// This sets up the limiter only once
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

// ✅ Final Exported Middleware
export const rateLimiter = (req, res, next) => {
    if (!limiterPromise) {
        limiterPromise = setupRateLimiter();
    }

    limiterPromise
        .then((limiter) => limiter(req, res, next))
        .catch((err) => {
      console.error("Rate limiter setup failed:", err);
      next(); // Continue even if limiter fails
    });
};

// Dummy cache middleware (unchanged)
export const cacheMiddleware = (duration) => {
    return async (req, res, next) => {
        next();
    };
};
