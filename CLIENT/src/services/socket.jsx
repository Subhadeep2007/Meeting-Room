import { io } from "socket.io-client";

// ===============================
// Socket URL
// ===============================

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;

// ===============================
// Create Socket
// ===============================

export const socket = io(SOCKET_URL, {

    autoConnect: false,

    withCredentials: true,

    transports: ["websocket"],

});

// ===============================
// Connect
// ===============================

export const connectSocket = () => {

    if (!socket.connected) {

        socket.connect();

    }

};

// ===============================
// Disconnect
// ===============================

export const disconnectSocket = () => {

    if (socket.connected) {

        socket.disconnect();

    }

};

// ===============================
// Export
// ===============================

export default socket;