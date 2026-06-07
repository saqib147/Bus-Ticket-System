import { Router } from 'express';
import { body } from 'express-validator';
import { verifyToken } from '../middleware/auth.middleware.js';
import { isPassenger } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  getSeatMap,
  lockSeatHandler,
  releaseSeatHandler,
} from '../controllers/seat.controller.js';

const router = Router();

router.get('/:scheduleId', getSeatMap);
router.post(
  '/lock',
  verifyToken,
  isPassenger,
  [body('scheduleId').notEmpty(), body('seatIds').isArray({ min: 1 }), validate],
  lockSeatHandler
);
router.post(
  '/release',
  verifyToken,
  isPassenger,
  [body('scheduleId').notEmpty(), body('seatIds').isArray({ min: 1 }), validate],
  releaseSeatHandler
);

export default router;
