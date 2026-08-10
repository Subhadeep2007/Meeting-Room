import bcrypt from "bcrypt";
import httpStatus from "http-status";
import User from "../models/userModel.js";
import { generateAccessToken } from "../utils/generateToken.js";
import cloudinary from "../config/cloudinary.js";
import { getIO } from "../socket/socketManager.js";
const register = async(req, res) => {
    try {
        const { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: "All fields are required",
            });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            return res.status(httpStatus.CONFLICT).json({
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
        });

        const token = generateAccessToken(newUser);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });

        const { password: _, refreshToken, ...user } = newUser.toObject();

        return res.status(httpStatus.CREATED).json({
            success: true,
            message: "Registration Successful",
            user,
        });

    } catch (error) {
        console.log(error);

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Internal Server Error",
        });
    }
};

export default register;


// profile picture upload//
export const uploadProfilePicture = async(req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image",
            });
        }

        const user = await User.findById(req.user._id);

        // Delete old image
        if (user.profilePicture.public_id) {

            await cloudinary.uploader.destroy(
                user.profilePicture.public_id
            );

        }

        // Save new image
        user.profilePicture = {
            url: req.file.path,
            public_id: req.file.filename,
        };

        await user.save();

        return res.status(200).json({

            success: true,

            message: "Profile Picture Updated",

            profilePicture: user.profilePicture.url,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }

};


// =====================================
// Update Profile
// =====================================

export const updateProfile = async(req, res) => {

    try {

        const { name, username } = req.body;

        // =====================================
        // Validation
        // =====================================

        if (!name || !username) {

            return res.status(httpStatus.BAD_REQUEST).json({

                success: false,

                message: "Name and username are required",

            });

        }

        const trimmedName = name.trim();

        const trimmedUsername =
            username.trim().toLowerCase();

        if (!trimmedName || !trimmedUsername) {

            return res.status(httpStatus.BAD_REQUEST).json({

                success: false,

                message: "Name and username cannot be empty",

            });

        }

        // =====================================
        // Check Username
        // =====================================

        const existingUser = await User.findOne({

            username: trimmedUsername,

            _id: {
                $ne: req.user._id,
            },

        });

        if (existingUser) {

            return res.status(httpStatus.CONFLICT).json({

                success: false,

                message: "Username already exists",

            });

        }

        // =====================================
        // Find Current User
        // =====================================

        const user = await User.findById(
            req.user._id
        );

        if (!user) {

            return res.status(httpStatus.NOT_FOUND).json({

                success: false,

                message: "User not found",

            });

        }

        // =====================================
        // Update
        // =====================================

        user.name = trimmedName;

        user.username = trimmedUsername;

        await user.save();

        // =====================================
        // Remove Sensitive Data
        // =====================================

        const {
            password,
            refreshToken,
            emailVerificationOTP,
            emailVerificationExpire,
            resetPasswordToken,
            resetPasswordExpire,
            ...userData
        } = user.toObject();

        // =====================================
        // Response
        // =====================================

        return res.status(httpStatus.OK).json({

            success: true,

            message: "Profile Updated Successfully",

            user: userData,

        });

    } catch (error) {

        console.error(
            "Update Profile Error:",
            error
        );

        return res.status(
            httpStatus.INTERNAL_SERVER_ERROR
        ).json({

            success: false,

            message: "Internal Server Error",

        });

    }

}; // =====================================
// Get User Settings
// =====================================

export const getSettings = async(req, res) => {

    try {

        const user = await User.findById(
            req.user._id
        ).select("settings");

        if (!user) {

            return res.status(
                httpStatus.NOT_FOUND
            ).json({

                success: false,

                message: "User not found",

            });

        }

        return res.status(
            httpStatus.OK
        ).json({

            success: true,

            settings: user.settings,

        });

    } catch (error) {

        console.error(
            "Get Settings Error:",
            error
        );

        return res.status(
            httpStatus.INTERNAL_SERVER_ERROR
        ).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};


// =====================================
// Update User Settings
// =====================================

export const updateSettings = async(req, res) => {

    try {

        const {
            cameraEnabled,
            microphoneEnabled,
            meetingNotifications,
            chatNotifications,
            darkMode,
            showOnlineStatus,
        } = req.body;

        const user = await User.findById(
            req.user._id
        );

        if (!user) {

            return res.status(
                httpStatus.NOT_FOUND
            ).json({

                success: false,

                message: "User not found",

            });

        }

        // =================================
        // Update Only Provided Values
        // =================================

        if (
            typeof cameraEnabled ===
            "boolean"
        ) {

            user.settings.cameraEnabled =
                cameraEnabled;

        }

        if (
            typeof microphoneEnabled ===
            "boolean"
        ) {

            user.settings.microphoneEnabled =
                microphoneEnabled;

        }

        if (
            typeof meetingNotifications ===
            "boolean"
        ) {

            user.settings.meetingNotifications =
                meetingNotifications;

        }

        if (
            typeof chatNotifications ===
            "boolean"
        ) {

            user.settings.chatNotifications =
                chatNotifications;

        }

        if (
            typeof darkMode ===
            "boolean"
        ) {

            user.settings.darkMode =
                darkMode;

        }

        if (
            typeof showOnlineStatus ===
            "boolean"
        ) {

            user.settings.showOnlineStatus =
                showOnlineStatus;

        }

        await user.save();


        const io = getIO();

        if (typeof showOnlineStatus === "boolean") {

            // =====================================
            // Show Online Status ON
            // =====================================

            if (showOnlineStatus) {

                await User.findByIdAndUpdate(
                    user._id, {
                        isOnline: true,
                    }
                );

                io.emit("user-online", {

                    userId: user._id.toString(),

                    username: user.username,

                });

            }

            // =====================================
            // Show Online Status OFF
            // =====================================
            else {

                const lastSeen = new Date();

                await User.findByIdAndUpdate(
                    user._id, {
                        isOnline: false,
                        lastSeen,
                    }
                );

                io.emit("user-offline", {

                    userId: user._id.toString(),

                    lastSeen,

                });

            }

        }


        return res.status(
            httpStatus.OK
        ).json({

            success: true,

            message: "Settings Updated Successfully",

            settings: user.settings,

        });

    } catch (error) {

        console.error(
            "Update Settings Error:",
            error
        );

        return res.status(
            httpStatus.INTERNAL_SERVER_ERROR
        ).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};