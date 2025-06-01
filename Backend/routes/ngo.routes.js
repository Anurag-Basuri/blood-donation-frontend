import { Router } from 'express';
import { upload } from '../middleware/multer.middleware.js';
import {
  registerNGO,
  verifyNGOEmail,
  // requestNewOTP,
  resendVerificationOtp,
  loginNGO,
  logoutNGO,
  refreshAccessToken,
  getNGOProfile,
  updateNGOProfile,
  updateBloodInventory,
  getConnectedHospitals,
  respondToConnectionRequest,
  changePassword
} from '../controllers/ngo.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.post('/register', upload.fields([{ name: 'logo', maxCount: 1 }]), registerNGO);
router.post('/verify-email', verifyNGOEmail);
router.post('/resend-otp', resendVerificationOtp);
// router.post('/request-otp', requestNewOTP);
router.post('/login', loginNGO);
router.post('/refresh-token', refreshAccessToken);

// Protected routes
router.use(verifyJWT); // Apply verifyJWT middleware to all routes below

router.get('/logout', logoutNGO);
router.get('/profile', getNGOProfile);
router.post('/update-profile', upload.fields([{ name: 'logo', maxCount: 1 }]), updateNGOProfile);
router.post('/update-blood-inventory', updateBloodInventory);
router.get('/connected-hospitals', getConnectedHospitals);
router.post('/connection-response', respondToConnectionRequest);
router.post('/change-password', changePassword);

export default router;