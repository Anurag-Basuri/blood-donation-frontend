import rateLimit from 'express-rate-limit';

let rateLimiter = null; // Will hold the initialized limiter

const getClientIp = req =>
	req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';

export const initRateLimiter = async () => {
	if (process.env.NODE_ENV === 'production') {
		const { default: RedisStore } = await import('rate-limit-redis');
		const { createClient } = await import('redis');

		const redisClient = createClient({
			url: process.env.REDIS_URL || 'redis://localhost:6379',
		});

		await redisClient.connect();

		rateLimiter = rateLimit({
			windowMs: 15 * 60 * 1000, // 15 minutes
			max: 100, // limit each IP to 100 requests per windowMs
			standardHeaders: true,
			legacyHeaders: false,
			keyGenerator: getClientIp,
			store: new RedisStore({
				client: redisClient,
				prefix: 'rate-limit:',
			}),
		});
	} else {
		rateLimiter = rateLimit({
			windowMs: 15 * 60 * 1000,
			max: 100,
			standardHeaders: true,
			legacyHeaders: false,
			keyGenerator: getClientIp,
		});
	}
};

// Export the initialized limiter for usage
export { rateLimiter };

// Optional placeholder for cache middleware
export const cacheMiddleware = duration => {
	return async (req, res, next) => {
		next();
	};
};
