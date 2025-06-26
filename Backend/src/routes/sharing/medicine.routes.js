import { Router } from 'express';
import { validateRequest } from '../../middleware/validator.middleware.js';
import { verifyJWT } from '../../middleware/auth.middleware.js';
import {
	listMedicines,
	addMedicine,
	updateMedicineStatus,
	getMedicineAnalytics,
} from '../../controllers/sharing/medicine.controller.js';

const router = Router();

// 📦 Public Route - List available medicines
router.get('/', listMedicines);

// 🔐 Protected routes for registered users/NGOs/Hospitals
router.use(verifyJWT);

// ➕ Add a new medicine entry
router.post('/add', addMedicine);

// ✅ Update medicine status (available, used, expired, etc.)
router.put('/:medicineId/status', updateMedicineStatus);

// 📊 Get analytics (stock levels, usage stats, expiration tracking, etc.)
router.get('/analytics/report', getMedicineAnalytics);

export default router;
