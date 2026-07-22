import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import { createServer } from "node:http";
import httpStatus from "http-status";

import cors from "cors";
import cookieParser from "cookie-parser";

import { connectToSocket } from "./controllers/socketManager.js";

//  Import Routes
import authRoutes from "./routes/authRoute.js";
import meetingRoutes from "./routes/meetingRoutes.js";

import userRoutes from "./routes/userRoutes.js";

const app = express();

// Middleware
app.use(cors());

app.use(express.json({
    limit: "50mb",
}));

app.use(express.urlencoded({
    limit: "50mb",
    extended: true,
}));

app.use(cookieParser());

//  Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/meeting", meetingRoutes);

// HTTP Server
const server = createServer(app);

// Socket.IO
connectToSocket(server);

// Test Route
app.get("/", (req, res) => {
    return res.json({
        message: "Hello from Sayan",
    });
});

// MongoDB URL
const dburl = process.env.ATLASDB_URL;

// Start Server
async function startServer() {
    try {

        await mongoose.connect(dburl, {
            serverSelectionTimeoutMS: 30000,
        });

        console.log("✅ Connected to MongoDB Atlas");

        server.listen(8000, () => {
            console.log("🚀 Server running on http://localhost:8000");
        });

    } catch (err) {

        console.error("❌ DATABASE CONNECTION FAILED");
        console.error(err);

    }
}

startServer();