import { Router } from 'express';
import {
  createBloodRequest,
  updateBloodRequestStatus,
  transferBloodUnit,
  getNGOBloodRequests,
  getHospitalBloodRequests,
  confirmBloodDelivery
} from '../controllers/bloodRequest.controller.js';
import { verifyJWT } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT); // All routes require authentication

// Routes for hospitals and NGOs - the verifyJWT middleware will handle role-based access
router.post('/create', createBloodRequest);
router.get('/hospital', getHospitalBloodRequests);
router.post('/confirm-delivery/:requestId', confirmBloodDelivery);
router.get('/ngo', getNGOBloodRequests);
router.patch('/:requestId/status', updateBloodRequestStatus);
router.post('/transfer/:donationId', transferBloodUnit);

export default router;