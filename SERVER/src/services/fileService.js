import cloudinary from "../config/cloudinary.js";
import File from "../models/fileModel.js";
import Meeting from "../models/meetingModel.js";
import FileActivity from "../models/fileActivityModel.js";

export const uploadFileService = async({
    meetingId,
    uploadedBy,
    file,
}) => {

    // ======================================
    // Check Meeting
    // ======================================

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
        throw new Error("Meeting not found");
    }

    // ======================================
    // Check Meeting Active
    // ======================================

    if (!meeting.isActive) {
        throw new Error("Meeting has ended");
    }

    // ======================================
    // Check Participant
    // ======================================

    const isParticipant = meeting.participants.some(
        participant => participant.equals(uploadedBy)
    );

    if (!isParticipant) {
        throw new Error(
            "You are not a participant of this meeting"
        );
    }

    // ======================================
    // File Validation
    // ======================================

    if (!file) {
        throw new Error("Please upload a file");
    }

    // ======================================
    // Detect File Type
    // ======================================

    let fileType = "other";

    if (file.mimetype.startsWith("image/")) {
        fileType = "image";
    } else if (file.mimetype.startsWith("video/")) {
        fileType = "video";
    } else if (file.mimetype.startsWith("audio/")) {
        fileType = "audio";
    } else if (
        file.mimetype === "application/pdf"
    ) {
        fileType = "pdf";
    } else if (
        file.mimetype.includes("document") ||
        file.mimetype.includes("word") ||
        file.mimetype.includes("sheet") ||
        file.mimetype.includes("presentation")
    ) {
        fileType = "document";
    }

    // ======================================
    // Save Database
    // ======================================

    const savedFile = await File.create({

        meeting: meetingId,

        uploadedBy,

        fileName: file.filename,

        originalName: file.originalname,

        url: file.path,

        public_id: file.filename,

        mimeType: file.mimetype,

        fileSize: file.size,

        fileType,

    });

    await savedFile.populate({

        path: "uploadedBy",

        select: "name username profilePicture",

    });

    return savedFile;

};



export const getFileService = async({
    fileId,
    userId,
}) => {

    // ===============================
    // Find File
    // ===============================

    const file = await File.findById(fileId)
        .populate(
            "uploadedBy",
            "name username profilePicture"
        );

    if (!file) {
        throw new Error("File not found");
    }

    // ===============================
    // Soft Delete Check
    // ===============================

    if (file.isDeleted) {
        throw new Error("File has been deleted");
    }

    // ===============================
    // Meeting Check
    // ===============================

    const meeting = await Meeting.findById(file.meeting);

    if (!meeting) {
        throw new Error("Meeting not found");
    }

    // ===============================
    // Participant Check
    // ===============================

    const isParticipant = meeting.participants.some(
        participant => participant.equals(userId)
    );

    if (!isParticipant) {
        throw new Error(
            "You are not authorized to access this file"
        );
    }

    return file;

};


export const deleteFileService = async({
    fileId,
    userId,
}) => {

    // ===========================
    // Find File
    // ===========================

    const file = await File.findById(fileId);

    if (!file) {
        throw new Error("File not found");
    }

    if (file.isDeleted) {
        throw new Error("File already deleted");
    }

    // ===========================
    // Find Meeting
    // ===========================

    const meeting = await Meeting.findById(file.meeting);

    if (!meeting) {
        throw new Error("Meeting not found");
    }

    // ===========================
    // Permission Check
    // Owner OR Meeting Creator
    // ===========================

    const isOwner =
        file.uploadedBy.toString() === userId.toString();

    const isMeetingOwner =
        meeting.host.toString() === userId.toString();

    if (!isOwner && !isMeetingOwner) {
        throw new Error(
            "You are not allowed to delete this file"
        );
    }

    // ===========================
    // Delete From Cloudinary
    // ===========================

    await cloudinary.uploader.destroy(file.public_id);

    // ===========================
    // Soft Delete
    // ===========================

    file.isDeleted = true;

    await file.save();

    return file;

};



export const renameFileService = async({

    fileId,

    userId,

    newName,

}) => {

    const file = await File.findById(fileId);

    if (!file) {

        throw new Error("File not found");

    }

    if (file.isDeleted) {

        throw new Error("File already deleted");

    }

    const meeting = await Meeting.findById(file.meeting);

    const isOwner =
        file.uploadedBy.toString() === userId.toString();

    const isMeetingHost =
        meeting.host.toString() === userId.toString();

    if (!isOwner && !isMeetingHost) {

        throw new Error(
            "You are not allowed to rename this file"
        );

    }

    file.originalName = newName;

    await file.save();

    return file;

};

export const increaseDownloadCount = async(fileId) => {

    const file =

        await File.findById(fileId);

    if (!file) {

        throw new Error("File not found");

    }

    file.downloadCount++;

    file.lastDownloadedAt = new Date();

    await file.save();

    return file;

};
export const getRecentFiles = async(meetingId) => {

    const files =

        await File.find({

            meeting: meetingId,

            isDeleted: false,

        })

    .sort({

        createdAt: -1

    })

    .limit(20)

    .populate(

        "uploadedBy",

        "name username profilePicture"

    );

    return files;

};


export const logFileActivity = async({

    fileId,

    userId,

    action,

    ipAddress,

    userAgent,

}) => {

    await FileActivity.create({

        file: fileId,

        user: userId,

        action,

        ipAddress,

        userAgent,

    });

};


// ======================================
// File History
// ======================================

export const getFileHistory = async(fileId) => {

    return await FileActivity.find({

        file: fileId,

    })

    .populate(

        "user",

        "name username profilePicture"

    )

    .sort({

        createdAt: -1,

    });

};