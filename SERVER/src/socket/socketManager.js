import { Server } from "socket.io";
import User from "../models/userModel.js";

import socketAuth from "./socketAuth.js";
import registerMeetingEvents from "./meetingSocket.js";
import registerChatEvents from "./chatSocket.js";
import registerSignalingEvents from "./signalingSocket.js";

let io;

// userId -> Set(socketIds)
const onlineUsers = new Map();

export const initializeSocket = (server) => {

    io = new Server(server, {

        cors: {

            origin: process.env.FRONTEND_URL,

            credentials: true,

        },

    });

    io.use(socketAuth);

    io.on("connection", async(socket) => {

        try {

            const userId = socket.user._id.toString();

            console.log(`${socket.user.username} Connected`);

            // ===========================
            // Add Socket
            // ===========================

            if (!onlineUsers.has(userId)) {

                onlineUsers.set(userId, new Set());

            }

            onlineUsers.get(userId).add(socket.id);

            // First Connection
            if (onlineUsers.get(userId).size === 1) {

                await User.findByIdAndUpdate(userId, {

                    isOnline: true,

                });

                io.emit("user-online", {

                    userId,

                    username: socket.user.username,

                });

            }

            // Register Socket Modules

            registerMeetingEvents(io, socket);
            registerChatEvents(io, socket);
            registerSignalingEvents(io, socket);

            // ===========================
            // Disconnect
            // ===========================

            socket.on("disconnect", async() => {

                console.log(`${socket.user.username} Disconnected`);

                const sockets = onlineUsers.get(userId);

                if (sockets) {

                    sockets.delete(socket.id);

                    if (sockets.size === 0) {

                        onlineUsers.delete(userId);

                        const lastSeen = new Date();

                        await User.findByIdAndUpdate(userId, {

                            isOnline: false,

                            lastSeen,

                        });

                        io.emit("user-offline", {

                            userId,

                            lastSeen,

                        });

                    }

                }

            });

        } catch (error) {

            console.log(error);

        }

    });

};

export const getIO = () => io;

export const isUserOnline = (userId) => {

    return onlineUsers.has(userId.toString());

};

export const getOnlineUsers = () => {

    return [...onlineUsers.keys()];

};

export const getUserSockets = (userId) => {

    return onlineUsers.get(userId.toString()) || new Set();

};