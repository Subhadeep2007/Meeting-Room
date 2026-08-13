import { SOCKET_EVENTS } from "../constants/socketEvents.js";
import Meeting from "../models/meetingModel.js";
import User from "../models/userModel.js";

import mongoose from "mongoose";
import {

    getMeeting,

    verifyHostPermission,

    participantExists,

    cannotKickHost,

    isLocked,
    isBanned,

} from "../middleware/hostMiddleware.js";
import { getUserSockets } from "./socketManager.js";
import {
    createNotification,
    NotificationType,
} from "../services/notificationService.js";
const pinnedUsers = new Map();
const registerSignalingEvents = (io, socket) => {

    // =====================================
    // JOIN CALL
    // =====================================

    socket.on(

        SOCKET_EVENTS.JOIN_CALL,

        ({ meetingId }) => {

            socket.join(meetingId);

            socket.to(meetingId).emit(

                SOCKET_EVENTS.USER_JOINED,

                {

                    userId: socket.user._id,

                    username: socket.user.username,

                    profilePicture: socket.user.profilePicture,

                }

            );

            const notification = createNotification(

                NotificationType.USER_JOINED,

                "Participant Joined",

                `${socket.user.username} joined meeting.`

            );

            io.to(meetingId).emit(

                "notification",

                notification

            );

        }

    );

    // =====================================
    // LEAVE CALL
    // =====================================

    socket.on(

        SOCKET_EVENTS.LEAVE_CALL,

        ({ meetingId }) => {

            socket.leave(meetingId);

            socket.to(meetingId).emit(

                SOCKET_EVENTS.USER_LEFT,

                {

                    userId: socket.user._id,

                }

            );

            const notification = createNotification(

                NotificationType.USER_LEFT,

                "Participant Left",

                `${socket.user.username} left meeting.`

            );

            io.to(meetingId).emit(

                "notification",

                notification

            );

        }

    );

    // =====================================
    // OFFER
    // =====================================

    socket.on(

        SOCKET_EVENTS.OFFER,

        ({ targetSocketId, offer }) => {

            io.to(targetSocketId).emit(

                SOCKET_EVENTS.OFFER,

                {

                    offer,

                    from: socket.id,

                    user: {

                        id: socket.user._id,

                        username: socket.user.username,

                    },

                }

            );

        }

    );

    // =====================================
    // ANSWER
    // =====================================

    socket.on(

        SOCKET_EVENTS.ANSWER,

        ({ targetSocketId, answer }) => {

            io.to(targetSocketId).emit(

                SOCKET_EVENTS.ANSWER,

                {

                    answer,

                    from: socket.id,

                }

            );

        }

    );

    // =====================================
    // ICE Candidate
    // =====================================

    socket.on(

        SOCKET_EVENTS.ICE_CANDIDATE,

        ({ targetSocketId, candidate }) => {

            io.to(targetSocketId).emit(

                SOCKET_EVENTS.ICE_CANDIDATE,

                {

                    candidate,

                    from: socket.id,

                }

            );

        }

    );


    // ======================================
    // Camera Status
    // ======================================

    socket.on(

        "camera-status",

        ({ meetingCode, enabled }) => {

            socket.to(meetingCode).emit(

                "camera-status-changed",

                {

                    userId: socket.user._id,

                    socketId: socket.id,

                    enabled,

                }

            );

        }

    );


    // ======================================
    // REQUEST CURRENT MEDIA STATUS
    // ======================================

    socket.on(
        "request-media-status",
        ({ meetingCode }) => {

            socket
                .to(meetingCode)
                .emit(
                    "request-media-status", {
                        requesterSocketId: socket.id,
                    }
                );

        }
    );

    // ======================================
    // RECEIVE MEDIA STATUS RESPONSE
    // ======================================

    socket.on(
        "media-status-response",
        ({
            targetSocketId,
            meetingCode,
            cameraEnabled,
            microphoneEnabled,
        }) => {

            io.to(targetSocketId).emit(
                "media-status-response", {
                    socketId: socket.id,

                    userId: socket.user._id,

                    cameraEnabled,

                    microphoneEnabled,
                }
            );

        }
    );



    // ======================================
    // Microphone Status
    // ======================================

    socket.on(

        "microphone-status",

        ({ meetingCode, enabled }) => {

            socket.to(meetingCode).emit(

                "microphone-status-changed",

                {

                    socketId: socket.id,

                    userId: socket.user._id,

                    enabled,

                }

            );

        }

    );

    // ======================================
    // Raise Hand
    // ======================================

    socket.on(
        "raise-hand",
        ({ meetingCode, raised }) => {

            // ======================================
            // Update Participant Hand Status
            // ======================================

            socket.to(meetingCode).emit(
                "raise-hand-changed", {
                    socketId: socket.id,
                    userId: socket.user._id,
                    username: socket.user.username,
                    raised,
                }
            );


            // ======================================
            // Hand Raised
            // ======================================

            if (raised) {

                const notification = createNotification(

                    NotificationType.RAISE_HAND,

                    "Raise Hand",

                    `${socket.user.username} raised hand.`

                );

                // Add participant identity
                // so frontend can identify notification

                notification.socketId = socket.id;

                notification.userId = socket.user._id;

                notification.username =
                    socket.user.username;


                io.to(meetingCode).emit(
                    "notification",
                    notification
                );

            }


            // ======================================
            // Hand Lowered
            // ======================================
            else {

                io.to(meetingCode).emit(
                    "raise-hand-notification-removed", {
                        socketId: socket.id,
                        userId: socket.user._id,
                        username: socket.user.username,
                    }
                );

            }

        }
    );


    // ======================================
    // Emoji Reaction
    // ======================================

    socket.on(

        "send-reaction",

        ({ meetingCode, emoji }) => {

            // ======================================
            // Reaction UI
            // ======================================

            io.to(meetingCode).emit(

                "reaction-received",

                {
                    socketId: socket.id,

                    userId: socket.user._id,

                    username: socket.user.username,

                    emoji,

                    createdAt: Date.now(),
                }

            );


            // ======================================
            // Reaction Notification
            // ======================================

            const notification = createNotification(

                NotificationType.REACTION,

                "New Reaction",

                `${socket.user.username} reacted ${emoji}`,

                {
                    socketId: socket.id,

                    userId: socket.user._id,

                    username: socket.user.username,

                    emoji,
                }

            );


            io.to(meetingCode).emit(

                "notification",

                notification

            );

        }

    );

    // ======================================
    // Speaking Status
    // ======================================

    socket.on(

        "speaking-status",

        ({ meetingCode, speaking }) => {

            socket.to(meetingCode).emit(

                "speaking-status-changed",

                {

                    socketId: socket.id,

                    userId: socket.user._id,

                    speaking,

                }

            );

        }

    );


    // =======================================
    // Kick User
    // =======================================

    socket.on(
        "kick-user",
        async({
                meetingCode,
                targetSocketId,
                targetUserId,
            },
            callback
        ) => {

            try {

                const meeting =
                    await Meeting.findOne({
                        meetingCode,
                    });

                // Host Permission
                if (!verifyHostPermission(meeting, socket.user._id)) {

                    if (callback) {
                        return callback({
                            success: false,
                            message: "Only Host or CoHost can kick.",
                        });
                    }

                    return;
                }

                // Participant Exists
                if (!participantExists(meeting, targetUserId)) {

                    if (callback) {
                        return callback({
                            success: false,
                            message: "Participant not found.",
                        });
                    }

                    return;
                }

                // Cannot Kick Host
                if (!cannotKickHost(meeting, targetUserId)) {

                    if (callback) {
                        return callback({
                            success: false,
                            message: "Host cannot be kicked.",
                        });
                    }

                    return;
                }
                // =====================================
                // 👇 YAHAN ADD KARO
                // Permanently Block This User
                // From Rejoining This Meeting
                // =====================================

                const kickedUserId =
                    new mongoose.Types.ObjectId(
                        targetUserId.toString()
                    );

                await Meeting.collection.updateOne({
                    _id: meeting._id,
                }, {
                    $pull: {
                        participants: kickedUserId,
                        waitingUsers: kickedUserId,
                    },

                    $addToSet: {
                        kickedUsers: kickedUserId,
                    },
                });
                // Kick User
                io.to(targetSocketId).emit("kicked", {
                    success: true,
                    message: "You were removed by Host.",
                });

                // ======================================
                // Host Action Notification
                // ======================================

                const notification = createNotification(

                    NotificationType.HOST_ACTION,

                    "Participant Removed",

                    `${socket.user.username} removed a participant from the meeting.`,

                    {
                        action: "KICK_USER",

                        hostSocketId: socket.id,

                        hostUserId: socket.user._id,

                        targetSocketId,

                        targetUserId,
                    }

                );

                io.to(meetingCode).emit(

                    "notification",

                    notification

                );

                if (callback) {
                    return callback({
                        success: true,
                        message: "User kicked successfully.",
                    });
                }

            } catch (error) {

                console.error("Kick User Error:", error);

                if (callback) {
                    return callback({
                        success: false,
                        message: error.message,
                    });
                }

            }

        }
    );



    // =======================================
    // Mute User
    // =======================================

    socket.on(
        "mute-user",
        async({
                meetingCode,
                targetSocketId,
                targetUserId,
            },
            callback
        ) => {

            try {

                const meeting =
                    await Meeting.findOne({
                        meetingCode,
                    });
                // Host Permission
                if (!verifyHostPermission(meeting, socket.user._id)) {

                    if (callback) {
                        return callback({
                            success: false,
                            message: "Unauthorized",
                        });
                    }

                    return;
                }

                // Participant Exists
                if (!participantExists(meeting, targetUserId)) {

                    if (callback) {
                        return callback({
                            success: false,
                            message: "Participant not found.",
                        });
                    }

                    return;
                }

                // Cannot Mute Host
                if (!cannotKickHost(meeting, targetUserId)) {

                    if (callback) {
                        return callback({
                            success: false,
                            message: "Host cannot be muted.",
                        });
                    }

                    return;
                }

                // Force Mute
                io.to(targetSocketId).emit("force-mute", {
                    success: true,
                    message: "Host muted your microphone.",
                });


                // ======================================
                // Host Action Notification
                // ======================================

                const notification = createNotification(

                    NotificationType.HOST_ACTION,

                    "Microphone Muted",

                    `${socket.user.username} muted a participant.`,

                    {
                        action: "MUTE_USER",

                        hostSocketId: socket.id,

                        hostUserId: socket.user._id,

                        targetSocketId,

                        targetUserId,
                    }

                );

                io.to(meetingCode).emit(

                    "notification",

                    notification

                );

                if (callback) {
                    return callback({
                        success: true,
                        message: "Participant muted successfully.",
                    });
                }

            } catch (error) {

                console.error("Mute User Error:", error);

                if (callback) {
                    return callback({
                        success: false,
                        message: error.message,
                    });
                }

            }

        }
    );

    // =======================================
    // Pin / Unpin User
    // =======================================

    socket.on(
        "pin-user",
        async({
                meetingCode,
                targetSocketId,
                targetUserId,
                pinned,
            },
            callback
        ) => {

            try {

                // =====================================
                // Find Meeting
                // =====================================

                const meeting =
                    await Meeting.findOne({
                        meetingCode,
                    });


                // =====================================
                // Meeting Check
                // =====================================

                if (!meeting) {

                    if (callback) {

                        return callback({
                            success: false,
                            message: "Meeting not found.",
                        });

                    }

                    return;
                }


                // =====================================
                // Host Permission
                // =====================================

                if (!verifyHostPermission(
                        meeting,
                        socket.user._id
                    )) {

                    if (callback) {

                        return callback({
                            success: false,
                            message: "Only Host or CoHost can pin.",
                        });

                    }

                    return;
                }


                // =====================================
                // Participant Exists
                // =====================================

                if (!participantExists(
                        meeting,
                        targetUserId
                    )) {

                    if (callback) {

                        return callback({
                            success: false,
                            message: "Participant not found.",
                        });

                    }

                    return;
                }


                // =====================================
                // PIN USER
                // =====================================

                if (pinned) {

                    const previousPinnedSocketId =
                        pinnedUsers.get(
                            meetingCode
                        );


                    // =================================
                    // Another User Was Already Pinned
                    // =================================

                    if (
                        previousPinnedSocketId &&
                        previousPinnedSocketId !==
                        targetSocketId
                    ) {

                        io.to(
                            previousPinnedSocketId
                        ).emit(
                            "user-pinned", {
                                pinned: false,

                                pinnedBy: socket.user._id.toString(),

                                pinnedByUsername: socket.user.username,
                            }
                        );

                    }


                    // =================================
                    // Save New Pinned User
                    // =================================

                    pinnedUsers.set(
                        meetingCode,
                        targetSocketId
                    );


                    // =================================
                    // Notify New Pinned User
                    // =================================

                    io.to(
                        targetSocketId
                    ).emit(
                        "user-pinned", {
                            pinned: true,

                            pinnedBy: socket.user._id.toString(),

                            pinnedByUsername: socket.user.username,
                        }
                    );


                    // =================================
                    // Host Callback
                    // =================================

                    if (callback) {

                        return callback({
                            success: true,
                            message: "Participant pinned successfully.",
                        });

                    }

                    return;
                }


                // =====================================
                // UNPIN USER
                // =====================================

                const currentPinnedSocketId =
                    pinnedUsers.get(
                        meetingCode
                    );


                // =====================================
                // Only Current Pinned User Can Unpin
                // =====================================

                if (
                    currentPinnedSocketId ===
                    targetSocketId
                ) {

                    pinnedUsers.delete(
                        meetingCode
                    );


                    io.to(
                        targetSocketId
                    ).emit(
                        "user-pinned", {
                            pinned: false,

                            pinnedBy: socket.user._id.toString(),

                            pinnedByUsername: socket.user.username,
                        }
                    );

                }


                // =====================================
                // Host Callback
                // =====================================

                if (callback) {

                    return callback({
                        success: true,
                        message: "Participant unpinned successfully.",
                    });

                }


            } catch (error) {

                console.error(
                    "Pin User Error:",
                    error
                );


                if (callback) {

                    return callback({
                        success: false,
                        message: error.message,
                    });

                }

            }

        }
    );
    // =======================================
    // Disable Camera
    // =======================================

    socket.on(
        "disable-camera",
        async({
            meetingCode,
            targetSocketId,
            targetUserId,
        }, callback) => {

            try {

                // =====================================
                // Find Meeting
                // =====================================

                const meeting =
                    await Meeting.findOne({
                        meetingCode,
                    });


                // =====================================
                // Meeting Check
                // =====================================

                if (!meeting) {

                    if (callback) {

                        return callback({
                            success: false,
                            message: "Meeting not found.",
                        });

                    }

                    return;
                }


                // =====================================
                // Host Permission
                // =====================================

                if (!verifyHostPermission(
                        meeting,
                        socket.user._id
                    )) {

                    if (callback) {

                        return callback({
                            success: false,
                            message: "Unauthorized",
                        });

                    }

                    return;
                }


                // =====================================
                // Participant Exists
                // =====================================

                if (!participantExists(
                        meeting,
                        targetUserId
                    )) {

                    if (callback) {

                        return callback({
                            success: false,
                            message: "Participant not found.",
                        });

                    }

                    return;
                }


                // =====================================
                // Cannot Disable Host Camera
                // =====================================

                if (!cannotKickHost(
                        meeting,
                        targetUserId
                    )) {

                    if (callback) {

                        return callback({
                            success: false,
                            message: "Host camera cannot be disabled.",
                        });

                    }

                    return;
                }


                // =====================================
                // FORCE CAMERA OFF
                // =====================================

                io.to(
                    targetSocketId
                ).emit(
                    "force-camera-off", {
                        success: true,
                        message: "Host disabled your camera.",
                    }
                );

                // ======================================
                // Host Action Notification
                // ======================================

                const notification = createNotification(

                    NotificationType.HOST_ACTION,

                    "Camera Disabled",

                    `${socket.user.username} disabled a participant's camera.`,

                    {
                        action: "DISABLE_CAMERA",

                        hostSocketId: socket.id,

                        hostUserId: socket.user._id,

                        targetSocketId,

                        targetUserId,
                    }

                );

                io.to(meetingCode).emit(

                    "notification",

                    notification

                );
                // =====================================
                // Host Callback
                // =====================================

                if (callback) {

                    return callback({
                        success: true,
                        message: "Participant camera disabled successfully.",
                    });

                }

            } catch (error) {

                console.error(
                    "Disable Camera Error:",
                    error
                );


                if (callback) {

                    return callback({
                        success: false,
                        message: error.message,
                    });

                }

            }

        }
    );

    // =======================================
    // Lock / Unlock Meeting
    // =======================================

    socket.on(
        "lock-meeting",
        async({
                meetingId,
                locked,
            },
            callback
        ) => {

            try {

                const meeting = await getMeeting(meetingId);

                // ===================================
                // Verify Host Permission
                // ===================================

                if (!verifyHostPermission(meeting, socket.user._id)) {

                    if (callback) {
                        return callback({
                            success: false,
                            message: "Only Host or Co-Host can lock/unlock the meeting.",
                        });
                    }

                    return;
                }

                // ===================================
                // Update Meeting Status
                // ===================================

                meeting.locked = locked;

                await meeting.save();

                // ===================================
                // Notify All Participants
                // ===================================

                io.to(meeting.meetingCode).emit(
                    "meeting-lock-status", {
                        locked,
                        message: locked ?
                            "Meeting has been locked by the Host." : "Meeting has been unlocked by the Host.",
                    }
                );
                // ======================================
                // Lock / Unlock Notification
                // ======================================

                const notification = createNotification(

                    NotificationType.HOST_ACTION,

                    locked ?
                    "Meeting Locked" :
                    "Meeting Unlocked",

                    locked ?
                    "The Host locked the meeting." :
                    "The Host unlocked the meeting.",

                    {
                        action: locked ?
                            "LOCK_MEETING" : "UNLOCK_MEETING",

                        hostUserId: socket.user._id,
                    }

                );

                io.to(meeting.meetingCode).emit(

                    "notification",

                    notification

                );
                // ===================================
                // Acknowledge Host
                // ===================================

                if (callback) {
                    return callback({
                        success: true,
                        message: locked ?
                            "Meeting locked successfully." : "Meeting unlocked successfully.",
                    });
                }

            } catch (error) {

                console.error("Lock Meeting Error:", error);

                if (callback) {
                    return callback({
                        success: false,
                        message: error.message,
                    });
                }

            }

        }
    );




    // =======================================
    // Transfer Host
    // =======================================

    socket.on(
        "transfer-host",
        async({
                meetingId,
                newHostId,
            },
            callback
        ) => {

            try {

                const meeting = await getMeeting(meetingId);

                // ===================================
                // Verify Host Permission
                // ===================================

                if (!verifyHostPermission(meeting, socket.user._id)) {

                    if (callback) {
                        return callback({
                            success: false,
                            message: "Only Host or Co-Host can transfer host.",
                        });
                    }

                    return;
                }

                // ===================================
                // Check Participant Exists
                // ===================================

                if (!participantExists(meeting, newHostId)) {

                    if (callback) {
                        return callback({
                            success: false,
                            message: "Selected user is not a participant.",
                        });
                    }

                    return;
                }

                // ===================================
                // Cannot Transfer to Same Host
                // ===================================

                if (meeting.host.toString() === newHostId.toString()) {

                    if (callback) {
                        return callback({
                            success: false,
                            message: "This user is already the Host.",
                        });
                    }

                    return;
                }

                // ===================================
                // Old Host -> CoHost
                // ===================================

                if (!meeting.coHosts.some(
                        (id) => id.toString() === meeting.host.toString()
                    )) {
                    meeting.coHosts.push(meeting.host);
                }

                // ===================================
                // Remove New Host From CoHosts
                // ===================================

                meeting.coHosts = meeting.coHosts.filter(
                    (id) => id.toString() !== newHostId.toString()
                );

                // ===================================
                // Transfer Host
                // ===================================

                meeting.host = newHostId;

                await meeting.save();

                // ===================================
                // Notify Everyone
                // ===================================

                io.to(meeting.meetingCode).emit(
                    "host-transferred", {
                        hostId: newHostId,
                        message: "Meeting host has been changed.",
                    }
                );

                // ===================================
                // Ack
                // ===================================

                if (callback) {
                    return callback({
                        success: true,
                        message: "Host transferred successfully.",
                    });
                }

            } catch (error) {

                console.error("Transfer Host Error:", error);

                if (callback) {
                    return callback({
                        success: false,
                        message: error.message,
                    });
                }

            }

        }
    );



    // =======================================
    // Make Co-Host
    // =======================================

    socket.on(
        "make-cohost",
        async({
                meetingId,
                userId,
            },
            callback
        ) => {

            try {

                const meeting = await getMeeting(meetingId);

                // ===================================
                // Verify Host Permission
                // ===================================

                if (!verifyHostPermission(meeting, socket.user._id)) {

                    if (callback) {
                        return callback({
                            success: false,
                            message: "Only Host or Co-Host can assign a Co-Host.",
                        });
                    }

                    return;
                }

                // ===================================
                // Check Participant Exists
                // ===================================

                if (!participantExists(meeting, userId)) {

                    if (callback) {
                        return callback({
                            success: false,
                            message: "Participant not found.",
                        });
                    }

                    return;
                }

                // ===================================
                // Host Cannot Become Co-Host
                // ===================================

                if (meeting.host.toString() === userId.toString()) {

                    if (callback) {
                        return callback({
                            success: false,
                            message: "Host is already the highest role.",
                        });
                    }

                    return;
                }

                // ===================================
                // Already Co-Host
                // ===================================

                const alreadyCoHost = meeting.coHosts.some(
                    (id) => id.toString() === userId.toString()
                );

                if (alreadyCoHost) {

                    if (callback) {
                        return callback({
                            success: false,
                            message: "User is already a Co-Host.",
                        });
                    }

                    return;
                }

                // ===================================
                // Add Co-Host
                // ===================================

                meeting.coHosts.push(userId);

                await meeting.save();

                // ===================================
                // Notify Everyone
                // ===================================

                io.to(meeting.meetingCode).emit(
                    "cohost-added", {
                        userId,
                        message: "A new Co-Host has been assigned.",
                    }
                );

                // ===================================
                // Acknowledge
                // ===================================

                if (callback) {
                    return callback({
                        success: true,
                        message: "Co-Host assigned successfully.",
                    });
                }

            } catch (error) {

                console.error("Make Co-Host Error:", error);

                if (callback) {
                    return callback({
                        success: false,
                        message: error.message,
                    });
                }

            }

        }
    );
    // =======================================
    // Join Waiting Room
    // =======================================

    socket.on(

        "waiting-room-join",

        async(

            {

                meetingId,

            },

            callback

        ) => {

            try {

                const meeting =

                    await getMeeting(meetingId);

                meeting.waitingUsers.push(

                    socket.user._id

                );

                await meeting.save();

                io.to(

                    meeting.meetingCode

                ).emit(

                    "waiting-user",

                    {

                        userId: socket.user._id,

                        username: socket.user.username,

                        profilePicture: socket.user.profilePicture,

                    }

                );

                // ======================================
                // Waiting Room Notification
                // ======================================

                const notification = createNotification(

                    NotificationType.WAITING_ROOM,

                    "Waiting Room",

                    `${socket.user.username} is waiting to join the meeting.`,

                    {
                        action: "WAITING_ROOM_JOIN",

                        userId: socket.user._id,

                        socketId: socket.id,

                        username: socket.user.username,
                    }

                );

                io.to(meeting.meetingCode).emit(

                    "notification",

                    notification

                );

                if (callback) {

                    return callback({

                        success: true,

                        message: "Waiting Request Sent",

                    });

                }

            } catch (error) {

                if (callback) {

                    return callback({

                        success: false,

                        message: error.message,

                    });

                }

            }

        });



    socket.on(

        "approve-user",

        async(

            {

                meetingCode,

                userId,

            },

            callback

        ) => {

            try {

                const meeting = await Meeting.findOne({
                    meetingCode,
                });
                if (

                    !verifyHostPermission(

                        meeting,

                        socket.user._id

                    )

                ) {

                    if (callback) {

                        return callback({

                            success: false,

                            message: "Unauthorized",

                        });

                    }

                    return;

                }

                meeting.waitingUsers =

                    meeting.waitingUsers.filter(

                        (id) =>

                        id.toString()

                        !==

                        userId.toString()

                    );

                meeting.participants.push(

                    userId

                );

                await meeting.save();

                // ======================================
                // Notify Only Approved User
                // ======================================

                const sockets = getUserSockets(userId);

                for (const socketId of sockets) {

                    io.to(socketId).emit("user-approved", {

                        success: true,

                        meetingId,

                        message: "Your request has been approved by the Host.",

                    });

                }

                // ======================================
                // Notify Host Room
                // ======================================

                io.to(meeting.meetingCode).emit("waiting-user-removed", {

                    userId,

                });

                const notification = createNotification(

                    NotificationType.WAITING_ROOM,

                    "Participant Rejected",

                    "A waiting participant was rejected by the Host.",

                    {
                        action: "REJECT_USER",

                        hostUserId: socket.user._id,

                        userId,
                    }

                );

                io.to(meeting.meetingCode).emit(
                    "notification",
                    notification
                );
                if (callback) {

                    return callback({

                        success: true,

                    });

                }

            } catch (error) {

                if (callback) {

                    return callback({

                        success: false,

                        message: error.message,

                    });

                }

            }

        });



    socket.on(

        "reject-user",

        async(

            {

                meetingCode,

                userId,

            },

            callback

        ) => {

            try {




                const meeting =
                    await Meeting.findOne({
                        meetingCode,
                    });
                if (

                    !verifyHostPermission(

                        meeting,

                        socket.user._id

                    )

                ) {

                    if (callback) {

                        return callback({

                            success: false,

                        });

                    }

                    return;

                }

                meeting.waitingUsers =

                    meeting.waitingUsers.filter(

                        (id) =>

                        id.toString()

                        !==

                        userId.toString()

                    );

                await meeting.save();

                // ======================================
                // Notify Only Rejected User
                // ======================================

                const sockets = getUserSockets(userId);

                for (const socketId of sockets) {

                    io.to(socketId).emit("user-rejected", {

                        success: true,

                        meetingId,

                        message: "Your request has been rejected by the Host.",

                    });

                }

                // ======================================
                // Remove From Host Waiting List
                // ======================================

                io.to(meeting.meetingCode).emit("waiting-user-removed", {

                    userId,

                });

                if (callback) {

                    return callback({

                        success: true,

                    });

                }

            } catch (error) {

                if (callback) {

                    return callback({

                        success: false,

                        message: error.message,

                    });

                }

            }

        });

};

export default registerSignalingEvents;