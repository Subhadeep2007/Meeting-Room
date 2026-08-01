import httpStatus from "http-status";

import Message from "../models/messageModel.js";
import Meeting from "../models/meetingModel.js";

import { encryptMessage } from "../services/encryptionService.js";



import { getMessageHistory } from "../services/messageService.js";

export const sendMessage = async(req, res) => {
    try {
        const {
            meetingId,
            message,
            messageType = "text",
            replyTo = null,
            attachments = [],
        } = req.body;

        // Logged In User
        const sender = req.user._id;

        // ===========================
        // Validation
        // ===========================

        if (!meetingId) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: "Meeting ID is required",
            });
        }

        if (!message && attachments.length === 0) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: "Message or attachment is required",
            });
        }

        // ===========================
        // Check Meeting Exists
        // ===========================

        const meeting = await Meeting.findById(meetingId);

        if (!meeting) {
            return res.status(httpStatus.NOT_FOUND).json({
                success: false,
                message: "Meeting not found",
            });
        }

        // ===========================
        // Check User is Participant
        // ===========================

        const isParticipant = meeting.participants.some((participant) =>
            participant.equals(sender)
        );

        if (!isParticipant) {
            return res.status(httpStatus.FORBIDDEN).json({
                success: false,
                message: "You are not a participant of this meeting",
            });
        }

        // ===========================
        // Encrypt Message
        // ===========================

        const { encryptedMessage, iv, authTag } = encryptMessage(
            message || ""
        );

        // ===========================
        // Save Message
        // ===========================

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

        // ===========================
        // Populate Data
        // ===========================

        await newMessage.populate([{
                path: "sender",
                select: "name username profilePicture",
            },
            {
                path: "replyTo",
            },
        ]);

        // ===========================
        // Response
        // ===========================

        return res.status(httpStatus.CREATED).json({
            success: true,
            message: "Message sent successfully",
            data: newMessage,
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message,
        });
    }
};
export const getMessages = async(req, res) => {

    try {

        const { meetingId } = req.params;

        const { cursor } = req.query;

        const limit = Number(req.query.limit) || 20;

        const result = await getMessageHistory({

            meetingId,

            userId: req.user._id,

            cursor,

            limit,

        });

        return res.status(200).json({

            success: true,

            ...result,

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};