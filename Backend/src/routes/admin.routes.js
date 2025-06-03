import { Router } from 'express';
import {
  adminLogin,
  adminLogout,
  getDashboardOverview,
  getBloodInventoryAnalytics,
  getGeoAnalytics,
  getDonorAnalytics,
  getHospitalAnalytics,
  getNGOAnalytics,
  getTimeBasedAnalytics,
  getAllUsers,
  getAllNGOs,
  getAllHospitals,
  getAllBloodDonations,
  verifyNGO,
  verifyHospital
} from '../controllers/admin.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.post('/login', adminLogin);

// Protected routes
router.use(verifyJWT); // Apply verifyJWT middleware to all routes below

router.get('/logout', adminLogout);
router.get('/dashboard', getDashboardOverview);
router.get('/analytics/blood-inventory', getBloodInventoryAnalytics);
router.get('/analytics/geo', getGeoAnalytics);
router.get('/analytics/donors', getDonorAnalytics);
router.get('/analytics/hospitals', getHospitalAnalytics);
router.get('/analytics/ngos', getNGOAnalytics);
router.get('/analytics/trends', getTimeBasedAnalytics);
router.get('/users', getAllUsers);
router.get('/ngos', getAllNGOs);
router.get('/hospitals', getAllHospitals);
router.get('/blood-donations', getAllBloodDonations);
router.patch('/ngo/:ngoId/verify', verifyNGO);
router.patch('/hospital/:hospitalId/verify', verifyHospital);

export default router;