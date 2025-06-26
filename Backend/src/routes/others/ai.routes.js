import { Router } from 'express';
import { validateRequest } from '../../middleware/validator.middleware.js';
import { verifyJWT } from '../../middleware/auth.middleware.js';
import {
	findDonorMatches,
	predictSupply,
	optimizeEmergencyResponse,
	analyzeDonorRetention,
	getCampaignInsights,
	predictDonorHealth,
} from '../../controllers/others/ai.controller.js';

const router = Router();

// 🔐 Protected routes — ensure authenticated access
router.use(verifyJWT);

// 🧠 Match donors based on AI logic
router.post('/donor-matches', findDonorMatches);

// 📈 Predict blood/organ/plasma supply based on past data
router.get('/predict-supply', predictSupply);

// 🚨 Emergency optimization (logistics, response time)
router.post('/emergency-optimize', optimizeEmergencyResponse);

// 📊 Analyze how well donors are retained
router.get('/donor-retention', analyzeDonorRetention);

// 📣 Evaluate success & insights of donation campaigns
router.get('/campaign-insights', getCampaignInsights);

// 🩺 Predict donor health trends (for future eligibility etc.)
router.get('/predict-health', predictDonorHealth);

export default router;
