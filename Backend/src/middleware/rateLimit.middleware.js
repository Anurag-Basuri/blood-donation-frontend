import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../config/redis.js';

export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});

// Cache middleware
export const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
      const key = `cache:${req.originalUrl}`;

      try {
          const cachedResponse = await redis.get(key);
          if (cachedResponse) {
              return res.json(JSON.parse(cachedResponse));
          }

          res.sendResponse = res.json;
          res.json = (body) => {
              redis.setex(key, duration, JSON.stringify(body));
              res.sendResponse(body);
          };

          next();
      } catch (error) {
          next(error);
      }
  };
};