import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    meeting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meeting",
        required: true,
        index: true,
    },

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    encryptedMessage: {
        type: String,
        required: true,
    },

    iv: {
        type: String,
        required: true,
    },

    authTag: {
        type: String,
        required: true,
    },

    messageType: {
        type: String,
        enum: [
            "text",
            "image",
            "video",
            "audio",
            "file",
        ],
        default: "text",
    },

    // Reply Feature
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: null,
    },

    // File Attachments
    attachments: [{
        url: {
            type: String,
        },

        public_id: {
            type: String,
        },

        fileName: {
            type: String,
        },

        fileSize: {
            type: Number,
        },

        mimeType: {
            type: String,
        },
    }, ],

    isEdited: {
        type: Boolean,
        default: false,
    },

    isDeleted: {
        type: Boolean,
        default: false,
    },

    deliveredTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }, ],

    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }, ],
}, {
    timestamps: true,
});

// Compound Index
messageSchema.index({
    meeting: 1,
    createdAt: -1,
});

const Message = mongoose.model("Message", messageSchema);

export default Message;