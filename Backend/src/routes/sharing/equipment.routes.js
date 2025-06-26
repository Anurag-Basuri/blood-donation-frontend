import { Router } from 'express';
import { validateRequest } from '../../middleware/validator.middleware.js';
import { verifyJWT } from '../../middleware/auth.middleware.js';
import { uploadFields, handleMulterError } from '../../middleware/multer.middleware.js';
import {
	listEquipment,
	addEquipment,
	updateEquipmentStatus,
	bookEquipment,
	endBooking,
	cancelBooking,
	uploadEquipmentImage,
	getEquipmentHistory,
} from '../../controllers/sharing/equipment.controller.js';

const router = Router();

// 🧾 Public Route - List all available equipment
router.get('/', listEquipment);

// 🔐 Protected Routes (require login)
router.use(verifyJWT);

// ➕ Add new equipment
router.post('/add', uploadFields([{ name: 'image', maxCount: 1 }]), handleMulterError, addEquipment);

// 📸 Upload or update equipment image
router.post(
	'/:equipmentId/upload-image',
	uploadFields([{ name: 'image', maxCount: 1 }]),
	handleMulterError,
	uploadEquipmentImage,
);

// ✅ Update equipment status (available, in-use, maintenance, etc.)
router.put('/:equipmentId/status', updateEquipmentStatus);

// 📅 Book equipment
router.post('/:equipmentId/book', bookEquipment);

// 🛑 End an equipment booking session
router.post('/:equipmentId/end-booking', endBooking);

// ❌ Cancel an active or upcoming booking
router.post('/:equipmentId/cancel-booking', cancelBooking);

// 📜 Get history/logs of equipment usage
router.get('/:equipmentId/history', getEquipmentHistory);

export default router;
