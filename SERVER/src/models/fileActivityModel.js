import mongoose from "mongoose";

const fileActivitySchema = new mongoose.Schema({

    file: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
        required: true,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    action: {
        type: String,
        enum: [
            "UPLOAD",
            "DOWNLOAD",
            "DELETE",
            "RENAME",
            "PREVIEW",
        ],
        required: true,
    },

    ipAddress: {
        type: String,
        default: "",
    },

    userAgent: {
        type: String,
        default: "",
    },

}, {
    timestamps: true,
});

fileActivitySchema.index({
    file: 1,
    createdAt: -1,
});

export default mongoose.model(
    "FileActivity",
    fileActivitySchema
);