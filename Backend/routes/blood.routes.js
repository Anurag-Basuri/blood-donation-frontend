import { Router } from 'express';
import {
  registerBloodDonation,
  getNGOBloodDonations,
  updateBloodDonationStatus, 
  getNGOBloodInventory,
  getBloodDonationDetails,
  getExpiringBloodDonations
} from '../controllers/blood.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

// All blood-related routes require authentication
router.use(verifyJWT);

router.post('/register-donation', registerBloodDonation);
router.get('/donations', getNGOBloodDonations); 
router.patch('/donation/:donationId/status', updateBloodDonationStatus);
router.get('/inventory', getNGOBloodInventory);
router.get('/donation/:donationId', getBloodDonationDetails);
router.get('/expiring', getExpiringBloodDonations);

export default router;