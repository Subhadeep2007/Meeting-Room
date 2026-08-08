import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;

const token = localStorage.getItem("token");

export const socket = io(SOCKET_URL, {

    autoConnect: false,

    withCredentials: true,

    transports: ["websocket"],

    auth: {

        token,

    },

});

export const connectSocket = () => {

    socket.auth = {

        token: localStorage.getItem("token"),

    };

    if (!socket.connected) {

        socket.connect();

    }

};

export const disconnectSocket = () => {

    if (socket.connected) {

        socket.disconnect();

    }

};

export default socket;