import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import { createServer } from "node:http";

import cors from "cors";
import cookieParser from "cookie-parser";
import httpStatus from "http-status";

import { initializeSocket } from "./socket/socketManager.js";

// Routes
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";

const app = express();

// ==========================================
// Middleware
// ==========================================

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);

app.use(
    express.json({
        limit: "50mb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "50mb",
    })
);

app.use(cookieParser());

// ==========================================
// Routes
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/meeting", meetingRoutes);

// ==========================================
// Home Route
// ==========================================

app.get("/", (req, res) => {

    return res.status(httpStatus.OK).json({

        success: true,

        message: "Meeting Room Backend Running 🚀",

    });

});

// ==========================================
// 404 Route
// ==========================================

app.use((req, res) => {

    return res.status(httpStatus.NOT_FOUND).json({

        success: false,

        message: "Route Not Found",

    });

});

// ==========================================
// Global Error Handler
// ==========================================

app.use((err, req, res, next) => {

    console.error(err);

    return res.status(

        err.statusCode || httpStatus.INTERNAL_SERVER_ERROR

    ).json({

        success: false,

        message: err.message || "Internal Server Error",

    });

});

// ==========================================
// HTTP Server
// ==========================================

const server = createServer(app);

// ==========================================
// Socket.IO
// ==========================================

initializeSocket(server);

// ==========================================
// Database Connection
// ==========================================

const connectDB = async() => {

    try {

        await mongoose.connect(process.env.ATLASDB_URL);

        console.log("✅ MongoDB Connected Successfully");

    } catch (error) {

        console.error(error);

        process.exit(1);

    }

};

// ==========================================
// Start Server
// ==========================================

const PORT = process.env.PORT || 8000;

const startServer = async() => {

    try {

        await connectDB();

        server.listen(PORT, () => {

            console.log(
                `🚀 Server Running On http://localhost:${PORT}`
            );

        });

    } catch (error) {

        console.error(error);

    }

};

startServer();