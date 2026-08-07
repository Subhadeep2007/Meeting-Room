import { Router } from "express";
import {
    register,
    login,
    logout,
    getCurrentUser,
    forgotPassword,
    resetPassword,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Public Routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// Protected Routes
router.get("/current-user", authMiddleware, getCurrentUser);
router.post("/logout", authMiddleware, logout);

export default router;