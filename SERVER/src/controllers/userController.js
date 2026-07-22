import bcrypt from "bcrypt";
import httpStatus from "http-status";
import User from "../models/userModel.js";
import { generateAccessToken } from "../utils/generateToken.js";
import cloudinary from "../config/cloudinary.js";

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