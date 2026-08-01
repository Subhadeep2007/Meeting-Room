import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getMessages } from "../controllers/messageController.js";

const router = Router();

router.get(
    "/:meetingId",
    authMiddleware,
    getMessages
);

export default router;