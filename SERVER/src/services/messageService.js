import mongoose from "mongoose";

import Message from "../models/messageModel.js";
import Meeting from "../models/meetingModel.js";

// ==========================================
// CREATE MESSAGE
// ==========================================

export const createMessage = async({
    meetingId,
    sender,
    encryptedMessage,
    iv,
}) => {

    // ==========================================
    // Validate Meeting ID
    // ==========================================

    if (!meetingId ||
        !mongoose.Types.ObjectId.isValid(meetingId)
    ) {
        throw new Error(
            "Invalid meeting ID"
        );
    }

    // ==========================================
    // Validate Sender
    // ==========================================

    if (!sender) {
        throw new Error(
            "Sender is required"
        );
    }

    // ==========================================
    // Validate Encrypted Data
    // ==========================================

    if (!encryptedMessage ||
        !iv
    ) {
        throw new Error(
            "Encrypted message data is required"
        );
    }

    // ==========================================
    // Find Meeting
    // ==========================================

    const meeting =
        await Meeting.findById(
            meetingId
        );

    if (!meeting) {
        throw new Error(
            "Meeting not found"
        );
    }

    // ==========================================
    // CHAT ONLY WHILE MEETING IS LIVE
    // ==========================================

    if (
        meeting.status !== "live"
    ) {
        throw new Error(
            "Chat is available only while meeting is live"
        );
    }

    // ==========================================
    // Check Participant
    // ==========================================

    const isParticipant =
        meeting.participants.some(
            (participant) =>
            participant.toString() ===
            sender.toString()
        );

    // ==========================================
    // Check Host
    // ==========================================

    const isHost =
        meeting.host.toString() ===
        sender.toString();

    // ==========================================
    // Authorization
    // ==========================================

    if (!isParticipant &&
        !isHost
    ) {
        throw new Error(
            "You are not a participant of this meeting"
        );
    }

    // ==========================================
    // Save Encrypted Message
    // ==========================================

    const newMessage =
        await Message.create({

            meeting: meetingId,

            sender,

            encryptedMessage,

            iv,

            messageType: "text",

        });

    // ==========================================
    // Populate Sender
    // ==========================================

    await newMessage.populate({

        path: "sender",

        select: "name username profilePicture",

    });

    // ==========================================
    // Return
    // ==========================================

    return {

        message: newMessage,

        meetingCode: meeting.meetingCode,

    };
};


// ==========================================
// GET MESSAGE HISTORY
// ==========================================

export const getMessageHistory = async({
    meetingId,
    userId,
    cursor,
    limit = 30,
}) => {

    // ==========================================
    // Validate Meeting ID
    // ==========================================

    if (!meetingId ||
        !mongoose.Types.ObjectId.isValid(
            meetingId
        )
    ) {
        throw new Error(
            "Invalid meeting ID"
        );
    }

    // ==========================================
    // Validate User
    // ==========================================

    if (!userId) {
        throw new Error(
            "User ID is required"
        );
    }

    // ==========================================
    // Find Meeting
    // ==========================================

    const meeting =
        await Meeting.findById(
            meetingId
        );

    if (!meeting) {
        throw new Error(
            "Meeting not found"
        );
    }

    // ==========================================
    // Check Participant
    // ==========================================

    const isParticipant =
        meeting.participants.some(
            (participant) =>
            participant.toString() ===
            userId.toString()
        );

    // ==========================================
    // Check Host
    // ==========================================

    const isHost =
        meeting.host.toString() ===
        userId.toString();

    // ==========================================
    // Authorization
    // ==========================================

    if (!isParticipant &&
        !isHost
    ) {
        throw new Error(
            "You are not authorized to view this chat"
        );
    }

    // ==========================================
    // Build Query
    // ==========================================

    const query = {

        meeting: meetingId,

    };

    // ==========================================
    // Cursor Pagination
    // ==========================================

    if (cursor) {

        if (!mongoose.Types.ObjectId.isValid(
                cursor
            )) {
            throw new Error(
                "Invalid cursor"
            );
        }

        query._id = {

            $lt: new mongoose.Types.ObjectId(
                cursor
            ),

        };
    }

    // ==========================================
    // Get Messages
    // ==========================================

    const messages =
        await Message.find(
            query
        )

    .populate(
        "sender",
        "name username profilePicture"
    )

    .sort({
        _id: -1,
    })

    .limit(
        limit + 1
    )

    .lean();

    // ==========================================
    // Check More Messages
    // ==========================================

    const hasNextPage =
        messages.length > limit;

    if (hasNextPage) {
        messages.pop();
    }

    // ==========================================
    // Reverse For Chat UI
    // ==========================================

    messages.reverse();

    // ==========================================
    // Next Cursor
    // ==========================================

    const nextCursor =
        hasNextPage &&
        messages.length > 0 ?
        messages[0]._id :
        null;

    // ==========================================
    // IMPORTANT
    // ==========================================
    // Server NEVER decrypts messages.
    //
    // Frontend decrypts using meeting AES key.
    // ==========================================

    return {

        messages,

        nextCursor,

        hasNextPage,

    };
};