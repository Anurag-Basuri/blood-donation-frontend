import { Router } from 'express';
import { validateRequest } from '../../middleware/validator.middleware.js';
import { verifyJWT } from '../../middleware/auth.middleware.js';
import {
	listMedicines,
	addMedicine,
	updateMedicineStatus,
	getMedicineAnalytics,
	MEDICINE_STATUS,
} from '../../controllers/sharing/medicine.controller.js';

const router = Router();

// Public routes with rate limiting
router.get('/', validateRequest('medicine.list'), listMedicines);

// Protected routes
router.use(verifyJWT);

router.post('/', validateRequest('medicine.add'), addMedicine);

router.patch('/:medicineId/status', validateRequest('medicine.updateStatus'), updateMedicineStatus);

router.get('/analytics', validateRequest('medicine.analytics'), getMedicineAnalytics);

// Error handler
router.use((err, req, res, next) => {
	console.error('Medicine Error:', err);
	if (err.name === 'ValidationError') {
		return res.status(400).json({
			success: false,
			message: err.message,
		});
	}
	next(err);
});

export default router;
