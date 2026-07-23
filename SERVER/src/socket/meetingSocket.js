const registerMeetingEvents = (io, socket) => {

    // =========================================
    // Join Room
    // =========================================
    socket.on("join-room", ({ meetingCode }) => {

        socket.join(meetingCode);

        console.log(
            `${socket.user.username} joined ${meetingCode}`
        );

        // Notify Other Users
        socket.to(meetingCode).emit("user-joined", {

            userId: socket.user._id,

            username: socket.user.username,

            meetingCode,

        });

        // Update Online Users Count
        const room = io.sockets.adapter.rooms.get(meetingCode);

        const onlineUsers = room ? room.size : 0;

        io.to(meetingCode).emit(

            "room-users-count",

            onlineUsers

        );

    });

    // =========================================
    // Leave Room
    // =========================================
    socket.on("leave-room", ({ meetingCode }) => {

        socket.leave(meetingCode);

        console.log(
            `${socket.user.username} left ${meetingCode}`
        );

        // Notify Other Users
        socket.to(meetingCode).emit("user-left", {

            userId: socket.user._id,

            username: socket.user.username,

        });

        // Update Online Users Count
        const room = io.sockets.adapter.rooms.get(meetingCode);

        const onlineUsers = room ? room.size : 0;

        io.to(meetingCode).emit(

            "room-users-count",

            onlineUsers

        );

    });

    // =========================================
    // Disconnect Automatically
    // =========================================
    socket.on("disconnecting", () => {

        console.log(`${socket.user.username} disconnected`);

        socket.rooms.forEach((room) => {

            // socket.id wala room ignore karo
            if (room === socket.id) return;

            // Notify Other Users
            socket.to(room).emit("user-left", {

                userId: socket.user._id,

                username: socket.user.username,

            });

            // Update Online Users Count
            const users = io.sockets.adapter.rooms.get(room);

            const onlineUsers = users ? users.size - 1 : 0;

            io.to(room).emit(

                "room-users-count",

                onlineUsers

            );

        });

    });

};

export default registerMeetingEvents;