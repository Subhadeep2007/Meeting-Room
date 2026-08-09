import { Router } from "express";
import {
    register,
    login,
    logout,
    getCurrentUser,
    forgotPassword,
    resetPassword,

    verifyEmailOTP,
    resendEmailOTP,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Public Routes
router.post("/register", register);
// ==========================
// Verify Email OTP
// ==========================

router.post(
    "/verify-email",
    verifyEmailOTP
);

// ==========================
// Resend Email OTP
// ==========================

router.post(
    "/resend-otp",
    resendEmailOTP
);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// Protected Routes
router.get("/current-user", authMiddleware, getCurrentUser);
router.post("/logout", authMiddleware, logout);

export default router;