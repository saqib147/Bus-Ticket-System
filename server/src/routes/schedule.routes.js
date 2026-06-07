import { Router } from 'express';
import { verifyToken, optionalAuth } from '../middleware/auth.middleware.js';
import { isOperator } from '../middleware/role.middleware.js';
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
router.post('/', verifyToken, isOperator, createSchedule);
router.patch('/:id', verifyToken, isOperator, updateSchedule);
router.delete('/:id', verifyToken, isOperator, deleteSchedule);

export default router;
