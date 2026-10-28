import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (err, req, res, next) => {
  console.error('[BACKEND ERROR STACK]:', err);
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Handle Zod Validation Errors (safe mapping via issues or errors)
  if (err instanceof ZodError || err.name === 'ZodError') {
    const issueList = err.issues || err.errors || [];
    const formattedErrors = issueList.map((e) => ({
      field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
      message: e.message,
    }));
    error = new ApiError('Validation Error', 400, formattedErrors);
  }

  // Handle Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    error = new ApiError(`Resource not found with identifier of ${err.value}`, 404);
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    error = new ApiError(`Duplicate field value entered for '${field}'. Must be unique.`, 409);
  }

  const statusCode = error.statusCode || 500;
  const status = error.status || (statusCode < 500 ? 'fail' : 'error');
  const errors = error.errors || [];

  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      status,
      message: error.message,
      errors,
      stack: err.stack,
    });
  } else {
    // Production Mode: Do not leak internal stack traces
    if (error.isOperational) {
      res.status(statusCode).json({
        status,
        message: error.message,
        errors,
      });
    } else {
      console.error('[CRITICAL UNHANDLED ERROR]:', err);
      res.status(500).json({
        status: 'error',
        message: 'Internal server failure. Engineering team notified.',
      });
    }
  }
};