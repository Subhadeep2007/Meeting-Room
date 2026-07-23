import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const socketAuth = async(socket, next) => {

    try {

        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authentication Failed"));
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return next(new Error("User Not Found"));
        }

        socket.user = user;

        next();

    } catch (error) {

        next(new Error("Invalid Token"));

    }

};

export default socketAuth;