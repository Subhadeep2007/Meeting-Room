import httpStatus from "http-status";

import {
    uploadFileService,
    getFileService,
    deleteFileService,
    getRecentFiles,
} from "../services/fileService.js";

import { getIO } from "../socket/socketManager.js";

import Meeting from "../models/meetingModel.js";

import {
    createNotification,
    NotificationType,
} from "../services/notificationService.js";


// ======================================
// Upload File
// ======================================

export const uploadFile = async(req, res) => {

    try {

        const {
            meetingCode,
        } = req.body;


        const uploadedBy =
            req.user._id;


        const file =
            req.file;


        // ======================================
        // Upload Service
        // ======================================

        const savedFile =
            await uploadFileService({

                meetingCode,

                uploadedBy,

                file,

            });


        // ======================================
        // Find Meeting
        // ======================================

        const meeting =
            await Meeting.findOne({

                meetingCode: meetingCode.toUpperCase(),

            });


        if (!meeting) {

            return res.status(
                httpStatus.NOT_FOUND
            ).json({

                success: false,

                message: "Meeting not found",

            });

        }


        // ======================================
        // Socket
        // ======================================

        const io =
            getIO();


        io.to(
            meeting.meetingCode
        ).emit(

            "file-uploaded",

            savedFile

        );


        // ======================================
        // Notification
        // ======================================

        const notification =
            createNotification(

                NotificationType.FILE_UPLOADED,

                "File Uploaded",

                `${req.user.username} uploaded "${savedFile.originalName}".`,

                {

                    meetingCode,

                    fileId: savedFile._id,

                    userId: req.user._id,

                    username: req.user.username,

                }

            );


        io.to(
            meeting.meetingCode
        ).emit(

            "notification",

            notification

        );


        // ======================================
        // Response
        // ======================================

        return res.status(
            httpStatus.CREATED
        ).json({

            success: true,

            message: "File uploaded successfully",

            data: savedFile,

        });


    } catch (error) {

        console.error(
            "Upload File Error:",
            error
        );


        return res.status(
            httpStatus.BAD_REQUEST
        ).json({

            success: false,

            message: error.message,

        });

    }

};


// ======================================
// Get Single File
// ======================================

export const getFile = async(
    req,
    res
) => {

    try {

        const {
            fileId,
        } = req.params;


        const file =
            await getFileService({

                fileId,

                userId: req.user._id,

            });


        return res.status(
            httpStatus.OK
        ).json({

            success: true,

            data: file,

        });


    } catch (error) {

        console.error(
            "Get File Error:",
            error
        );


        return res.status(
            httpStatus.BAD_REQUEST
        ).json({

            success: false,

            message: error.message,

        });

    }

};


// ======================================
// Delete File
// ======================================

export const deleteFile = async(
    req,
    res
) => {

    try {

        const {
            fileId,
        } = req.params;


        // ======================================
        // Delete Service
        // ======================================

        const file =
            await deleteFileService({

                fileId,

                userId: req.user._id,

            });


        // ======================================
        // Find Meeting
        // ======================================

        const meeting =
            await Meeting.findById(
                file.meeting
            );


        if (!meeting) {

            return res.status(
                httpStatus.NOT_FOUND
            ).json({

                success: false,

                message: "Meeting not found",

            });

        }


        // ======================================
        // Socket
        // ======================================

        const io =
            getIO();


        io.to(
            meeting.meetingCode
        ).emit(

            "file-deleted",

            {

                fileId: file._id,

            }

        );


        // ======================================
        // Notification
        // ======================================

        const notification =
            createNotification(

                NotificationType.FILE_DELETED,

                "File Deleted",

                `${req.user.username} deleted "${file.originalName}".`,

                {

                    meetingCode: meeting.meetingCode,

                    fileId: file._id,

                    userId: req.user._id,

                    username: req.user.username,

                }

            );


        io.to(
            meeting.meetingCode
        ).emit(

            "notification",

            notification

        );


        // ======================================
        // Response
        // ======================================

        return res.status(
            httpStatus.OK
        ).json({

            success: true,

            message: "File deleted successfully",

        });


    } catch (error) {

        console.error(
            "Delete File Error:",
            error
        );


        return res.status(
            httpStatus.BAD_REQUEST
        ).json({

            success: false,

            message: error.message,

        });

    }

};


// ======================================
// Download / Access File
// ======================================

export const downloadFile = async(
    req,
    res
) => {

    try {

        const {
            fileId,
        } = req.params;


        // ======================================
        // Access Check
        // ======================================

        const file =
            await getFileService({

                fileId,

                userId: req.user._id,

            });


        // ======================================
        // Redirect To Cloudinary
        // ======================================

        return res.redirect(
            file.url
        );


    } catch (error) {

        console.error(
            "Download File Error:",
            error
        );


        return res.status(
            httpStatus.BAD_REQUEST
        ).json({

            success: false,

            message: error.message,

        });

    }

};


// ======================================
// Get Meeting Files
// ======================================

export const recentFiles = async(
    req,
    res
) => {

    try {

        const {
            meetingCode,
        } = req.params;


        // ======================================
        // Find Meeting
        // ======================================

        const meeting =
            await Meeting.findOne({

                meetingCode: meetingCode.toUpperCase(),

            });


        if (!meeting) {

            return res.status(
                httpStatus.NOT_FOUND
            ).json({

                success: false,

                message: "Meeting not found",

            });

        }


        // ======================================
        // Check Participant
        // ======================================

        const isParticipant =
            meeting.participants.some(
                (participant) =>
                participant.equals(
                    req.user._id
                )
            );


        if (!isParticipant) {

            return res.status(
                httpStatus.FORBIDDEN
            ).json({

                success: false,

                message: "You are not authorized to access these files",

            });

        }


        // ======================================
        // Get Files
        // ======================================

        const files =
            await getRecentFiles(
                meetingCode
            );


        // ======================================
        // Response
        // ======================================

        return res.status(
            httpStatus.OK
        ).json({

            success: true,

            data: files,

        });


    } catch (error) {

        console.error(
            "Recent Files Error:",
            error
        );


        return res.status(
            httpStatus.BAD_REQUEST
        ).json({

            success: false,

            message: error.message,

        });

    }

};