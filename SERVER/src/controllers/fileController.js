import httpStatus from "http-status";
import { uploadFileService, getFileService, deleteFileService, renameFileService, increaseDownloadCount, getRecentFiles } from "../services/fileService.js";
import { getIO } from "../socket/socketManager.js";
import { logFileActivity } from "../services/fileService.js";
import { getFileHistory } from "../services/fileService.js";


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

        // Socket Broadcast
        const io = getIO();

        io.to(meetingId).emit(
            "file-uploaded",
            savedFile
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

        // ===========================
        // Socket Broadcast
        // ===========================

        const io = getIO();

        io.to(file.meeting.toString()).emit(
            "file-deleted", {
                fileId: file._id,
            }
        );

        return res.status(200).json({

            success: true,

            message: "File deleted successfully",

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message,

        });

    }

};
export const renameFile = async(req, res) => {

    try {

        const {

            fileId

        } = req.params;

        const {

            newName

        } = req.body;

        const file =

            await renameFileService({

                fileId,

                userId: req.user._id,

                newName,

            });

        const io = getIO();

        io.to(

            file.meeting.toString()

        ).emit(

            "file-renamed",

            file

        );

        return res.status(200).json({

            success: true,

            data: file

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

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