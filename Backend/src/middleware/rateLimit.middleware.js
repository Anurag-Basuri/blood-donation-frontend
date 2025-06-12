import rateLimit from 'express-rate-limit';

// Only import Redis-related modules if using Redis in production
let rateLimiter;

if (process.env.NODE_ENV === 'production') {
    import('rate-limit-redis').then(({ default: RedisStore }) => {
        import('redis').then(({ createClient }) => {
            const redis = createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379'
            });
            redis.connect().catch(console.error);

            rateLimiter = rateLimit({
                store: new RedisStore({
                    client: redis,
                    prefix: 'rate-limit:'
                }),
                windowMs: 15 * 60 * 1000, // 15 minutes
                max: 100 // Limit each IP to 100 requests per windowMs
            });
        });
    });
} else {
    // Use default memory store for development
    rateLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // Limit each IP to 100 requests per windowMs
    });
}

export { rateLimiter };

// Dummy cache middleware for development (no Redis)
export const cacheMiddleware = (duration) => {
    return async (req, res, next) => {
        next();
    };
};