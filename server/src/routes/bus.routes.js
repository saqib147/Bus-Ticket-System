import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { isAdmin, isAdminOrOperator } from '../middleware/role.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
  searchBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
  getMyBuses,
} from '../controllers/bus.controller.js';

const router = Router();

router.get('/search', searchBuses);
router.get('/operator/my-buses', verifyToken, isAdminOrOperator, getMyBuses);
router.get('/:id', getBusById);
router.post('/', verifyToken, isAdmin, upload.array('photos', 5), createBus);
router.patch('/:id', verifyToken, isAdmin, upload.array('photos', 5), updateBus);
router.delete('/:id', verifyToken, isAdmin, deleteBus);

export default router;
