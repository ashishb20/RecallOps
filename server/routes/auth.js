import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, getCurrentUser } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { registerValidation, loginValidation } from '../middleware/validation.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();
router.use(authLimiter);
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getCurrentUser);

export default router;