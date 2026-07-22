import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import httpStatus from "http-status";

const authMiddleware = async(req, res, next) => {
    try {

        // 1. Get Token From Cookie
        const token = req.cookies.token;

        // 2. Token Check
        if (!token) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                message: "Unauthorize",
            });
        }

        // 3. Verify Token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // 4. Find User
        const user = await User.findById(decoded.id)
            .select("-password -refreshToken");

        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({
                success: false,
                message: "User Not Found",
            });
        }

        // 5. Store User Inside Request
        req.user = user;


        next();

    } catch (error) {

        return res.status(httpStatus.UNAUTHORIZED).json({
            success: false,
            message: "Invalid or Expired Token",
        });

    }
};

export default authMiddleware;