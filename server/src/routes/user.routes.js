import { Router } from 'express';
import { body } from 'express-validator';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
  getProfile,
  updateProfile,
  changePassword,
  getUserBookings,
} from '../controllers/user.controller.js';

const router = Router();

router.use(verifyToken);

router.get('/profile', getProfile);
router.patch('/profile', upload.single('avatar'), updateProfile);
router.patch(
  '/change-password',
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
    validate,
  ],
  changePassword
);
router.get('/bookings', getUserBookings);

export default router;
