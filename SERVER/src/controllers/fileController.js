import httpStatus from "http-status";
import { uploadFileService, getFileService, deleteFileService, renameFileService, increaseDownloadCount, getRecentFiles } from "../services/fileService.js";
import { getIO } from "../socket/socketManager.js";
import { logFileActivity } from "../services/fileService.js";
import { getFileHistory } from "../services/fileService.js";
import Meeting from "../models/meetingModel.js";

import {
    createNotification,
    NotificationType,
} from "../services/notificationService.js";


export const uploadFile = async(req, res) => {

    try {

        const { meetingId } = req.body;

        const uploadedBy = req.user._id;

        const file = req.file;

        const savedFile = await uploadFileService({

            meetingId,
            uploadedBy,
            file,

        });

        // ======================================
        // Get Meeting
        // ======================================

        const meeting = await Meeting.findById(meetingId);

        if (!meeting) {

            return res.status(httpStatus.NOT_FOUND).json({

                success: false,

                message: "Meeting not found",

            });

        }

        // ======================================
        // Socket Broadcast
        // ======================================

        const io = getIO();

        io.to(meeting.meetingCode).emit(

            "file-uploaded",

            savedFile

        );

        // ======================================
        // Notification
        // ======================================

        const notification = createNotification(

            NotificationType.FILE_UPLOADED,

            "File Uploaded",

            `${req.user.username} uploaded "${savedFile.originalName}".`,

            {

                meetingId,

                fileId: savedFile._id,

            }

        );

        io.to(meeting.meetingCode).emit(

            "notification",

            notification

        );

        return res.status(httpStatus.CREATED).json({

            success: true,
            message: "File uploaded successfully",
            data: savedFile,

        });

    } catch (error) {

        return res.status(httpStatus.BAD_REQUEST).json({

            success: false,
            message: error.message,

        });

    }


};



export const getFile = async(req, res) => {

    try {

        const { fileId } = req.params;

        const file = await getFileService({

            fileId,

            userId: req.user._id,

        });

        return res.status(200).json({

            success: true,

            data: file,

        });

    } catch (error) {

        return res.status(404).json({

            success: false,

            message: error.message,

        });

    }

};

export const deleteFile = async(req, res) => {

    try {

        const { fileId } = req.params;

        const file = await deleteFileService({

            fileId,

            userId: req.user._id,

        });

        // =====================================
        // Get Meeting
        // =====================================

        const meeting = await Meeting.findById(file.meeting);

        if (!meeting) {

            return res.status(httpStatus.NOT_FOUND).json({

                success: false,

                message: "Meeting not found",

            });

        }

        const io = getIO();

        // =====================================
        // Socket Broadcast
        // =====================================

        io.to(meeting.meetingCode).emit(

            "file-deleted",

            {

                fileId: file._id,

            }

        );

        // =====================================
        // Notification
        // =====================================

        const notification = createNotification(

            NotificationType.FILE_UPLOADED,

            "File Deleted",

            `${req.user.username} deleted "${file.originalName}".`,

            {

                meetingId: meeting._id,

                fileId: file._id,

            }

        );

        io.to(meeting.meetingCode).emit(

            "notification",

            notification

        );

        return res.status(httpStatus.OK).json({

            success: true,

            message: "File deleted successfully",

        });

    } catch (error) {

        console.error(error);

        return res.status(httpStatus.BAD_REQUEST).json({

            success: false,

            message: error.message,

        });

    }

};


export const renameFile = async(req, res) => {

    try {

        const { fileId } = req.params;

        const { newName } = req.body;

        const file = await renameFileService({

            fileId,

            userId: req.user._id,

            newName,

        });

        // =====================================
        // Get Meeting
        // =====================================

        const meeting = await Meeting.findById(file.meeting);

        if (!meeting) {

            return res.status(httpStatus.NOT_FOUND).json({

                success: false,

                message: "Meeting not found",

            });

        }

        const io = getIO();

        // =====================================
        // Socket Broadcast
        // =====================================

        io.to(meeting.meetingCode).emit(

            "file-renamed",

            file

        );

        // =====================================
        // Notification
        // =====================================

        const notification = createNotification(

            NotificationType.FILE_UPLOADED,

            "File Renamed",

            `${req.user.username} renamed file to "${file.originalName}".`,

            {

                meetingId: meeting._id,

                fileId: file._id,

            }

        );

        io.to(meeting.meetingCode).emit(

            "notification",

            notification

        );

        return res.status(httpStatus.OK).json({

            success: true,

            message: "File renamed successfully",

            data: file,

        });

    } catch (error) {

        console.error(error);

        return res.status(httpStatus.BAD_REQUEST).json({

            success: false,

            message: error.message,

        });

    }

};


export const downloadFile = async(req, res) => {

    try {

        const { fileId } = req.params;

        const file = await getFileService({

            fileId,

            userId: req.user._id,

        });

        await increaseDownloadCount(fileId);

        await logFileActivity({

            fileId,

            userId: req.user._id,

            action: "DOWNLOAD",

            ipAddress: req.ip,

            userAgent: req.headers["user-agent"],

        });

        return res.redirect(file.url);

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message,

        });

    }

};



export const fileHistory = async(req, res) => {

    try {

        const history = await getFileHistory(
            req.params.fileId
        );

        return res.status(200).json({

            success: true,

            data: history,

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message,

        });

    }

};
export const recentFiles = async(req, res) => {

    try {

        const { meetingId } = req.params;

        const files = await getRecentFiles(meetingId);

        return res.status(httpStatus.OK).json({

            success: true,

            data: files,

        });

    } catch (error) {

        console.error(error);

        return res.status(httpStatus.BAD_REQUEST).json({

            success: false,

            message: error.message,

        });

    }

};