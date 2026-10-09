import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors.js';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      throw new UnauthorizedError('No token provided. Please login.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid token. Please login again');
    }
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token expired. Please login again');
    }
    throw error;
  }
};