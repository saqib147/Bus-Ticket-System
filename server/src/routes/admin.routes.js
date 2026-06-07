import { Router } from 'express';
import { body } from 'express-validator';
import { verifyToken } from '../middleware/auth.middleware.js';
import { isAdmin, isOperator, isAdminOrOperator, isPassenger } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  getAdminStats,
  getUsers,
  toggleUserStatus,
  getPendingOperators,
  approveOperator,
  rejectOperator,
  getAllBookings,
  updateBookingStatus,
  getRevenueReport,
  getBookingsReport,
  getOperatorStats,
  getOperatorRevenueReport,
  createReview,
  getBusReviews,
} from '../controllers/admin.controller.js';
import { getSchedulePassengers } from '../controllers/schedule.controller.js';

const router = Router();

// Admin routes
router.get('/stats', verifyToken, isAdmin, getAdminStats);
router.get('/users', verifyToken, isAdmin, getUsers);
router.patch('/users/:id/toggle-status', verifyToken, isAdmin, toggleUserStatus);
router.get('/operators/pending', verifyToken, isAdmin, getPendingOperators);
router.patch('/operators/:id/approve', verifyToken, isAdmin, approveOperator);
router.patch('/operators/:id/reject', verifyToken, isAdmin, rejectOperator);
router.get('/bookings', verifyToken, isAdmin, getAllBookings);
router.patch('/bookings/:id', verifyToken, isAdmin, updateBookingStatus);
router.get('/reports/revenue', verifyToken, isAdmin, getRevenueReport);
router.get('/reports/bookings', verifyToken, isAdmin, getBookingsReport);

export default router;

const operatorRouter = Router();
operatorRouter.get('/stats', verifyToken, isOperator, getOperatorStats);
operatorRouter.get('/schedules/:id/passengers', verifyToken, isOperator, getSchedulePassengers);
operatorRouter.get('/reports/revenue', verifyToken, isOperator, getOperatorRevenueReport);
operatorRouter.get('/bookings', verifyToken, isAdminOrOperator, getAllBookings);

const reviewRouter = Router();
reviewRouter.post(
  '/',
  verifyToken,
  isPassenger,
  [
    body('busId').notEmpty(),
    body('rating').isInt({ min: 1, max: 5 }),
    validate,
  ],
  createReview
);
reviewRouter.get('/bus/:busId', getBusReviews);

export { operatorRouter, reviewRouter };
