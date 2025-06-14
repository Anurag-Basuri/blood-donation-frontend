import rateLimit from "express-rate-limit";

let RedisStore = null;
let redisClient = null;

/**
 * 🧠 Get client IP safely from various sources
 */
const getClientIp = (req) =>
    req.ip ||
    req.headers["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    "unknown";

/**
 * ✅ Call this ONCE during app startup to initialize Redis
 */
export const initRateLimiter = async () => {
    if (process.env.NODE_ENV === "production") {
        try {
        const redis = await import("redis");
        const redisStore = await import("rate-limit-redis");

        redisClient = redis.createClient({
            url: process.env.REDIS_URL || "redis://localhost:6379",
        });

        await redisClient.connect();
        RedisStore = redisStore.default;

        console.log("✅ Redis connected for rate limiting");
        } catch (err) {
        console.error("❌ Redis setup failed:", err);
        }
    }
};

/**
 * ✅ Create rate limiter middleware
 */
export const rateLimiter = (options = {}) => {
    const baseOptions = {
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: getClientIp,
        ...options,
    };

    if (RedisStore && redisClient) {
        return rateLimit({
        ...baseOptions,
        store: new RedisStore({
            client: redisClient,
            prefix: "rate-limit:",
        }),
        });
    }

  return rateLimit(baseOptions); // fallback to memory in dev
};
