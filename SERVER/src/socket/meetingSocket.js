const meetingUsers = new Map();

const registerMeetingEvents = (io, socket) => {

    // =========================================
    // JOIN ROOM
    // =========================================

    socket.on("join-room", ({ meetingCode }) => {

        if (!meetingCode) return;

        socket.join(meetingCode);

        // Create room if not exists
        if (!meetingUsers.has(meetingCode)) {
            meetingUsers.set(meetingCode, []);
        }

        const users = meetingUsers.get(meetingCode);

        // Prevent duplicate socket entry
        const exists = users.find(
            (user) => user.socketId === socket.id
        );

        if (!exists) {

            users.push({

                socketId: socket.id,

                userId: socket.user._id,

                username: socket.user.username,

                profilePicture: socket.user.profilePicture,

            });

        }

        console.log(
            `${socket.user.username} joined ${meetingCode}`
        );

        // Send existing users except current user
        const existingUsers = users.filter(
            (user) => user.socketId !== socket.id
        );

        socket.emit(
            "existing-users",
            existingUsers
        );

        // Notify others
        socket.to(meetingCode).emit(
            "user-joined", {

                socketId: socket.id,

                userId: socket.user._id,

                username: socket.user.username,

                profilePicture: socket.user.profilePicture,

            }
        );

        // Update room count
        io.to(meetingCode).emit(
            "room-users-count",
            users.length
        );

    });

    // =========================================
    // LEAVE ROOM
    // =========================================

    socket.on("leave-room", ({ meetingCode }) => {

        if (!meetingCode) return;

        socket.leave(meetingCode);

        const users = meetingUsers.get(meetingCode);

        if (users) {

            const updatedUsers = users.filter(
                (user) => user.socketId !== socket.id
            );

            if (updatedUsers.length === 0) {

                meetingUsers.delete(meetingCode);

            } else {

                meetingUsers.set(
                    meetingCode,
                    updatedUsers
                );

            }

        }

        socket.to(meetingCode).emit(
            "user-left", {

                socketId: socket.id,

                userId: socket.user._id,

                username: socket.user.username,

            }
        );

        const roomUsers = meetingUsers.get(meetingCode);

        const onlineUsers = roomUsers ?
            roomUsers.length :
            0;

        io.to(meetingCode).emit(
            "room-users-count",
            onlineUsers
        );

    });

    // =========================================
    // DISCONNECT
    // =========================================

    socket.on("disconnecting", () => {

        socket.rooms.forEach((room) => {

            if (room === socket.id) return;

            const users = meetingUsers.get(room);

            if (!users) return;

            const updatedUsers = users.filter(
                (user) => user.socketId !== socket.id
            );

            if (updatedUsers.length === 0) {

                meetingUsers.delete(room);

            } else {

                meetingUsers.set(
                    room,
                    updatedUsers
                );

            }

            socket.to(room).emit(
                "user-left", {

                    socketId: socket.id,

                    userId: socket.user._id,

                    username: socket.user.username,

                }
            );

            io.to(room).emit(
                "room-users-count",
                updatedUsers.length
            );

        });

        console.log(
            `${socket.user.username} disconnected`
        );

    });

};

export default registerMeetingEvents;