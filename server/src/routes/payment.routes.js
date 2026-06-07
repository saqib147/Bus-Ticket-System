import { Router } from 'express';
import { body } from 'express-validator';
import { verifyToken } from '../middleware/auth.middleware.js';
import { isPassenger } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createCheckoutSession,
  stripeWebhook,
  getPaymentByBooking,
} from '../controllers/payment.controller.js';

const router = Router();

router.post('/webhook', stripeWebhook);

router.post(
  '/create-session',
  verifyToken,
  isPassenger,
  [body('bookingId').notEmpty(), validate],
  createCheckoutSession
);
router.get('/:bookingId', verifyToken, isPassenger, getPaymentByBooking);

export default router;
