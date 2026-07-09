import { Router } from 'express';
import { verifyToken, optionalAuth } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/role.middleware.js';
import {
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
} from '../controllers/route.controller.js';

const router = Router();

router.get('/', optionalAuth, getRoutes);
router.post('/', verifyToken, isAdmin, createRoute);
router.patch('/:id', verifyToken, isAdmin, updateRoute);
router.delete('/:id', verifyToken, isAdmin, deleteRoute);

export default router;
