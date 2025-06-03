import { Router } from 'express';
import {
  addCenter,
  deleteCenter,
  getCenterById,
  getAllCenters
} from '../controllers/center.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(verifyJWT);

router.post('/', addCenter);
router.delete('/:centerId', deleteCenter);
router.get('/:centerId', getCenterById);
router.get('/', getAllCenters);

export default router;