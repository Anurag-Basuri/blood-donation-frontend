import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../utils/errors.js';

export const auth = (allowedRoles = []) => {
    return async (req, res, next) => {
        try {
            const token = req.cookies.accessToken || 
                          req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
              throw new AuthenticationError('Authentication required');
            }

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
              throw new AuthenticationError('Unauthorized access');
            }

            req.user = decoded;
            next();
          } catch (error) {
            if (error.name === 'JsonWebTokenError') {
              throw new AuthenticationError('Invalid token');
            }
            throw error;
        }
    };
};