import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "meeting-room/profile-pictures",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif",
            "pdf",
            "mp4",
            "mp3",
            "wav",
            "docx",
            "xlsx",
            "pptx",
        ],
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

export default upload;