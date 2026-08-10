const meetingUsers = new Map();
const waitingUsers = new Map();
import Meeting from "../models/meetingModel.js";

const registerMeetingEvents = (io, socket) => {


    // =========================================
    // JOIN ROOM
    // =========================================

    socket.on("join-room", async({ meetingCode }) => {

        if (!meetingCode) return;


        meetingCode = meetingCode.toUpperCase();


        const meeting = await Meeting.findOne({
            meetingCode: meetingCode.toUpperCase(),
        });

        if (!meeting) {
            return;
        }

        const isHost =
            meeting.host.toString() ===
            socket.user._id.toString();
        // =====================================
        // Locked Meeting
        // =====================================

        if (meeting.locked && !isHost) {

            console.log(
                `⏳ ${socket.user.username} is requesting to join ${meetingCode}`
            );

            console.log(
                "ROOM USERS AFTER JOIN:",
                meetingCode,
                meetingUsers.get(meetingCode)
            );

            // =====================================
            // Add User To Database Waiting Room
            // =====================================

            const alreadyWaiting =
                meeting.waitingUsers.some(
                    (userId) =>
                    userId.toString() ===
                    socket.user._id.toString()
                );

            if (!alreadyWaiting) {

                meeting.waitingUsers.push(
                    socket.user._id
                );

                await meeting.save();
            }

            // =====================================
            // Store Waiting User Socket
            // =====================================

            waitingUsers.set(
                socket.user._id.toString(), {
                    socketId: socket.id,
                    meetingCode: meeting.meetingCode,
                }
            );

            console.log(
                "⏳ Waiting User Stored:",
                socket.user.username,
                socket.id
            );

            // =====================================
            // Find Host
            // =====================================

            const roomUsers =
                meetingUsers.get(meetingCode) || [];

            const host = roomUsers.find(
                (user) =>
                user.userId.toString() ===
                meeting.host.toString()
            );

            // =====================================
            // Notify Host
            // =====================================

            if (host) {

                console.log("✅ HOST FOUND");
                console.log("Host Username:", host.username);
                console.log("Host Socket ID:", host.socketId);

                io.to(host.socketId).emit(
                    "waiting-user", {
                        userId: socket.user._id.toString(),
                        socketId: socket.id,
                        username: socket.user.username,
                        profilePicture: socket.user.profilePicture,
                    }
                );

                console.log(
                    "✅ waiting-user EVENT SENT TO HOST"
                );

            } else {

                console.log(
                    "❌ HOST NOT FOUND"
                );

                console.log(
                    "Meeting Code:",
                    meetingCode
                );

                console.log(
                    "Current Meeting Users:",
                    meetingUsers.get(meetingCode)
                );
            }

            // =====================================
            // Tell Current User
            // =====================================

            socket.emit(
                "meeting-locked", {
                    meetingCode,
                    message: "Meeting is locked. Please wait for Host approval.",
                }
            );

            return;
        }

        // =====================================
        // Join Socket Room
        // =====================================

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


    socket.on(
        "approve-user",
        async({ meetingId, userId }, callback) => {

            try {

                if (!meetingId || !userId) {

                    if (callback) {
                        callback({
                            success: false,
                            message: "Meeting Code and User ID are required",
                        });
                    }

                    return;
                }

                // =====================================
                // Find Meeting By Meeting Code
                // =====================================

                const meeting = await Meeting.findOne({
                    meetingCode: meetingId.toUpperCase(),
                });

                if (!meeting) {

                    if (callback) {
                        callback({
                            success: false,
                            message: "Meeting Not Found",
                        });
                    }

                    return;
                }

                // =====================================
                // Host Authorization
                // =====================================

                if (
                    meeting.host.toString() !==
                    socket.user._id.toString()
                ) {

                    if (callback) {
                        callback({
                            success: false,
                            message: "Only Host Can Approve Users",
                        });
                    }

                    return;
                }

                // =====================================
                // Check Waiting User
                // =====================================

                const waitingUser =
                    meeting.waitingUsers.find(
                        (id) =>
                        id.toString() ===
                        userId.toString()
                    );

                if (!waitingUser) {

                    if (callback) {
                        callback({
                            success: false,
                            message: "User is not in Waiting Room",
                        });
                    }

                    return;
                }

                // =====================================
                // Remove From Waiting Room
                // =====================================

                meeting.waitingUsers =
                    meeting.waitingUsers.filter(
                        (id) =>
                        id.toString() !==
                        userId.toString()
                    );

                // =====================================
                // Add To Participants
                // =====================================

                const alreadyParticipant =
                    meeting.participants.some(
                        (id) =>
                        id.toString() ===
                        userId.toString()
                    );

                if (!alreadyParticipant) {

                    meeting.participants.push(userId);

                }

                await meeting.save();

                // =====================================
                // Find Waiting User Socket
                // =====================================

                const approvedUser =
                    waitingUsers.get(
                        userId.toString()
                    );

                console.log(
                    "✅ Approved User Socket:",
                    approvedUser
                );

                // =====================================
                // Notify Approved User
                // =====================================

                if (approvedUser) {

                    io.to(approvedUser.socketId).emit(
                        "user-approved", {
                            userId,
                            socketId: approvedUser.socketId,
                            meetingCode: meeting.meetingCode,
                        }
                    );

                    waitingUsers.delete(
                        userId.toString()
                    );

                }

                // =====================================
                // Remove From Host Waiting List
                // =====================================

                socket.emit(
                    "waiting-user-removed", {
                        userId,
                    }
                );

                // =====================================
                // Response
                // =====================================

                if (callback) {

                    callback({
                        success: true,
                        message: "User Approved Successfully",
                    });

                }

            } catch (error) {

                console.error(
                    "Approve User Error:",
                    error
                );

                if (callback) {

                    callback({
                        success: false,
                        message: "Internal Server Error",
                    });

                }

            }

        }
    );






    socket.on(
        "reject-user",
        async({ meetingId, userId }, callback) => {

            try {

                if (!meetingId || !userId) {

                    if (callback) {
                        callback({
                            success: false,
                            message: "Meeting Code and User ID are required",
                        });
                    }

                    return;
                }

                // =====================================
                // Find Meeting By Meeting Code
                // =====================================

                const meeting = await Meeting.findOne({
                    meetingCode: meetingId.toUpperCase(),
                });

                if (!meeting) {

                    if (callback) {
                        callback({
                            success: false,
                            message: "Meeting Not Found",
                        });
                    }

                    return;
                }

                // =====================================
                // Host Authorization
                // =====================================

                if (
                    meeting.host.toString() !==
                    socket.user._id.toString()
                ) {

                    if (callback) {
                        callback({
                            success: false,
                            message: "Only Host Can Reject Users",
                        });
                    }

                    return;
                }

                // =====================================
                // Check Waiting User
                // =====================================

                const isWaiting =
                    meeting.waitingUsers.some(
                        (id) =>
                        id.toString() ===
                        userId.toString()
                    );

                if (!isWaiting) {

                    if (callback) {
                        callback({
                            success: false,
                            message: "User is not in Waiting Room",
                        });
                    }

                    return;
                }

                // =====================================
                // Remove From Waiting Room
                // =====================================

                meeting.waitingUsers =
                    meeting.waitingUsers.filter(
                        (id) =>
                        id.toString() !==
                        userId.toString()
                    );

                await meeting.save();

                // =====================================
                // Find Waiting User Socket
                // =====================================

                const rejectedUser =
                    waitingUsers.get(
                        userId.toString()
                    );

                console.log(
                    "❌ Rejected User Socket:",
                    rejectedUser
                );

                // =====================================
                // Notify Rejected User
                // =====================================

                if (rejectedUser) {

                    io.to(rejectedUser.socketId).emit(
                        "user-rejected", {
                            userId,
                            meetingCode: meeting.meetingCode,
                        }
                    );

                    waitingUsers.delete(
                        userId.toString()
                    );

                }

                // =====================================
                // Remove From Host Waiting List
                // =====================================

                socket.emit(
                    "waiting-user-removed", {
                        userId,
                    }
                );

                // =====================================
                // Response
                // =====================================

                if (callback) {

                    callback({
                        success: true,
                        message: "User Rejected Successfully",
                    });

                }

            } catch (error) {

                console.error(
                    "Reject User Error:",
                    error
                );

                if (callback) {

                    callback({
                        success: false,
                        message: "Internal Server Error",
                    });

                }

            }

        }
    );



    socket.on(
        "lock-meeting",
        async({ meetingId, locked }) => {

            try {

                if (!meetingId) {
                    return;
                }

                const meeting = await Meeting.findOne({
                    meetingCode: meetingId.toUpperCase(),
                });

                if (!meeting) {
                    return;
                }

                // =====================================
                // Host Authorization
                // =====================================

                if (
                    meeting.host.toString() !==
                    socket.user._id.toString()
                ) {

                    socket.emit(
                        "meeting-lock-error", {
                            message: "Only Host Can Lock Meeting",
                        }
                    );

                    return;
                }

                // =====================================
                // Update Lock Status
                // =====================================

                meeting.locked = Boolean(locked);

                await meeting.save();

                console.log(
                    `Meeting ${meeting.meetingCode} ${
                    meeting.locked
                        ? "locked"
                        : "unlocked"
                } by ${socket.user.username}`
                );

                // =====================================
                // Notify Users
                // =====================================

                io.to(meeting.meetingCode).emit(
                    "meeting-lock-status", {
                        meetingCode: meeting.meetingCode,

                        locked: meeting.locked,
                    }
                );

            } catch (error) {

                console.error(
                    "Lock Meeting Error:",
                    error
                );

            }

        }
    );

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