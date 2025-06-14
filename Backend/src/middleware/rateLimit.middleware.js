import rateLimit from "express-rate-limit";

// Helper to get client's IP safely
const getClientIp = (req) =>
    req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "unknown";

// This function creates a rate limiter with options
export const rateLimiter = (options = {}) => {
    let limiterPromise = null;

    // Immediately start setting up limiter on first function call
    const setupRateLimiter = async () => {
        if (process.env.NODE_ENV === "production") {
            const { default: RedisStore } = await import("rate-limit-redis");
            const { createClient } = await import("redis");

            const redisClient = createClient({
                url: process.env.REDIS_URL || "redis://localhost:6379",
            });

            await redisClient.connect();

            return rateLimit({
                store: new RedisStore({
                    client: redisClient,
                    prefix: "rate-limit:",
                }),
                standardHeaders: true,
                legacyHeaders: false,
                keyGenerator: getClientIp,
                ...options,
            });
        } else {
            return rateLimit({
                standardHeaders: true,
                legacyHeaders: false,
                keyGenerator: getClientIp,
                ...options,
            });
        }
    };

    // Start initializing immediately
    limiterPromise = setupRateLimiter();

    // Return actual middleware function
    return async (req, res, next) => {
        try {
            const limiter = await limiterPromise;
            return limiter(req, res, next);
        } catch (err) {
            console.error("Rate limiter setup failed:", err);
            return next(); // fail open
        }
    };
};

// Dummy cache middleware (unchanged)
export const cacheMiddleware = (duration) => {
    return async (req, res, next) => {
        next();
    };
};
