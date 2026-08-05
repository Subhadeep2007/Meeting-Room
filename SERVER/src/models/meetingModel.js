import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(

    {

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
        // Co Hosts
        // =============================

        coHosts: [

            {

                type: mongoose.Schema.Types.ObjectId,

                ref: "User",

            },

        ],

        // =============================
        // Participants
        // =============================

        participants: [

            {

                type: mongoose.Schema.Types.ObjectId,

                ref: "User",

            },

        ],

        // =============================
        // Waiting Room
        // =============================

        waitingUsers: [

            {

                type: mongoose.Schema.Types.ObjectId,

                ref: "User",

            },

        ],

        // =============================
        // Banned Users
        // =============================

        bannedUsers: [

            {

                type: mongoose.Schema.Types.ObjectId,

                ref: "User",

            },

        ],

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
        // Recording
        // =============================

        recording: {

            type: Boolean,

            default: false,

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

    },

    {

        timestamps: true,

    }

);

meetingSchema.index({

    meetingCode: 1,

});

meetingSchema.index({

    host: 1,

});

meetingSchema.index({

    participants: 1,

});

export default mongoose.model(

    "Meeting",

    meetingSchema

);