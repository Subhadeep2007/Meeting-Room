import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import { createServer } from "node:http";

import cors from "cors";
import cookieParser from "cookie-parser";
import httpStatus from "http-status";

// ==============================
// Socket
// ==============================

import { initializeSocket } from "./socket/socketManager.js";

// ==============================
// Routes
// ==============================

import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";

// ==============================
// App
// ==============================

const app = express();

// ==============================
// Middlewares
// ==============================

const allowedOrigins = [
    process.env.FRONTEND_URL,

];

app.use(
    cors({
        origin: (origin, callback) => {

            // Postman / Hoppscotch / Server-to-Server requests
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },

        credentials: true,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],

    })
);

app.use(express.json({ limit: "50mb" }));

app.use(
    express.urlencoded({
        extended: true,
        limit: "50mb",
    })
);

app.use(cookieParser());

// ==============================
// Routes
// ==============================

app.use("/api/auth", authRoutes);

app.use("/api/user", userRoutes);

app.use("/api/meeting", meetingRoutes);

app.use("/api/messages", messageRoutes);
app.use(

    "/api/files",

    fileRoutes

);

// ==============================
// Home Route
// ==============================

app.get("/", (req, res) => {

    return res.status(httpStatus.OK).json({

        success: true,

        message: "Meeting Room Backend Running 🚀",

    });

});

// ==============================
// 404 Route
// ==============================

app.use((req, res) => {

    return res.status(httpStatus.NOT_FOUND).json({

        success: false,

        message: "Route Not Found",

    });

});

// ==============================
// Global Error Handler
// ==============================

app.use((err, req, res, next) => {

    console.error(err);

    return res.status(

        err.statusCode || httpStatus.INTERNAL_SERVER_ERROR

    ).json({

        success: false,

        message: err.message || "Internal Server Error",

    });

});

// ==============================
// HTTP Server
// ==============================

const server = createServer(app);

// ==============================
// Socket Initialization
// ==============================

initializeSocket(server);

// ==============================
// MongoDB Connection
// ==============================

const connectDB = async() => {

    try {

        await mongoose.connect(process.env.ATLASDB_URL);

        console.log("✅ MongoDB Connected Successfully");

    } catch (error) {

        console.error("❌ MongoDB Connection Failed");

        console.error(error);

        process.exit(1);

    }

};

// ==============================
// Start Server
// ==============================

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