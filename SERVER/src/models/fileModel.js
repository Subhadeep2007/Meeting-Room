import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({

    meeting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meeting",
        required: true,
        index: true,
    },

    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    fileName: {
        type: String,
        required: true
    },

    originalName: {
        type: String,
        required: true,
    },

    url: {
        type: String,
        required: true,
    },

    public_id: {
        type: String,
        required: true,
    },

    mimeType: {
        type: String,
        required: true,
    },

    fileSize: {
        type: Number,
        required: true,
    },

    fileType: {
        type: String,
        enum: [
            "image",
            "video",
            "audio",
            "pdf",
            "document",
            "other",
        ],
        default: "other",
    },

    isDeleted: {
        type: Boolean,
        default: false,
    },

}, {
    timestamps: true,
});

fileSchema.index({
    meeting: 1,
    createdAt: -1,
});

const File = mongoose.model(
    "File",
    fileSchema
);

export default File;