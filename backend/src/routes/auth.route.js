import express from "express";
import { 
  checkAuth, 
  login, 
  logout, 
  sendOtp, 
  completeSignupWithOtp, 
  updateProfile,
  signupWithPassword,
  googleAuth
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/complete-signup", completeSignupWithOtp);
router.post("/signup", signupWithPassword);
router.post("/login", login);
router.post("/google-auth", googleAuth);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

export default router;