import { Router } from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    createMeeting,
    joinMeeting,
    getMyMeetings,
    getMeetingDetails,
    endMeeting,
    deleteMeeting,
} from "../controllers/meetingController.js";

const router = Router();

// ======================================
// Create Meeting
// ======================================
router.post(
    "/create",
    authMiddleware,
    createMeeting
);

// ======================================
// Join Meeting
// ======================================
router.post(
    "/join",
    authMiddleware,
    joinMeeting
);

// ======================================
// Get My Meetings
// ======================================
router.get(
    "/my-meetings",
    authMiddleware,
    getMyMeetings
);

// ======================================
// Get Meeting Details
// ======================================
router.get(
    "/:id",
    authMiddleware,
    getMeetingDetails
);

// ======================================
// End Meeting
// ======================================
router.put(
    "/end/:id",
    authMiddleware,
    endMeeting
);

// ======================================
// Delete Meeting
// ======================================
router.delete(
    "/:id",
    authMiddleware,
    deleteMeeting
);

export default router;