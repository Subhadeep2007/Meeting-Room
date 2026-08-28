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
    replyTo = null
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
    // Validate Reply Message
    // ==========================================

    if (replyTo) {

        if (!mongoose.Types.ObjectId.isValid(
                replyTo
            )) {

            throw new Error(
                "Invalid reply message ID"
            );

        }

        const repliedMessage =
            await Message.findById(replyTo);

        if (!repliedMessage) {

            throw new Error(
                "Reply message not found"
            );

        }

        if (
            repliedMessage.meeting.toString() !==
            meetingId.toString()
        ) {

            throw new Error(
                "Reply message belongs to another meeting"
            );

        }

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
            replyTo,

        });

    // ==========================================
    // Populate Sender
    // ==========================================

    await newMessage.populate([

        {
            path: "sender",
            select: "name username profilePicture",
        },

        {
            path: "replyTo",
            populate: {
                path: "sender",
                select: "name username profilePicture",
            },
        },

    ]);

    // ==========================================
    // Return
    // ==========================================

    return {

        message: newMessage,

        meetingCode: meeting.meetingCode,

    };
};

// ==========================================
// EDIT MESSAGE
// ==========================================

export const editMessage = async({
    messageId,
    userId,
    encryptedMessage,
    iv,
}) => {

    if (!messageId ||
        !mongoose.Types.ObjectId.isValid(messageId)
    ) {
        throw new Error("Invalid message ID");
    }

    if (!encryptedMessage || !iv) {
        throw new Error(
            "Encrypted message data is required"
        );
    }

    const message = await Message.findById(messageId);

    if (!message) {
        throw new Error("Message not found");
    }

    // Only sender can edit
    if (
        message.sender.toString() !==
        userId.toString()
    ) {
        throw new Error(
            "You can only edit your own message"
        );
    }

    // Deleted message cannot be edited
    if (message.isDeletedForEveryone) {
        throw new Error(
            "Deleted message cannot be edited"
        );
    }

    message.encryptedMessage = encryptedMessage;
    message.iv = iv;

    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();

    const meeting = await Meeting.findById(
        message.meeting
    );

    return {
        message,
        meetingCode: meeting.meetingCode,
    };
};


// ==========================================
// DELETE MESSAGE FOR ME
// ==========================================

export const deleteMessageForMe = async({
    messageId,
    userId,
}) => {

    if (!messageId ||
        !mongoose.Types.ObjectId.isValid(messageId)
    ) {
        throw new Error("Invalid message ID");
    }

    const message = await Message.findById(messageId);

    if (!message) {
        throw new Error("Message not found");
    }

    // Prevent duplicate user IDs
    const alreadyDeleted =
        message.deletedFor.some(
            (id) =>
            id.toString() === userId.toString()
        );

    if (!alreadyDeleted) {

        message.deletedFor.push(userId);

        await message.save();

    }

    return message;
};


// ==========================================
// DELETE MESSAGE FOR EVERYONE
// ==========================================

export const deleteMessageForEveryone = async({
    messageId,
    userId,
}) => {

    if (!messageId ||
        !mongoose.Types.ObjectId.isValid(messageId)
    ) {
        throw new Error("Invalid message ID");
    }

    const message = await Message.findById(messageId);

    if (!message) {
        throw new Error("Message not found");
    }

    // Only sender can delete for everyone
    if (
        message.sender.toString() !==
        userId.toString()
    ) {
        throw new Error(
            "You can only delete your own message"
        );
    }

    message.isDeletedForEveryone = true;
    message.deletedAt = new Date();

    await message.save();

    const meeting = await Meeting.findById(
        message.meeting
    );

    return {
        message,
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
        await Message.find(query)

    .populate(
        "sender",
        "name username profilePicture"
    )

    .populate({
        path: "replyTo",
        populate: {
            path: "sender",
            select: "name username profilePicture",
        },
    })

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