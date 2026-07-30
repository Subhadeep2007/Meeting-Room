import Message from "../models/messageModel.js";
import Meeting from "../models/meetingModel.js";

import { encryptMessage } from "./encryptionService.js";

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