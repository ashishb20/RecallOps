import { body, param, query, validationResult } from 'express-validator';
import { BadRequestError } from '../utils/errors.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg).join('. ');
    throw new BadRequestError(messages);
  }
  next();
};

export const registerValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate,
];

export const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ max: 200 }).withMessage('Title must be at most 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must be at most 2000 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Category must be at most 50 characters'),
  validate,
];

export const updateTaskValidation = [
  param('id').isMongoId().withMessage('Invalid task ID'),
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 200 }).withMessage('Title must be at most 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must be at most 2000 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Category must be at most 50 characters'),
  validate,
];

export const taskIdValidation = [
  param('id').isMongoId().withMessage('Invalid task ID'),
  validate,
];

export const getTasksQueryValidation = [
  query('completed')
    .optional()
    .isIn(['true', 'false']).withMessage('completed must be true or false'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  validate,
];