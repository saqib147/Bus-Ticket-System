import { errorResponse } from '../utils/apiResponse.js';

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return errorResponse(res, 'Admin access required', 403);
  }
  next();
};

export const isOperator = (req, res, next) => {
  if (req.user?.role !== 'operator') {
    return errorResponse(res, 'Operator access required', 403);
  }
  if (req.user.operatorStatus !== 'approved') {
    return errorResponse(res, 'Operator account not approved', 403);
  }
  next();
};

export const isPassenger = (req, res, next) => {
  if (req.user?.role !== 'passenger') {
    return errorResponse(res, 'Passenger access required', 403);
  }
  next();
};

export const isAdminOrOperator = (req, res, next) => {
  if (!['admin', 'operator'].includes(req.user?.role)) {
    return errorResponse(res, 'Access denied', 403);
  }
  if (req.user.role === 'operator' && req.user.operatorStatus !== 'approved') {
    return errorResponse(res, 'Operator account not approved', 403);
  }
  next();
};
