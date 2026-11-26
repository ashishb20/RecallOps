import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { BadRequestError, ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors.js';
import { sendNotificationEvent } from '../utils/notificationClient.js';

export const isProductionEnvironment = () => {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.RENDER === 'true' ||
    Boolean(process.env.CLIENT_URL && process.env.CLIENT_URL.startsWith('https://'))
  );
};

export const getCookieOptions = () => {
  const isProduction = isProductionEnvironment();
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

export const getClearCookieOptions = () => {
  const { maxAge, ...clearOptions } = getCookieOptions();
  return clearOptions;
};

export const signToken = (userId) => {
  if (!userId) {
    throw new Error('User ID is required to generate token');
  }
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const setTokenCookie = (res, token) => {
  if (!token) {
    throw new Error('Cannot set empty token cookie');
  }
  res.cookie('token', token, getCookieOptions());
};

export const clearTokenCookie = (res) => {
  res.clearCookie('token', getClearCookieOptions());
};

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      throw new ConflictError('Email already registered. Please login or use different email');
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new ConflictError('Username already taken. Please choose a different username');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    const token = signToken(user._id);
    setTokenCookie(res, token);

    // Trigger welcome notification (non-blocking)
    sendNotificationEvent({
      eventType: 'USER_WELCOME',
      entityId: user._id.toString(),
      userId: user._id.toString(),
      userEmail: user.email,
      payload: {
        name: user.username,
        email: user.email,
        loginUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`,
      },
    }, req.app?.get('logger'));

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = signToken(user._id);
    setTokenCookie(res, token);

    res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      throw new NotFoundError('User not found');
    }
    res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};