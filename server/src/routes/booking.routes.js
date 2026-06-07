import { Router } from 'express';
import { body } from 'express-validator';
import { verifyToken } from '../middleware/auth.middleware.js';
import { isPassenger } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/booking.controller.js';

const router = Router();

router.use(verifyToken, isPassenger);

router.post(
  '/',
  [
    body('scheduleId').notEmpty(),
    body('seats').isArray({ min: 1 }),
    validate,
  ],
  createBooking
);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/:id/cancel', cancelBooking);

export default router;
