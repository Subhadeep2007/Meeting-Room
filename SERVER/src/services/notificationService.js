// ======================================
// Notification Types
// ======================================

export const NotificationType = {

    USER_JOINED: "USER_JOINED",

    USER_LEFT: "USER_LEFT",

    NEW_MESSAGE: "NEW_MESSAGE",

    FILE_UPLOADED: "FILE_UPLOADED",
    FILE_DELETED: "FILE_DELETED",

    RAISE_HAND: "RAISE_HAND",

    HOST_ACTION: "HOST_ACTION",

    WAITING_ROOM: "WAITING_ROOM",
    REACTION: "REACTION",

};

// ======================================
// Create Notification
// ======================================

export const createNotification = (

    type,

    title,

    message,

    data = {}

) => {

    return {

        id: crypto.randomUUID(),

        type,

        title,

        message,

        data,

        createdAt: new Date(),

    };

};