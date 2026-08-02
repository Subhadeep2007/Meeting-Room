import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

import {
    uploadFile,
    getFile,
    deleteFile,
    renameFile,

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
export default router;