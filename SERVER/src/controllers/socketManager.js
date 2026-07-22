import { Server } from "socket.io";


export const connectToSocket = (server) => { // Socket.IO
    const io = new Server(server, {
        cors: {
            origin: "*", // Baad me client URL de dena
            methods: ["GET", "POST"],
        },
    });
}