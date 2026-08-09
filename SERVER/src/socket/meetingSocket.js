const meetingUsers = new Map();
import Meeting from "../models/meetingModel.js";

const registerMeetingEvents = (io, socket) => {

    const meetingUsers = new Map();

    // =========================================
    // JOIN ROOM
    // =========================================

    socket.on("join-room", async({ meetingCode }) => {

        if (!meetingCode) return;

        socket.join(meetingCode);

        const meeting = await Meeting.findOne({
            meetingCode: meetingCode.toUpperCase(),
        });

        if (!meeting) {
            return;
        }

        const isHost =
            meeting.host.toString() ===
            socket.user._id.toString();

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
                isHost,

            });

        }

        console.log(
            `${socket.user.username} joined ${meetingCode}`
        );

        // Send existing users except current user
        const existingUsers = users.filter(
            (user) => user.socketId !== socket.id
        );
        console.log("MEETING USER INFO SENDING:", {
            socketId: socket.id,
            userId: socket.user._id.toString(),
            isHost,
        });
        socket.emit(
            "meeting-user-info", {
                socketId: socket.id,
                userId: socket.user._id,
                isHost,
            }
        );

        // Notify others
        socket.to(meetingCode).emit(
            "user-joined", {

                socketId: socket.id,

                userId: socket.user._id,

                username: socket.user.username,

                profilePicture: socket.user.profilePicture,
                isHost,
            }
        );

        // Update room count
        io.to(meetingCode).emit(
            "room-users-count",
            users.length
        );
        io.emit(
            "meeting-participant-count", {
                meetingCode,
                count: users.length,
            }
        );

    });

    // =========================================
    // LEAVE ROOM
    // =========================================

    socket.on("leave-room", async({ meetingCode }) => {

        if (!meetingCode) return;

        socket.leave(meetingCode);
        await Meeting.findOneAndUpdate({
            meetingCode,
        }, {
            $pull: {
                participants: socket.user._id,
            },
        });
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
        io.emit(
            "meeting-participant-count", {
                meetingCode,
                count: onlineUsers,
            }
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