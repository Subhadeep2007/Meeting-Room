import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

import {
    uploadFile,
    getFile,
    deleteFile,
    renameFile,
    downloadFile,
    fileHistory,
    recentFiles,

} from "../controllers/fileController.js";

const router = express.Router();

router.post(

    "/upload",

    authMiddleware,

    upload.single("file"),

    uploadFile

);


router.get(
    "/:fileId",
    authMiddleware,
    getFile
);
router.delete(
    "/:fileId",
    authMiddleware,
    deleteFile
);
router.put(

    "/rename/:fileId",

    authMiddleware,

    renameFile

);

router.get(

    "/recent/:meetingId",

    authMiddleware,

    getFile

);
router.get(
    "/download/:fileId",
    authMiddleware,
    downloadFile
);
router.get(
    "/history/:fileId",
    authMiddleware,
    fileHistory
);

router.get(

    "/recent/:meetingId",

    authMiddleware,

    recentFiles

);
export default router;