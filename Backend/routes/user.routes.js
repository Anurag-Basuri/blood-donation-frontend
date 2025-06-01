import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  verifyEmail,
  resendEmailOTP,
  getUserBloodDonationHistory,
  getUserBloodDonationStats,
  updateBloodType,
  updateMedicalHistory,
  getBloodDonationDetailsByUser,
  findNearbyNGOsForDonation,
  updateUserLocation,
  getAllBloodDonationCamps
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refreshToken", refreshAccessToken);
router.route("/verify-email").post(verifyEmail);
router.route("/resend-email-otp").post(resendEmailOTP);

// Protected routes
router.use(verifyJWT); // Apply verifyJWT middleware to all routes below

router.post("/logout", logoutUser);
router.get("/current-user", getCurrentUser);
router.post("/change-password", changeCurrentPassword);
router.patch("/update-account", updateAccountDetails);
router.route("/register").post(registerUser);
router.route("/update-blood-type").post(updateBloodType);
router.route("/update-medical-history").post(updateMedicalHistory);
router.get("/blood-donation-history", getUserBloodDonationHistory);
router.get("/blood-donation-stats", getUserBloodDonationStats);
router.get("/blood-donation-details/:donationId", getBloodDonationDetailsByUser);
router.get('/nearby-ngos', verifyJWT, findNearbyNGOsForDonation);
router.patch("/update-location", verifyJWT, updateUserLocation);

// Blood donation camps routes
router.get("/donation-camps", verifyJWT, getAllBloodDonationCamps);

export default router;
