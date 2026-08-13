const meetingUsers = new Map();

const waitingUsers = new Map();

import Meeting from "../models/meetingModel.js";


// =========================================
// REGISTER MEETING EVENTS
// =========================================

const registerMeetingEvents = (io, socket) => {


    // =========================================
    // JOIN ROOM
    // =========================================

    socket.on(
        "join-room",
        async({
                meetingCode,
            } = {},
            callback
        ) => {

            try {

                // =====================================
                // Validation
                // =====================================

                if (!meetingCode) {

                    if (callback) {

                        callback({
                            success: false,
                            message: "Meeting code is required",
                        });

                    }

                    return;
                }


                const normalizedCode =
                    meetingCode
                    .trim()
                    .toUpperCase();


                // =====================================
                // Find Meeting
                // =====================================

                const meeting =
                    await Meeting.findOne({
                        meetingCode: normalizedCode,
                    });


                if (!meeting) {

                    if (callback) {

                        callback({
                            success: false,
                            message: "Meeting not found",
                        });

                    }

                    return;
                }

                // =====================================
                // CHECK KICKED USER
                // =====================================

                const kickedUser =
                    await Meeting.collection.findOne({
                        _id: meeting._id,

                        kickedUsers: socket.user._id,
                    });

                if (kickedUser) {

                    console.log(
                        `🚫 ${socket.user.username} was kicked and cannot rejoin ${normalizedCode}`
                    );

                    // Do NOT allow socket to enter meeting

                    if (callback) {

                        callback({

                            success: false,

                            message: "You were removed by Host and cannot rejoin this meeting",

                        });

                    }

                    // Tell frontend to leave/redirect

                    socket.emit(
                        "kicked", {
                            success: false,

                            message: "You were removed by Host and cannot rejoin this meeting",

                        }
                    );

                    return;
                }

                // =====================================
                // Meeting Ended
                // =====================================

                if (
                    meeting.status ===
                    "ended"
                ) {

                    if (callback) {

                        callback({
                            success: false,
                            message: "Meeting has ended",
                        });

                    }

                    return;
                }


                // =====================================
                // Host Check
                // =====================================

                const isHost =
                    meeting.host
                    .toString() ===
                    socket.user._id.toString();
                const isParticipant =
                    meeting.participants.some(
                        (userId) =>
                        userId.toString() ===
                        socket.user._id.toString()
                    );

                // =====================================
                // Locked Meeting
                // =====================================

                if (
                    meeting.locked &&
                    !isHost &&
                    !isParticipant
                ) {

                    console.log(
                        `⏳ ${socket.user.username} is requesting to join ${normalizedCode}`
                    );


                    // =====================================
                    // Check Already Waiting
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

                            meetingCode: normalizedCode,
                        }
                    );


                    // =====================================
                    // Find Host
                    // =====================================

                    const roomUsers =
                        meetingUsers.get(
                            normalizedCode
                        ) || [];


                    const host =
                        roomUsers.find(
                            (user) =>
                            user.userId.toString() ===
                            meeting.host.toString()
                        );


                    // =====================================
                    // Notify Host
                    // =====================================

                    if (host) {

                        io.to(
                            host.socketId
                        ).emit(
                            "waiting-user", {

                                userId: socket.user._id.toString(),

                                socketId: socket.id,

                                username: socket.user.username,

                                profilePicture: socket.user.profilePicture,

                            }
                        );

                    }


                    // =====================================
                    // Notify Waiting User
                    // =====================================

                    socket.emit(
                        "meeting-locked", {

                            meetingCode: normalizedCode,

                            message: "Meeting is locked. Please wait for Host approval.",

                        }
                    );


                    if (callback) {

                        callback({

                            success: true,

                            waiting: true,

                            message: "Waiting for Host approval",

                            meetingCode: normalizedCode,

                        });

                    }


                    return;
                }


                // =====================================
                // Join Socket Room
                // =====================================

                socket.join(
                    normalizedCode
                );


                // =====================================
                // Create Room User List
                // =====================================

                if (!meetingUsers.has(
                        normalizedCode
                    )) {

                    meetingUsers.set(
                        normalizedCode, []
                    );

                }


                const users =
                    meetingUsers.get(
                        normalizedCode
                    );


                // =====================================
                // Prevent Duplicate Socket
                // =====================================

                const exists =
                    users.find(
                        (user) =>
                        user.socketId ===
                        socket.id
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
                    `${socket.user.username} joined ${normalizedCode}`
                );


                // =====================================
                // Existing Users
                // =====================================

                const existingUsers =
                    users.filter(
                        (user) =>
                        user.socketId !==
                        socket.id
                    );
                const waitingUsersList =
                    await Meeting.findById(
                        meeting._id
                    )
                    .populate(
                        "waitingUsers",
                        "name username profilePicture"
                    )
                    .select(
                        "waitingUsers host"
                    )
                    .lean();
                // =====================================
                // SEND WAITING USERS TO HOST
                // =====================================

                if (isHost) {

                    let waitingList = [];

                    if (
                        waitingUsersList &&
                        waitingUsersList.waitingUsers
                    ) {

                        waitingList =
                            waitingUsersList.waitingUsers.map(
                                (user) => ({

                                    userId: user._id.toString(),

                                    username: user.username,

                                    profilePicture: user.profilePicture,

                                })
                            );

                    }

                    socket.emit(
                        "existing-waiting-users",
                        waitingList
                    );

                }
                // =====================================
                // Tell Current User
                // =====================================

                socket.emit(
                    "meeting-user-info", {

                        socketId: socket.id,

                        userId: socket.user._id,
                        username: socket.user.username,
                        profilePicture: socket.user.profilePicture,
                        isHost,
                        hostId: meeting.host,

                        users: existingUsers,

                    }
                );


                // =====================================
                // Notify Existing Users
                // =====================================

                socket
                    .to(normalizedCode)
                    .emit(
                        "user-joined", {

                            socketId: socket.id,

                            userId: socket.user._id,

                            username: socket.user.username,

                            profilePicture: socket.user.profilePicture,

                            isHost,

                        }
                    );


                // =====================================
                // Room Users Count
                // =====================================

                io.to(
                    normalizedCode
                ).emit(
                    "room-users-count",
                    users.length
                );


                io.emit(
                    "meeting-participant-count", {

                        meetingCode: normalizedCode,

                        count: users.length,

                    }
                );


                // =====================================
                // ACK
                // =====================================

                if (callback) {

                    callback({

                        success: true,

                        waiting: false,

                        meetingCode: normalizedCode,

                        socketId: socket.id,

                        userId: socket.user._id,

                        isHost,

                        users: users.length,

                        message: "Joined meeting successfully",

                    });

                }


            } catch (error) {

                console.error(
                    "Join Room Error:",
                    error
                );


                if (callback) {

                    callback({

                        success: false,

                        message: "Failed to join meeting",

                    });

                }

            }

        }
    );


    // =========================================
    // LEAVE ROOM
    // =========================================

    socket.on("leave-room", async({ meetingCode }) => {

        if (!meetingCode) return;

        meetingCode = meetingCode.toUpperCase();

        socket.leave(meetingCode);

        // =========================================
        // IMPORTANT
        // Do NOT remove user from participants
        // participants = meeting membership
        // meetingUsers = currently online users
        // =========================================

        const users = meetingUsers.get(meetingCode);

        if (users) {

            const updatedUsers = users.filter(
                (user) =>
                user.socketId !== socket.id
            );

            if (updatedUsers.length === 0) {

                meetingUsers.delete(
                    meetingCode
                );

            } else {

                meetingUsers.set(
                    meetingCode,
                    updatedUsers
                );

            }

        }

        // =========================================
        // Notify remaining users
        // =========================================

        socket.to(meetingCode).emit(
            "user-left", {
                socketId: socket.id,

                userId: socket.user._id,

                username: socket.user.username,
            }
        );

        // =========================================
        // Update Online Count
        // =========================================

        const roomUsers =
            meetingUsers.get(meetingCode);

        const onlineUsers =
            roomUsers ?
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
    // APPROVE USER
    // =========================================

    socket.on(
        "approve-user",
        async({
                meetingId,
                userId,
            } = {},
            callback
        ) => {

            try {

                if (!meetingId ||
                    !userId
                ) {

                    if (callback) {

                        callback({

                            success: false,

                            message: "Meeting Code and User ID are required",

                        });

                    }

                    return;
                }


                const meeting =
                    await Meeting.findOne({

                        meetingCode: meetingId
                            .trim()
                            .toUpperCase(),

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
                // Remove Waiting User
                // =====================================

                meeting.waitingUsers =
                    meeting.waitingUsers.filter(
                        (id) =>
                        id.toString() !==
                        userId.toString()
                    );


                // =====================================
                // Add Participant
                // =====================================

                const alreadyParticipant =
                    meeting.participants.some(
                        (id) =>
                        id.toString() ===
                        userId.toString()
                    );


                if (!alreadyParticipant) {

                    meeting.participants.push(
                        userId
                    );

                }


                await meeting.save();


                // =====================================
                // Find Waiting Socket
                // =====================================

                const approvedUser =
                    waitingUsers.get(
                        userId.toString()
                    );

                console.log("APPROVE DEBUG:", {
                    userId: userId.toString(),
                    approvedUser,
                    waitingMapKeys: [...waitingUsers.keys()],
                });


                if (approvedUser) {

                    io.to(
                        approvedUser.socketId
                    ).emit(
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
                // Remove Host Waiting List
                // =====================================

                socket.emit(
                    "waiting-user-removed", {
                        userId,
                    }
                );


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


    // =========================================
    // REJECT USER
    // =========================================

    socket.on(
        "reject-user",
        async({
                meetingId,
                userId,
            } = {},
            callback
        ) => {

            try {

                if (!meetingId ||
                    !userId
                ) {

                    if (callback) {

                        callback({

                            success: false,

                            message: "Meeting Code and User ID are required",

                        });

                    }

                    return;
                }


                const meeting =
                    await Meeting.findOne({

                        meetingCode: meetingId
                            .trim()
                            .toUpperCase(),

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
                // Remove Waiting User
                // =====================================

                meeting.waitingUsers =
                    meeting.waitingUsers.filter(
                        (id) =>
                        id.toString() !==
                        userId.toString()
                    );


                await meeting.save();


                // =====================================
                // Find Socket
                // =====================================

                const rejectedUser =
                    waitingUsers.get(
                        userId.toString()
                    );


                if (rejectedUser) {

                    io.to(
                        rejectedUser.socketId
                    ).emit(
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
                // Remove Host Waiting List
                // =====================================

                socket.emit(
                    "waiting-user-removed", {
                        userId,
                    }
                );


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


    // =========================================
    // LOCK / UNLOCK MEETING
    // =========================================

    socket.on(
        "lock-meeting",
        async({
                meetingId,
                locked,
            } = {},
            callback
        ) => {

            try {

                if (!meetingId) {

                    if (callback) {

                        callback({

                            success: false,

                            message: "Meeting ID is required",

                        });

                    }

                    return;
                }


                const meeting =
                    await Meeting.findOne({

                        meetingCode: meetingId
                            .trim()
                            .toUpperCase(),

                    });


                if (!meeting) {

                    if (callback) {

                        callback({

                            success: false,

                            message: "Meeting not found",

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

                    socket.emit(
                        "meeting-lock-error", {

                            message: "Only Host Can Lock Meeting",

                        }
                    );


                    if (callback) {

                        callback({

                            success: false,

                            message: "Only Host Can Lock Meeting",

                        });

                    }

                    return;
                }


                meeting.locked =
                    Boolean(locked);


                await meeting.save();


                io.to(
                    meeting.meetingCode
                ).emit(
                    "meeting-lock-status", {

                        meetingCode: meeting.meetingCode,

                        locked: meeting.locked,

                    }
                );


                if (callback) {

                    callback({

                        success: true,

                        locked: meeting.locked,

                        message: meeting.locked ?
                            "Meeting locked" : "Meeting unlocked",

                    });

                }


            } catch (error) {

                console.error(
                    "Lock Meeting Error:",
                    error
                );


                if (callback) {

                    callback({

                        success: false,

                        message: "Failed to update meeting lock",

                    });

                }

            }

        }
    );


    // =========================================
    // CHAT ENCRYPTION
    // PUBLIC KEY
    // =========================================

    socket.on(
        "publish-chat-public-key",
        async({
                meetingCode,
                publicKey,
            } = {},
            callback
        ) => {

            try {

                if (!meetingCode ||
                    !publicKey
                ) {

                    if (callback) {

                        callback({

                            success: false,

                            message: "Meeting code and public key are required",

                        });

                    }

                    return;
                }


                const normalizedCode =
                    meetingCode
                    .trim()
                    .toUpperCase();


                // =====================================
                // Socket Must Be In Room
                // =====================================

                if (!socket.rooms.has(
                        normalizedCode
                    )) {

                    if (callback) {

                        callback({

                            success: false,

                            message: "You are not inside this meeting",

                        });

                    }

                    return;
                }


                // =====================================
                // Find Meeting
                // =====================================

                const meeting =
                    await Meeting.findOne({

                        meetingCode: normalizedCode,

                    });


                if (!meeting) {

                    if (callback) {

                        callback({

                            success: false,

                            message: "Meeting not found",

                        });

                    }

                    return;
                }


                // =====================================
                // Authorization
                // Host OR Participant
                // =====================================

                const userId =
                    socket.user._id.toString();


                const isParticipant =
                    meeting.participants.some(
                        (id) =>
                        id.toString() ===
                        userId
                    );


                const isHost =
                    meeting.host.toString() ===
                    userId;


                if (!isParticipant &&
                    !isHost
                ) {

                    if (callback) {

                        callback({

                            success: false,

                            message: "You are not a member of this meeting",

                        });

                    }

                    return;
                }


                // =====================================
                // Broadcast Public Key
                // =====================================

                socket
                    .to(normalizedCode)
                    .emit(
                        "chat-public-key", {

                            userId,

                            username: socket.user.username,

                            publicKey,

                        }
                    );


                console.log(
                    "🔐 Chat public key published:",
                    socket.user.username
                );


                if (callback) {

                    callback({

                        success: true,

                        message: "Public key published",

                    });

                }


            } catch (error) {

                console.error(
                    "Publish Chat Public Key Error:",
                    error
                );


                if (callback) {

                    callback({

                        success: false,

                        message: "Failed to publish public key",

                    });

                }

            }

        }
    );


    // =========================================
    // REQUEST CHAT ENCRYPTION KEY
    //
    // IMPORTANT:
    // NOT HOST ONLY
    //
    // Ask ALL existing online users.
    // Whoever has AES key can respond.
    // =========================================

    socket.on(
        "request-chat-encryption-key",
        async({
                meetingCode,
                publicKey,
            } = {},
            callback
        ) => {


            try {

                if (!meetingCode || !publicKey) {

                    if (callback) {

                        callback({

                            success: false,

                            message: "Meeting code is required",

                        });

                    }

                    return;
                }


                const normalizedCode =
                    meetingCode
                    .trim()
                    .toUpperCase();


                // =====================================
                // Find Meeting
                // =====================================

                const meeting =
                    await Meeting.findOne({

                        meetingCode: normalizedCode,

                    });


                if (!meeting) {

                    if (callback) {

                        callback({

                            success: false,

                            message: "Meeting not found",

                        });

                    }

                    return;
                }


                // =====================================
                // Current User Authorization
                //
                // Host OR Participant
                // =====================================

                const requesterId =
                    socket.user._id.toString();


                const requesterIsParticipant =
                    meeting.participants.some(
                        (id) =>
                        id.toString() ===
                        requesterId
                    );


                const requesterIsHost =
                    meeting.host.toString() ===
                    requesterId;


                if (!requesterIsParticipant &&
                    !requesterIsHost
                ) {

                    if (callback) {

                        callback({

                            success: false,

                            message: "You are not a member of this meeting",

                        });

                    }

                    return;
                }


                // =====================================
                // Get Online Users
                // =====================================

                const users =
                    meetingUsers.get(
                        normalizedCode
                    ) || [];


                // =====================================
                // Ask Every Existing User
                //
                // NOT ONLY HOST
                // =====================================

                let requestedUsers = 0;


                users.forEach(
                    (user) => {

                        // Don't ask yourself
                        if (
                            user.socketId ===
                            socket.id
                        ) {

                            return;

                        }


                        requestedUsers++;


                        io.to(
                            user.socketId
                        ).emit(
                            "chat-key-request", {

                                meetingCode: normalizedCode,

                                userId: requesterId,

                                socketId: socket.id,
                                publicKey,

                            }
                        );

                    }
                );


                console.log(
                    "🔐 Chat key requested from:",
                    requestedUsers,
                    "existing users"
                );


                if (callback) {

                    callback({

                        success: true,

                        requestedUsers,

                        message: "Chat encryption key requested",

                    });

                }


            } catch (error) {

                console.error(
                    "Request Chat Key Error:",
                    error
                );


                if (callback) {

                    callback({

                        success: false,

                        message: "Failed to request chat key",

                    });

                }

            }

        }
    );


    // =========================================
    // SEND ENCRYPTED CHAT KEY
    //
    // IMPORTANT:
    // HOST OR PARTICIPANT CAN SEND KEY
    // =========================================

    socket.on(
        "send-encrypted-chat-key",
        async({
                meetingCode,
                userId,
                encryptedMeetingKey,
            } = {},
            callback
        ) => {

            try {

                // =====================================
                // Validation
                // =====================================

                if (!meetingCode ||
                    !userId ||
                    !encryptedMeetingKey
                ) {

                    if (callback) {

                        callback({

                            success: false,

                            message: "Meeting code, user ID and encrypted key are required",

                        });

                    }

                    return;
                }


                const normalizedCode =
                    meetingCode
                    .trim()
                    .toUpperCase();


                // =====================================
                // Find Meeting
                // =====================================

                const meeting =
                    await Meeting.findOne({

                        meetingCode: normalizedCode,

                    });


                if (!meeting) {

                    if (callback) {

                        callback({

                            success: false,

                            message: "Meeting not found",

                        });

                    }

                    return;
                }


                // =====================================
                // SENDER AUTHORIZATION
                //
                // Host OR Participant
                //
                // THIS IS THE MAIN FIX
                // =====================================

                const senderUserId =
                    socket.user._id.toString();


                const senderIsParticipant =
                    meeting.participants.some(
                        (id) =>
                        id.toString() ===
                        senderUserId
                    );


                const senderIsHost =
                    meeting.host.toString() ===
                    senderUserId;


                if (!senderIsParticipant &&
                    !senderIsHost
                ) {

                    if (callback) {

                        callback({

                            success: false,

                            message: "You are not a member of this meeting",

                        });

                    }

                    return;
                }


                // =====================================
                // TARGET AUTHORIZATION
                //
                // Target must belong to meeting
                // =====================================

                const targetIsParticipant =
                    meeting.participants.some(
                        (id) =>
                        id.toString() ===
                        userId.toString()
                    );


                const targetIsHost =
                    meeting.host.toString() ===
                    userId.toString();


                if (!targetIsParticipant &&
                    !targetIsHost
                ) {

                    if (callback) {

                        callback({

                            success: false,

                            message: "Target user is not a member of this meeting",

                        });

                    }

                    return;
                }


                // =====================================
                // Find Target Online User
                // =====================================

                const users =
                    meetingUsers.get(
                        normalizedCode
                    ) || [];


                const targetUser =
                    users.find(
                        (user) =>
                        user.userId.toString() ===
                        userId.toString()
                    );


                if (!targetUser) {

                    if (callback) {

                        callback({

                            success: false,

                            message: "Target user is not online",

                        });

                    }

                    return;
                }


                // =====================================
                // Send Encrypted AES Key
                // =====================================

                io.to(
                    targetUser.socketId
                ).emit(
                    "encrypted-chat-key", {

                        meetingCode: normalizedCode,

                        encryptedMeetingKey,

                    }
                );


                console.log(
                    "🔐 Chat key transferred:",
                    senderUserId,
                    "→",
                    userId
                );


                // =====================================
                // ACK
                // =====================================

                if (callback) {

                    callback({

                        success: true,

                        message: "Encrypted chat key delivered",

                    });

                }


            } catch (error) {

                console.error(
                    "Send Encrypted Chat Key Error:",
                    error
                );


                if (callback) {

                    callback({

                        success: false,

                        message: "Failed to deliver encrypted chat key",

                    });

                }

            }

        }
    );


    // =========================================
    // DISCONNECTING
    // =========================================

    socket.on(
        "disconnecting",
        () => {

            socket.rooms.forEach(
                (room) => {

                    // Socket.IO's private room
                    if (
                        room === socket.id
                    ) {

                        return;

                    }


                    const users =
                        meetingUsers.get(
                            room
                        );


                    if (!users) {

                        return;

                    }


                    const updatedUsers =
                        users.filter(
                            (user) =>
                            user.socketId !==
                            socket.id
                        );


                    if (
                        updatedUsers.length === 0
                    ) {

                        meetingUsers.delete(
                            room
                        );

                    } else {

                        meetingUsers.set(
                            room,
                            updatedUsers
                        );

                    }


                    // =====================================
                    // Notify Remaining Users
                    // =====================================

                    socket
                        .to(room)
                        .emit(
                            "user-left", {

                                socketId: socket.id,

                                userId: socket.user._id,

                                username: socket.user.username,

                            }
                        );


                    // =====================================
                    // Update Count
                    // =====================================

                    io.to(room).emit(
                        "room-users-count",
                        updatedUsers.length
                    );

                }
            );


            console.log(
                `${socket.user.username} disconnected`
            );

        }
    );

};


export default registerMeetingEvents;