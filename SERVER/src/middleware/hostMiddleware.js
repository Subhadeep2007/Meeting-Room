import httpStatus from "http-status";

import Meeting from "../models/meetingModel.js";

// =======================================
// Check Meeting Exists
// =======================================

export const getMeeting = async(meetingId) => {

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {

        throw new Error("Meeting not found");

    }

    return meeting;

};

// =======================================
// Is Host
// =======================================

export const isHost = (meeting, userId) => {

    return meeting.host.toString() === userId.toString();

};

// =======================================
// Is Co Host
// =======================================

export const isCoHost = (meeting, userId) => {

    return meeting.coHosts.some(

        (host) =>

        host.toString() === userId.toString()

    );

};

// =======================================
// Host Permission
// =======================================

export const verifyHostPermission = (

    meeting,

    userId

) => {

    if (

        isHost(meeting, userId)

    ) {

        return true;

    }

    if (

        isCoHost(meeting, userId)

    ) {

        return true;

    }

    return false;

};

// =======================================
// Participant Exists
// =======================================

export const participantExists = (

    meeting,

    participantId

) => {

    return meeting.participants.some(

        (user) =>

        user.toString() ===

        participantId.toString()

    );

};

// =======================================
// Cannot Kick Host
// =======================================

export const cannotKickHost = (

    meeting,

    targetUser

) => {

    return (

        meeting.host.toString()

        !==

        targetUser.toString()

    );

};

// =======================================
// Not Banned
// =======================================

export const isBanned = (

    meeting,

    userId

) => {

    return meeting.bannedUsers.some(

        (user) =>

        user.toString()

        ===

        userId.toString()

    );

};

// =======================================
// Meeting Locked
// =======================================

export const isLocked = (meeting) => {

    return meeting.locked;

};