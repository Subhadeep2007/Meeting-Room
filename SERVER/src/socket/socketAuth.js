import jwt from "jsonwebtoken";
import cookie from "cookie";
import User from "../models/userModel.js";

const socketAuth = async(socket, next) => {

    try {

        const cookies = cookie.parse(

            socket.handshake.headers.cookie || ""

        );

        const token = cookies.token;

        if (!token) {

            return next(

                new Error("Authentication Failed")

            );

        }

        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET

        );

        const user = await User.findById(

            decoded.id

        ).select("-password -refreshToken");

        if (!user) {

            return next(

                new Error("User Not Found")

            );

        }

        socket.user = user;

        next();

    } catch (error) {

        next(

            new Error("Invalid Token")

        );

    }

};

export default socketAuth;