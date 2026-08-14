import React, { useRef } from "react";

const FilePanel = ({
    files = [],
    uploadMeetingFile,
    deleteMeetingFile,
    uploadProgress = 0,
    isUploadingFile = false,
    currentUserId,
}) => {

    const fileInputRef = useRef(null);

    // ======================================
    // Select File
    // ======================================

    const handleSelectFile = () => {

        if (isUploadingFile) {
            return;
        }

        fileInputRef.current?.click();

    };


    // ======================================
    // Upload File
    // ======================================

    const handleFileChange = async (event) => {

        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        try {

            await uploadMeetingFile(file);

        } catch (error) {

            console.error(
                "File upload failed:",
                error
            );

        }

        // Allow same file to be selected again
        event.target.value = "";

    };


    // ======================================
    // Delete File
    // ======================================

    const handleDelete = async (fileId) => {

        try {

            await deleteMeetingFile(fileId);

        } catch (error) {

            console.error(
                "File delete failed:",
                error
            );

        }

    };


    // ======================================
    // Format Size
    // ======================================

    const formatFileSize = (size) => {

        if (!size) {
            return "0 KB";
        }

        if (size < 1024) {
            return `${size} B`;
        }

        if (size < 1024 * 1024) {
            return `${(size / 1024).toFixed(1)} KB`;
        }

        return `${(size / (1024 * 1024)).toFixed(1)} MB`;

    };


    // ======================================
    // Image Check
    // ======================================

    const isImage = (file) => {

        return (
            file.fileType === "image" ||
            file.mimeType?.startsWith("image/")
        );

    };


    return (

        <div className="w-full h-full flex flex-col bg-gray-900 text-white">

            {/* ======================================
                Header
            ====================================== */}

            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">

                <div>

                    <h2 className="font-semibold text-lg">
                        Files
                    </h2>

                    <p className="text-xs text-gray-400">
                        {files.length} file
                        {files.length !== 1 ? "s" : ""}
                    </p>

                </div>


                <button

                    type="button"

                    onClick={handleSelectFile}

                    disabled={isUploadingFile}

                    className="
                        px-3
                        py-2
                        rounded-md
                        bg-blue-600
                        hover:bg-blue-700
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                        text-sm
                    "

                >
                    Upload
                </button>


                <input

                    ref={fileInputRef}

                    type="file"

                    className="hidden"

                    onChange={handleFileChange}

                    accept="
                        image/*,
                        video/*,
                        audio/*,
                        application/pdf,
                        .doc,
                        .docx,
                        .xls,
                        .xlsx,
                        .ppt,
                        .pptx
                    "

                />

            </div>


            {/* ======================================
                Upload Progress
            ====================================== */}

            {isUploadingFile && (

                <div className="px-4 py-3 border-b border-gray-700">

                    <div className="flex justify-between text-xs mb-1">

                        <span className="text-gray-400">
                            Uploading...
                        </span>

                        <span>
                            {uploadProgress}%
                        </span>

                    </div>


                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">

                        <div

                            className="
                                h-full
                                bg-blue-500
                                transition-all
                            "

                            style={{
                                width: `${uploadProgress}%`,
                            }}

                        />

                    </div>

                </div>

            )}


            {/* ======================================
                File List
            ====================================== */}

            <div className="flex-1 overflow-y-auto p-3">

                {files.length === 0 ? (

                    <div className="h-full flex items-center justify-center text-gray-500 text-sm">

                        No files shared yet.

                    </div>

                ) : (

                    <div className="space-y-3">

                        {files.map((file) => {

                            const isOwner =
                                file.uploadedBy?._id?.toString() ===
                                currentUserId?.toString();


                            return (

                                <div

                                    key={file._id}

                                    className="
                                        rounded-lg
                                        border
                                        border-gray-700
                                        bg-gray-800
                                        p-3
                                    "

                                >

                                    {/* ======================================
                                        Image Preview
                                    ====================================== */}

                                    {isImage(file) && (

                                        <img

                                            src={file.url}

                                            alt={file.originalName}

                                            className="
                                                w-full
                                                max-h-48
                                                object-contain
                                                rounded-md
                                                mb-3
                                                bg-gray-900
                                            "

                                        />

                                    )}


                                    {/* ======================================
                                        File Information
                                    ====================================== */}

                                    <div className="flex items-start gap-3">

                                        <div className="flex-1 min-w-0">

                                            <p className="font-medium truncate">

                                                {file.originalName}

                                            </p>


                                            <p className="text-xs text-gray-400 mt-1">

                                                {formatFileSize(
                                                    file.fileSize
                                                )}

                                            </p>


                                            {file.uploadedBy && (

                                                <p className="text-xs text-gray-500 mt-1">

                                                    By{" "}

                                                    {
                                                        file.uploadedBy.username ||
                                                        file.uploadedBy.name ||
                                                        "User"
                                                    }

                                                </p>

                                            )}

                                        </div>


                                        {/* ======================================
                                            Actions
                                        ====================================== */}

                                        <div className="flex items-center gap-2">

                                            <a

                                                href={file.url}

                                                target="_blank"

                                                rel="noreferrer"

                                                className="
                                                    text-blue-400
                                                    hover:text-blue-300
                                                    text-sm
                                                "

                                            >
                                                Open
                                            </a>


                                            {isOwner && (

                                                <button

                                                    type="button"

                                                    onClick={() =>
                                                        handleDelete(
                                                            file._id
                                                        )
                                                    }

                                                    className="
                                                        text-red-400
                                                        hover:text-red-300
                                                        text-sm
                                                    "

                                                >
                                                    Delete

                                                </button>

                                            )}

                                        </div>

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                )}

            </div>

        </div>

    );

};

export default FilePanel;