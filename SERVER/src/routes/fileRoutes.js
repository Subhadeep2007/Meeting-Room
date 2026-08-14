import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import fileUpload from "../middleware/fileUploadMiddleware.js";

import {
    uploadFile,
    getFile,
    deleteFile,
    downloadFile,
    recentFiles,
} from "../controllers/fileController.js";


const router = express.Router();


// ======================================
// Upload File
// ======================================

router.post(

    "/upload",

    authMiddleware,

    fileUpload.single("file"),

    uploadFile

);


// ======================================
// Download
// ======================================

router.get(

    "/download/:fileId",

    authMiddleware,

    downloadFile

);


// ======================================
// Meeting File History
// ======================================

router.get(

    "/recent/:meetingCode",

    authMiddleware,

    recentFiles

);


// ======================================
// Get Single File
// ======================================

router.get(

    "/:fileId",

    authMiddleware,

    getFile

);


// ======================================
// Delete Own File
// ======================================

router.delete(

    "/:fileId",

    authMiddleware,

    deleteFile

);


export default router;