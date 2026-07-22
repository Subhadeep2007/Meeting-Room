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
}, {
    timestamps: true,
});

const User = mongoose.model("User", userSchema);

export default User;