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

        const {
            name,
            username,
            email,
            password,
        } = req.body;

        // =====================================
        // Validation
        // =====================================

        if (!name ||
            !username ||
            !email ||
            !password
        ) {

            return res.status(
                httpStatus.BAD_REQUEST
            ).json({

                success: false,

                message: "All fields are required",

            });

        }

        // =====================================
        // Normalize Email
        // =====================================

        const normalizedEmail =
            email.trim().toLowerCase();

        // =====================================
        // Check Existing User
        // =====================================

        const existingUser = await User.findOne({

            $or: [

                {
                    email: normalizedEmail,
                },

                {
                    username: username
                        .trim()
                        .toLowerCase(),
                },

            ],

        });

        if (existingUser) {

            return res.status(
                httpStatus.CONFLICT
            ).json({

                success: false,

                message: "User already exists",

            });

        }

        // =====================================
        // Hash Password
        // =====================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        // =====================================
        // Generate OTP
        // =====================================

        const otp =
            crypto
            .randomInt(
                100000,
                1000000
            )
            .toString();

        // =====================================
        // Hash OTP
        // =====================================

        const hashedOTP =
            crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        // =====================================
        // OTP Expiry
        // 10 Minutes
        // =====================================

        const otpExpire =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );

        // =====================================
        // Create Unverified User
        // =====================================

        const newUser = await User.create({

            name: name.trim(),

            username: username
                .trim()
                .toLowerCase(),

            email: normalizedEmail,

            password: hashedPassword,

            emailVerified: false,

            emailVerificationOTP: hashedOTP,

            emailVerificationExpire: otpExpire,

        });

        // =====================================
        // Send OTP Email
        // =====================================

        try {

            await sendEmail(

                normalizedEmail,

                "Verify Your Email - Meeting Room",

                `
                <div style="font-family: Arial, sans-serif;">

                    <h2>Email Verification</h2>

                    <p>
                        Hello ${name},
                    </p>

                    <p>
                        Your OTP for Meeting Room
                        registration is:
                    </p>

                    <h1
                        style="
                            letter-spacing: 8px;
                            color: #2563eb;
                        "
                    >
                        ${otp}
                    </h1>

                    <p>
                        This OTP will expire in
                        <strong>10 minutes</strong>.
                    </p>

                    <p>
                        If you did not request this,
                        please ignore this email.
                    </p>

                </div>
                `

            );

        } catch (emailError) {

            // =====================================
            // Email Failed
            // Remove Unverified User
            // =====================================

            await User.findByIdAndDelete(
                newUser._id
            );

            console.error(
                "OTP Email Error:",
                emailError
            );

            return res.status(
                httpStatus.BAD_GATEWAY
            ).json({

                success: false,

                message: "Unable to send verification email",

            });

        }

        // =====================================
        // Response
        // =====================================

        return res.status(
            httpStatus.CREATED
        ).json({

            success: true,

            message: "OTP sent successfully. Please verify your email.",

            email: normalizedEmail,

        });

    } catch (error) {

        console.error(error);

        return res.status(
            httpStatus.INTERNAL_SERVER_ERROR
        ).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};

// ==========================
// Verify Email OTP
// ==========================
export const verifyEmailOTP = async(req, res) => {

    try {

        const { email, otp } = req.body;

        // =====================================
        // Validation
        // =====================================

        if (!email || !otp) {

            return res.status(
                httpStatus.BAD_REQUEST
            ).json({

                success: false,

                message: "Email and OTP are required",

            });

        }

        // =====================================
        // Normalize Email
        // =====================================

        const normalizedEmail =
            email.trim().toLowerCase();

        // =====================================
        // Find User
        // =====================================

        const user = await User.findOne({
            email: normalizedEmail,
        });

        if (!user) {

            return res.status(
                httpStatus.NOT_FOUND
            ).json({

                success: false,

                message: "User not found",

            });

        }

        // =====================================
        // Already Verified
        // =====================================

        if (user.emailVerified) {

            return res.status(
                httpStatus.CONFLICT
            ).json({

                success: false,

                message: "Email is already verified",

            });

        }

        // =====================================
        // Check OTP Expiry
        // =====================================

        if (!user.emailVerificationExpire ||
            user.emailVerificationExpire.getTime() <
            Date.now()
        ) {

            return res.status(
                httpStatus.BAD_REQUEST
            ).json({

                success: false,

                message: "OTP has expired",

            });

        }

        // =====================================
        // Hash Incoming OTP
        // =====================================

        const hashedOTP =
            crypto
            .createHash("sha256")
            .update(otp.toString())
            .digest("hex");

        // =====================================
        // Compare OTP
        // =====================================

        if (
            hashedOTP !==
            user.emailVerificationOTP
        ) {

            return res.status(
                httpStatus.BAD_REQUEST
            ).json({

                success: false,

                message: "Invalid OTP",

            });

        }

        // =====================================
        // Verify Email
        // =====================================

        user.emailVerified = true;

        // =====================================
        // Remove OTP
        // =====================================

        user.emailVerificationOTP = null;

        user.emailVerificationExpire = null;

        await user.save();

        // =====================================
        // Generate JWT
        // =====================================

        const token = jwt.sign(

            {
                id: user._id,

                username: user.username,

            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1d",
            }

        );

        // =====================================
        // Store Cookie
        // =====================================

        res.cookie(
            "token",
            token, {

                httpOnly: true,

                secure: true,

                sameSite: "none",

                maxAge: 24 * 60 * 60 * 1000,

            }
        );

        // =====================================
        // Remove Sensitive Data
        // =====================================

        const {
            password: _,
            refreshToken,
            emailVerificationOTP: __,
            emailVerificationExpire: ___,
            ...userData
        } = user.toObject();

        // =====================================
        // Response
        // =====================================

        return res.status(
            httpStatus.OK
        ).json({

            success: true,

            message: "Email verified successfully",

            user: userData,

        });

    } catch (error) {

        console.error(error);

        return res.status(
            httpStatus.INTERNAL_SERVER_ERROR
        ).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};


// ==========================
// Resend Email OTP
// ==========================
export const resendEmailOTP = async(req, res) => {

    try {

        const { email } = req.body;

        // =====================================
        // Validation
        // =====================================

        if (!email) {

            return res.status(
                httpStatus.BAD_REQUEST
            ).json({

                success: false,

                message: "Email is required",

            });

        }

        // =====================================
        // Normalize Email
        // =====================================

        const normalizedEmail =
            email.trim().toLowerCase();

        // =====================================
        // Find User
        // =====================================

        const user = await User.findOne({
            email: normalizedEmail,
        });

        if (!user) {

            return res.status(
                httpStatus.NOT_FOUND
            ).json({

                success: false,

                message: "User not found",

            });

        }

        // =====================================
        // Already Verified
        // =====================================

        if (user.emailVerified) {

            return res.status(
                httpStatus.CONFLICT
            ).json({

                success: false,

                message: "Email is already verified",

            });

        }

        // =====================================
        // Generate New OTP
        // =====================================

        const otp =
            crypto
            .randomInt(
                100000,
                1000000
            )
            .toString();

        // =====================================
        // Hash OTP
        // =====================================

        const hashedOTP =
            crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        // =====================================
        // New Expiry
        // =====================================

        const otpExpire =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );

        // =====================================
        // Update User
        // =====================================

        user.emailVerificationOTP =
            hashedOTP;

        user.emailVerificationExpire =
            otpExpire;

        await user.save();

        // =====================================
        // Send New OTP
        // =====================================

        try {

            await sendEmail(

                normalizedEmail,

                "New OTP - Meeting Room",

                `
                <div
                    style="
                        font-family: Arial, sans-serif;
                    "
                >

                    <h2>
                        Email Verification
                    </h2>

                    <p>
                        Your new OTP is:
                    </p>

                    <h1
                        style="
                            letter-spacing: 8px;
                            color: #2563eb;
                        "
                    >
                        ${otp}
                    </h1>

                    <p>
                        This OTP will expire in
                        <strong>10 minutes</strong>.
                    </p>

                    <p>
                        Please use the latest OTP.
                    </p>

                </div>
                `

            );

        } catch (emailError) {

            console.error(
                "Resend OTP Email Error:",
                emailError
            );

            return res.status(
                httpStatus.BAD_GATEWAY
            ).json({

                success: false,

                message: "Unable to send verification email",

            });

        }

        // =====================================
        // Response
        // =====================================

        return res.status(
            httpStatus.OK
        ).json({

            success: true,

            message: "New OTP sent successfully",

        });

    } catch (error) {

        console.error(error);

        return res.status(
            httpStatus.INTERNAL_SERVER_ERROR
        ).json({

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
        // =====================================
        // Email Verification Check
        // =====================================

        if (!user.emailVerified) {

            return res.status(
                httpStatus.FORBIDDEN
            ).json({

                success: false,

                message: "Please verify your email before login",

                emailVerified: false,

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
            secure: true,
            sameSite: "none",
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
            secure: true,
            sameSite: "none",
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