export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

export const handleMongooseError = (err) => {
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return new BadRequestError(messages.join('. '));
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return new ConflictError(`${field} already exists`);
  }
  if (err.name === 'CastError') {
    return new BadRequestError(`Invalid ${err.path}: ${err.value}`);
  }
  return err;
};

export const errorHandler = (err, req, res, next) => {
  err = handleMongooseError(err);
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  const message = err.isOperational ? err.message : 'Something went wrong';

  const logger = req.app.get('logger');
  if (logger) {
    const logLevel = err.isOperational ? 'warn' : 'error';
    logger[logLevel]({ err, path: req.path, method: req.method, statusCode }, message);
  }

  res.status(statusCode).json({
    status,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.path} not found`));
};