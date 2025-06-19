import { Router } from 'express';
import { validateRequest } from '../../middleware/validator.middleware.js';
import { verifyJWT } from '../../middleware/auth.middleware.js';
import { uploadFields, handleMulterError } from '../../middleware/multer.middleware.js';
import {
	createOrganRequest,
	updateRequestStatus,
	findPotentialDonors,
	trackRequest,
	getHighPriorityRequests,
	cancelRequest,
} from '../../controllers/donation/organRequest.controller.js';

const router = Router();

// Configure file upload for medical documents
const documentUpload = uploadFields([
	{ name: 'medicalReports', maxCount: 3 },
	{ name: 'consentForms', maxCount: 2 },
	{ name: 'legalDocuments', maxCount: 2 },
]);

// Protect all routes
router.use(verifyJWT);

// Routes with validation and rate limiting
router.post(
	'/',
	documentUpload,
	handleMulterError,
	validateRequest('organRequest.create'),
	createOrganRequest,
);

router.patch(
	'/:requestId/status',
	validateRequest('organRequest.updateStatus'),
	updateRequestStatus,
);

router.get('/:requestId/donors', validateRequest('organRequest.findDonors'), findPotentialDonors);

router.get('/high-priority', getHighPriorityRequests);

router.get('/:requestId/track', validateRequest('organRequest.track'), trackRequest);

router.delete('/:requestId', validateRequest('organRequest.cancel'), cancelRequest);

// Error handler
router.use((err, req, res, next) => {
	console.error('Organ Request Error:', err);
	if (err.name === 'ValidationError') {
		return res.status(400).json({
			success: false,
			message: err.message,
		});
	}
	next(err);
});

export default router;
