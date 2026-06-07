import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { isPassenger } from '../middleware/role.middleware.js';
import {
  downloadTicket,
  getTicketByBooking,
  verifyTicket,
} from '../controllers/ticket.controller.js';

const router = Router();

router.get('/verify/:qrData', verifyTicket);
router.get('/:bookingId/pdf', verifyToken, isPassenger, downloadTicket);
router.get('/:bookingId', verifyToken, isPassenger, getTicketByBooking);

export default router;
