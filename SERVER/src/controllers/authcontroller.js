import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import User from "../models/userModel.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

// ==========================
// Register
// ==========================
export const register = async(req, res) => {
    try {
        const { name, username, email, password } = req.body;

        // Validation
        if (!name || !username || !email || !password) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check Existing User
        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            return res.status(httpStatus.CONFLICT).json({
                success: false,
                message: "User already exists",
            });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const newUser = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
        });

        // Generate JWT
        const token = jwt.sign({
                id: newUser._id,
                username: newUser.username,
            },
            process.env.JWT_SECRET, {
                expiresIn: "1d",
            }
        );

        // Store Cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // true in production
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });

        // Remove Password
        const { password: _, refreshToken, ...user } =
        newUser.toObject();

        return res.status(httpStatus.CREATED).json({
            success: true,
            message: "Registration Successful",
            user,
        });

    } catch (error) {

        console.log(error);

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error",
        });

    }
};

// ==========================
// Login
// ==========================
export const login = async(req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: "Email and Password are required",
            });
        }

        // Find User
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({
                success: false,
                message: "User not found",
            });
        }

        // Compare Password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                message: "Invalid Email or Password",
            });
        }

        // Generate JWT
        const token = jwt.sign({
                id: user._id,
                username: user.username,
            },
            process.env.JWT_SECRET, {
                expiresIn: "1d",
            }
        );

        // Cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });

        // Remove Password
        const { password: _, refreshToken, ...userData } =
        user.toObject();

        return res.status(httpStatus.OK).json({
            success: true,
            message: "Login Successful",
            user: userData,
        });

    } catch (error) {

        console.log(error);

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error",
        });

    }
};

// ==========================
// Get Current User
// ==========================
export const getCurrentUser = async(req, res) => {

    try {

        return res.status(httpStatus.OK).json({
            success: true,
            user: req.user,
        });

    } catch (error) {

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error",
        });

    }

};

// ==========================
// Logout
// ==========================
export const logout = async(req, res) => {

    try {

        res.clearCookie("token", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });

        return res.status(httpStatus.OK).json({
            success: true,
            message: "Logout Successful",
        });

    } catch (error) {

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error",
        });

    }

};



// forgot password and reset password, //


export const forgotPassword = async(req, res) => {
    try {

        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Random Token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Hash Token
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetURL =
            `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        await sendEmail(
            user.email,
            "Reset Password",
            `
            <h2>Password Reset</h2>

            <p>Click the button below to reset your password.</p>

            <a href="${resetURL}">
                Reset Password
            </a>
            `
        );

        return res.status(200).json({
            success: true,
            message: "Password reset link sent successfully",
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};


//reset password//


export const resetPassword = async(req, res) => {
    try {

        const { token } = req.params;
        const { password } = req.body;

        // Validation
        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required",
            });
        }

        // Hash incoming token
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or Expired Reset Token",
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password
        user.password = hashedPassword;

        // Remove reset token
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password Reset Successfully",
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });

    }
};