import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
    uploadProfilePicture,
    updateProfile,
    getSettings,
    updateSettings,
} from "../controllers/userController.js";

const router = Router();


router.put(
    "/profile",
    authMiddleware,
    updateProfile
);

router.put(
    "/profile-picture",
    authMiddleware,
    upload.single("profilePicture"),
    uploadProfilePicture
);
// =====================================
// Get Settings
// =====================================

router.get(
    "/settings",
    authMiddleware,
    getSettings
);


// =====================================
// Update Settings
// =====================================

router.put(
    "/settings",
    authMiddleware,
    updateSettings
);

export default router;