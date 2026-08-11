import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({

        title: {
            type: String,
            required: true,
        },

        meetingCode: {
            type: String,
            required: true,
            unique: true,
        },

        description: {
            type: String,
            default: "",
        },

        // =============================
        // Host
        // =============================

        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // =============================
        // Participants
        // =============================

        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }, ],

        // =============================
        // Waiting Room
        // =============================

        waitingUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }, ],

        // =============================
        // Meeting Lock
        // =============================

        locked: {
            type: Boolean,
            default: false,
        },

        // =============================
        // Meeting Status
        // =============================

        status: {
            type: String,
            enum: [
                "scheduled",
                "live",
                "ended",
            ],
            default: "live",
        },

        // =============================
        // Meeting End Time
        // =============================

        endTime: {
            type: Date,
            default: null,
        },

        // =============================
        // Screen Share
        // =============================

        screenSharingBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // =============================
        // Chat Enabled
        // =============================

        chatEnabled: {
            type: Boolean,
            default: true,
        },

        // =============================
        // File Sharing
        // =============================

        fileSharingEnabled: {
            type: Boolean,
            default: true,
        },

        // =============================
        // Mute Everyone
        // =============================

        muteEveryone: {
            type: Boolean,
            default: false,
        },

        // =============================
        // Camera Disabled
        // =============================

        disableCameraForEveryone: {
            type: Boolean,
            default: false,
        },

        // =====================================================
        // CHAT ENCRYPTION KEYS
        // =====================================================
        // IMPORTANT:
        // Plain meeting AES key is NEVER stored here.
        //
        // Each user's copy of the meeting AES key is encrypted
        // with that user's RSA public key.
        // =====================================================

        chatEncryptionKeys: [{

            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },

            publicKey: {
                type: String,
                required: true,
            },

            encryptedMeetingKey: {
                type: String,
                required: true,
            },

        }, ],

    },

    {
        timestamps: true,
    }
);

// =============================
// Indexes
// =============================

meetingSchema.index({
    host: 1,
});

meetingSchema.index({
    participants: 1,
});

// =============================
// Chat Encryption Key Index
// =============================

meetingSchema.index({
    "chatEncryptionKeys.user": 1,
});

export default mongoose.model(
    "Meeting",
    meetingSchema
);