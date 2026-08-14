import api from "./api";


// ======================================
// Upload File
// ======================================

export const uploadFile = async (
    meetingCode,
    file,
    onProgress
) => {

    try {

        const formData = new FormData();

        formData.append(
            "meetingCode",
            meetingCode
        );

        formData.append(
            "file",
            file
        );

        const response = await api.post(
            "/files/upload",
            formData,
            {
                onUploadProgress: (event) => {

                    if (
                        event.total &&
                        onProgress
                    ) {

                        const progress =
                            Math.round(
                                (event.loaded * 100) /
                                event.total
                            );

                        onProgress(progress);

                    }

                },
            }
        );

        return response.data;

    } catch (error) {

        // 👇 YAHAN PASTE KARO

        console.error(
            "❌ FILE UPLOAD BACKEND ERROR:",
            error.response?.data
        );

        console.error(
            "❌ STATUS:",
            error.response?.status
        );

        throw error;

    }

};
// ======================================
// Get Meeting Files
// ======================================

export const getMeetingFiles = async (
    meetingCode
) => {

    const response = await api.get(

        `/files/recent/${meetingCode}`

    );

    return response.data;

};


// ======================================
// Get Single File
// ======================================

export const getFile = async (
    fileId
) => {

    const response = await api.get(

        `/files/${fileId}`

    );

    return response.data;

};


// ======================================
// Download File
// ======================================

export const downloadFile = (
    fileId
) => {

    return `/api/files/download/${fileId}`;

};


// ======================================
// Delete File
// ======================================

export const deleteFile = async (
    fileId
) => {

    const response = await api.delete(

        `/files/${fileId}`

    );

    return response.data;

};