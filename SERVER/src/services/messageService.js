import mongoose from "mongoose";
import Message from "../models/messageModel.js";
import Meeting from "../models/meetingModel.js";

import { encryptMessage } from "./encryptionService.js";


import { decryptMessage } from "./encryptionService.js";

export const createMessage = async({
    meetingId,
    sender,
    message,
    messageType = "text",
    replyTo = null,
    attachments = [],
}) => {

    // ==========================================
    // Check Meeting Exists
    // ==========================================

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
        throw new Error("Meeting not found");
    }

    // ==========================================
    // Check Meeting Active
    // ==========================================

    if (!meeting.isActive) {
        throw new Error("Meeting has ended");
    }

    // ==========================================
    // Check User is Participant
    // ==========================================

    const isParticipant = meeting.participants.some(
        (participant) => participant.equals(sender)
    );

    if (!isParticipant) {
        throw new Error("You are not a participant of this meeting");
    }

    // ==========================================
    // Reply Message Validation
    // ==========================================

    if (replyTo) {

        const replyMessage = await Message.findById(replyTo);

        if (!replyMessage) {
            throw new Error("Reply message not found");
        }

        if (!replyMessage.meeting.equals(meetingId)) {
            throw new Error(
                "Reply message belongs to another meeting"
            );
        }
    }

    // ==========================================
    // Encrypt Message
    // ==========================================

    const {
        encryptedMessage,
        iv,
        authTag,
    } = encryptMessage(message || "");

    // ==========================================
    // Save Message
    // ==========================================

    const newMessage = await Message.create({

        meeting: meetingId,

        sender,

        encryptedMessage,

        iv,

        authTag,

        messageType,

        replyTo,

        attachments,

    });

    // ==========================================
    // Populate Sender & Reply
    // ==========================================

    await newMessage.populate([{
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

    return newMessage;
};





export const getMessageHistory = async({
    meetingId,
    userId,
    cursor,
    limit = 20,
}) => {

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
        throw new Error("Meeting not found");
    }

    const isParticipant = meeting.participants.some(
        participant => participant.equals(userId)
    );

    if (!isParticipant) {
        throw new Error("You are not a participant");
    }

    const query = {
        meeting: meetingId,
    };

    if (cursor) {

        query._id = {
            $lt: new mongoose.Types.ObjectId(cursor),
        };

    }

    const messages = await Message.find(query)

    .populate("sender", "username profilePicture")

    .populate({
        path: "replyTo",
        populate: {
            path: "sender",
            select: "username profilePicture",
        },
    })

    .sort({
        _id: -1,
    })

    .limit(limit + 1)

    .lean();

    const hasNextPage = messages.length > limit;

    if (hasNextPage) {
        messages.pop();
    }

    const decryptedMessages = messages.map(message => {

        if (message.messageType === "text") {

            message.message = decryptMessage({

                encryptedMessage: message.encryptedMessage,

                iv: message.iv,

                authTag: message.authTag,

            });

        }

        delete message.encryptedMessage;
        delete message.iv;
        delete message.authTag;

        return message;

    });

    return {

        messages: decryptedMessages,

        nextCursor: hasNextPage ?
            decryptedMessages[decryptedMessages.length - 1]._id : null,

        hasNextPage,

    };

};