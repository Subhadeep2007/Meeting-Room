import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true,
    },

    meetingCode: {
        type: String,
        required: true,
        unique: true,
    },

    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],

    isActive: {
        type: Boolean,
        default: true,
    },

    startTime: {
        type: Date,
        default: Date.now,
    },

    endTime: {
        type: Date,
        default: null,
    },

}, {
    timestamps: true,
});

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;