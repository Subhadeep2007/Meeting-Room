import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
    uploadProfilePicture,
} from "../controllers/userController.js";

const router = Router();

router.put(
    "/profile-picture",
    authMiddleware,
    upload.single("profilePicture"),
    uploadProfilePicture
);

export default router;