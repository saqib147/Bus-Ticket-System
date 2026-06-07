import { Router } from 'express';
import { verifyToken, optionalAuth } from '../middleware/auth.middleware.js';
import { isAdminOrOperator } from '../middleware/role.middleware.js';
import {
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
} from '../controllers/route.controller.js';

const router = Router();

router.get('/', optionalAuth, getRoutes);
router.post('/', verifyToken, isAdminOrOperator, createRoute);
router.patch('/:id', verifyToken, isAdminOrOperator, updateRoute);
router.delete('/:id', verifyToken, isAdminOrOperator, deleteRoute);

export default router;
