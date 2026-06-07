import { errorResponse } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return errorResponse(res, messages.join(', '), 400);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(res, `${field} already exists`, 409);
  }

  if (err.name === 'CastError') {
    return errorResponse(res, 'Invalid ID format', 400);
  }

  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', 401);
  }

  return errorResponse(res, err.message || 'Internal server error', err.statusCode || 500);
};

export const notFound = (req, res) => {
  errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};
