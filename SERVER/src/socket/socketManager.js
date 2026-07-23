import { Server } from "socket.io";
import socketAuth from "./socketAuth.js";
import registerMeetingEvents from "./meetingSocket.js";
import registerChatEvents from "./chatSocket.js";
import registerSignalingEvents from "./signalingSocket.js";


let io;

export const initializeSocket = (server) => {

    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    });

    // Authentication Middleware
    io.use(socketAuth);

    io.on("connection", (socket) => {

        console.log(
            `${socket.user.username} Connected`
        );

        registerMeetingEvents(io, socket);
        registerChatEvents(io, socket);
        registerSignalingEvents(io, socket);

        socket.on("disconnect", () => {

            console.log(
                `${socket.user.username} Disconnected`
            );

        });

    });

};

export const getIO = () => io;