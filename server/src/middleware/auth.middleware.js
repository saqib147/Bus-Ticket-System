import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const verifyToken = catchAsync(async (req, res, next) => {
  let token =
    req.cookies?.accessToken ||
    (req.headers.authorization?.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (!token) {
    return errorResponse(res, 'Authentication required', 401);
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!user || !user.isActive) {
      return errorResponse(res, 'User not found or inactive', 401);
    }

    req.user = user;
    next();
  } catch {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
});

export const optionalAuth = catchAsync(async (req, res, next) => {
  let token =
    req.cookies?.accessToken ||
    (req.headers.authorization?.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('-password -refreshToken');
      if (user && user.isActive) req.user = user;
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
});
