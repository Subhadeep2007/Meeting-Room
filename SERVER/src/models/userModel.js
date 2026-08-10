import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },

    emailVerified: {
        type: Boolean,
        default: false,
    },

    emailVerificationOTP: {
        type: String,
        default: null,
    },

    emailVerificationExpire: {
        type: Date,
        default: null,
    },

    password: {
        type: String,
        required: true,
    },

    profilePicture: {
        url: {
            type: String,
            default: "",
        },
        public_id: {
            type: String,
            default: "",
        },
    },

    refreshToken: {
        type: String,
        default: null,
    },



    resetPasswordToken: {
        type: String,
        default: null,
    },

    resetPasswordExpire: {
        type: Date,
        default: null,
    },




    isOnline: {
        type: Boolean,
        default: false,
    },

    lastSeen: {
        type: Date,
        default: null,
    },

    // =============================
    // User Settings
    // =============================

    settings: {

        cameraEnabled: {
            type: Boolean,
            default: true,
        },

        microphoneEnabled: {
            type: Boolean,
            default: true,
        },

        meetingNotifications: {
            type: Boolean,
            default: true,
        },

        chatNotifications: {
            type: Boolean,
            default: true,
        },

        darkMode: {
            type: Boolean,
            default: false,
        },

        showOnlineStatus: {
            type: Boolean,
            default: true,
        },

    },
}, {
    timestamps: true,
});

const User = mongoose.model("User", userSchema);

export default User;