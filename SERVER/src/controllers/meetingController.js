import httpStatus from "http-status";
import { nanoid } from "nanoid";
import Meeting from "../models/meetingModel.js";

// ===================================
// Create Meeting
// ===================================
export const createMeeting = async(req, res) => {

    try {

        const { title } = req.body;

        // Validation
        if (!title || title.trim() === "") {

            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: "Meeting title is required",
            });

        }

        // Generate Unique Meeting Code
        let meetingCode;
        let existingMeeting;

        do {

            meetingCode = nanoid(8).toUpperCase();

            existingMeeting = await Meeting.findOne({
                meetingCode,
            });

        } while (existingMeeting);

        // Create Meeting
        const meeting = await Meeting.create({

            title: title.trim(),

            meetingCode,

            host: req.user._id,

            participants: [req.user._id],

            isActive: true,

        });

        return res.status(httpStatus.CREATED).json({

            success: true,

            message: "Meeting Created Successfully",

            meeting,

        });

    } catch (error) {

        console.error(error);

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};



// ========================================
// Join Meeting
// ========================================

export const joinMeeting = async(req, res) => {

    try {

        const { meetingCode } = req.body;

        // Validation
        if (!meetingCode || meetingCode.trim() === "") {

            return res.status(httpStatus.BAD_REQUEST).json({

                success: false,

                message: "Meeting Code is required",

            });

        }

        // Find Meeting
        const meeting = await Meeting.findOne({

            meetingCode: meetingCode.trim().toUpperCase(),

        }).populate(
            "host",
            "name username profilePicture"
        );

        if (!meeting) {

            return res.status(httpStatus.NOT_FOUND).json({

                success: false,

                message: "Meeting Not Found",

            });

        }

        // Check Active
        if (!meeting.isActive) {

            return res.status(httpStatus.BAD_REQUEST).json({

                success: false,

                message: "Meeting has already ended",

            });

        }

        // Already Joined?
        const alreadyJoined = meeting.participants.some(

            (participant) =>

            participant.toString() === req.user._id.toString()

        );

        if (alreadyJoined) {

            return res.status(httpStatus.CONFLICT).json({

                success: false,

                message: "You have already joined this meeting",

            });

        }

        // Add User
        meeting.participants.push(req.user._id);

        await meeting.save();

        return res.status(httpStatus.OK).json({

            success: true,

            message: "Meeting Joined Successfully",

            meeting,

        });

    } catch (error) {

        console.log(error);

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};


export const getMyMeetings = async(req, res) => {

    try {

        const meetings = await Meeting.find({

                host: req.user._id,

            })
            .sort({ createdAt: -1 })
            .populate(
                "participants",
                "name username profilePicture"
            );

        return res.status(httpStatus.OK).json({

            success: true,

            count: meetings.length,

            meetings,

        });

    } catch (error) {

        console.error(error);

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};


// =====================================
// Get Meeting Details
// =====================================

export const getMeetingDetails = async(req, res) => {

    try {

        const { id } = req.params;

        const meeting = await Meeting.findById(id)

        .populate(
            "host",
            "name username profilePicture"
        )

        .populate(
            "participants",
            "name username profilePicture"
        );

        if (!meeting) {

            return res.status(httpStatus.NOT_FOUND).json({

                success: false,

                message: "Meeting Not Found",

            });

        }

        return res.status(httpStatus.OK).json({

            success: true,

            meeting,

        });

    } catch (error) {

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};

// =====================================
// End Meeting
// =====================================

export const endMeeting = async(req, res) => {

    try {

        const { id } = req.params;

        const meeting = await Meeting.findById(id);

        if (!meeting) {

            return res.status(httpStatus.NOT_FOUND).json({

                success: false,

                message: "Meeting Not Found",

            });

        }

        if (
            meeting.host.toString() !==
            req.user._id.toString()
        ) {

            return res.status(httpStatus.FORBIDDEN).json({

                success: false,

                message: "Only Host Can End Meeting",

            });

        }

        meeting.isActive = false;

        meeting.endTime = new Date();

        await meeting.save();

        return res.status(httpStatus.OK).json({

            success: true,

            message: "Meeting Ended Successfully",

        });

    } catch (error) {

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};


// =====================================
// Delete Meeting
// =====================================

export const deleteMeeting = async(req, res) => {

    try {

        const { id } = req.params;

        const meeting = await Meeting.findById(id);

        if (!meeting) {

            return res.status(httpStatus.NOT_FOUND).json({

                success: false,

                message: "Meeting Not Found",

            });

        }

        if (

            meeting.host.toString() !==

            req.user._id.toString()

        ) {

            return res.status(httpStatus.FORBIDDEN).json({

                success: false,

                message: "Only Host Can Delete Meeting",

            });

        }

        await Meeting.findByIdAndDelete(id);

        return res.status(httpStatus.OK).json({

            success: true,

            message: "Meeting Deleted Successfully",

        });

    } catch (error) {

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};