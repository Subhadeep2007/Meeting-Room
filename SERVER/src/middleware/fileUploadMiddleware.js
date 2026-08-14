import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";


// ======================================
// Cloudinary File Storage
// ======================================

const storage = new CloudinaryStorage({

    cloudinary,

    params: {

        folder: "meeting-room/files",

        resource_type: "auto",

        allowed_formats: [

            // Images
            "jpg",
            "jpeg",
            "png",
            "webp",
            "gif",

            // Documents
            "pdf",
            "doc",
            "docx",
            "xls",
            "xlsx",
            "ppt",
            "pptx",

            // Video
            "mp4",

            // Audio
            "mp3",
            "wav",

        ],

    },

});


// ======================================
// Multer
// ======================================

const fileUpload = multer({

    storage,

    limits: {

        fileSize: 5 * 1024 * 1024,

    },

});


export default fileUpload;