import cloudinary from "../config/cloudinary.js";

import File from "../models/fileModel.js";

import Meeting from "../models/meetingModel.js";


// ======================================
// Find Meeting By Code
// ======================================

const findMeetingByCode = async(
    meetingCode
) => {

    if (!meetingCode) {

        throw new Error(
            "Meeting code is required"
        );

    }

    const meeting =
        await Meeting.findOne({

            meetingCode: meetingCode.toUpperCase(),

        });


    if (!meeting) {

        throw new Error(
            "Meeting not found"
        );

    }


    return meeting;

};


// ======================================
// Check Meeting Participant
// ======================================

const checkParticipant = (
    meeting,
    userId
) => {

    return meeting.participants.some(
        (participant) =>
        participant.equals(userId)
    );

};


// ======================================
// Upload File
// ======================================

export const uploadFileService = async({
    meetingCode,
    uploadedBy,
    file,
}) => {

    // ======================================
    // Find Meeting
    // ======================================

    const meeting =
        await findMeetingByCode(
            meetingCode
        );


    // ======================================
    // Check Meeting Active
    // ======================================

    // ======================================
    // Check Meeting Status
    // ======================================

    if (meeting.status === "ended") {

        throw new Error(
            "Meeting has ended"
        );

    }


    // ======================================
    // Check Participant
    // ======================================

    const isParticipant =
        checkParticipant(
            meeting,
            uploadedBy
        );


    if (!isParticipant) {

        throw new Error(
            "You are not a participant of this meeting"
        );

    }


    // ======================================
    // Check File
    // ======================================

    if (!file) {

        throw new Error(
            "Please upload a file"
        );

    }


    // ======================================
    // Detect File Type
    // ======================================

    let fileType = "other";


    if (
        file.mimetype.startsWith("image/")
    ) {

        fileType = "image";

    } else if (
        file.mimetype.startsWith("video/")
    ) {

        fileType = "video";

    } else if (
        file.mimetype.startsWith("audio/")
    ) {

        fileType = "audio";

    } else if (
        file.mimetype ===
        "application/pdf"
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
    // Save File
    // ======================================

    const savedFile =
        await File.create({

            meeting: meeting._id,

            uploadedBy,

            fileName: file.filename,

            originalName: file.originalname,

            url: file.path,

            public_id: file.filename,

            mimeType: file.mimetype,

            fileSize: file.size,

            fileType,

        });


    // ======================================
    // Populate Uploader
    // ======================================

    await savedFile.populate({

        path: "uploadedBy",

        select: "name username profilePicture",

    });


    return savedFile;

};


// ======================================
// Get Single File
// ======================================

export const getFileService = async({
    fileId,
    userId,
}) => {

    // ======================================
    // Find File
    // ======================================

    const file =
        await File.findById(
            fileId
        ).populate(
            "uploadedBy",
            "name username profilePicture"
        );


    if (!file) {

        throw new Error(
            "File not found"
        );

    }


    // ======================================
    // Deleted File Check
    // ======================================

    if (file.isDeleted) {

        throw new Error(
            "File has been deleted"
        );

    }


    // ======================================
    // Find Meeting
    // ======================================

    const meeting =
        await Meeting.findById(
            file.meeting
        );


    if (!meeting) {

        throw new Error(
            "Meeting not found"
        );

    }


    // ======================================
    // Participant Access
    // ======================================

    const isParticipant =
        checkParticipant(
            meeting,
            userId
        );


    if (!isParticipant) {

        throw new Error(
            "You are not authorized to access this file"
        );

    }


    return file;

};


// ======================================
// Delete File
// ======================================

export const deleteFileService = async({
    fileId,
    userId,
}) => {

    // ======================================
    // Find File
    // ======================================

    const file =
        await File.findById(
            fileId
        );


    if (!file) {

        throw new Error(
            "File not found"
        );

    }


    // ======================================
    // Already Deleted
    // ======================================

    if (file.isDeleted) {

        throw new Error(
            "File already deleted"
        );

    }


    // ======================================
    // Owner Check
    // ======================================

    const isOwner =
        file.uploadedBy.toString() ===
        userId.toString();


    if (!isOwner) {

        throw new Error(
            "Only the file owner can delete this file"
        );

    }


    // ======================================
    // Delete Cloudinary File
    // ======================================

    await cloudinary.uploader.destroy(
        file.public_id
    );


    // ======================================
    // Soft Delete
    // ======================================

    file.isDeleted = true;

    await file.save();


    return file;

};


// ======================================
// Get All Meeting Files
// ======================================

export const getRecentFiles = async(
    meetingCode
) => {

    // ======================================
    // Find Meeting
    // ======================================

    const meeting =
        await findMeetingByCode(
            meetingCode
        );


    // ======================================
    // Get Files
    // ======================================

    const files =
        await File.find({

            meeting: meeting._id,

            isDeleted: false,

        })
        .sort({

            createdAt: 1,

        })
        .populate(

            "uploadedBy",

            "name username profilePicture"

        );


    return files;

};