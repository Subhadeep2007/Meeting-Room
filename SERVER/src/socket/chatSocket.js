const registerChatEvents = (io, socket) => {

    // ===========================
    // Send Message
    // ===========================

    socket.on("send-message", ({ meetingCode, message }) => {

        if (!meetingCode || !message) return;

        io.to(meetingCode).emit("receive-message", {

            sender: {
                id: socket.user._id,
                username: socket.user.username,
                profilePicture: socket.user.profilePicture,
            },

            message,

            createdAt: new Date(),

        });

    });

    // ===========================
    // Typing Start
    // ===========================

    socket.on("typing", ({ meetingCode }) => {

        socket.to(meetingCode).emit("user-typing", {

            userId: socket.user._id,

            username: socket.user.username,

        });

    });

    // ===========================
    // Typing Stop
    // ===========================

    socket.on("stop-typing", ({ meetingCode }) => {

        socket.to(meetingCode).emit("user-stop-typing", {

            userId: socket.user._id,

        });

    });

};

export default registerChatEvents;