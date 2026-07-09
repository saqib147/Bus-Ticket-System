import { Router } from 'express';
import { verifyToken, optionalAuth } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/role.middleware.js';
import {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from '../controllers/schedule.controller.js';

const router = Router();

router.get('/', optionalAuth, getSchedules);
router.get('/:id', getScheduleById);
router.post('/', verifyToken, isAdmin, createSchedule);
router.patch('/:id', verifyToken, isAdmin, updateSchedule);
router.delete('/:id', verifyToken, isAdmin, deleteSchedule);

export default router;
