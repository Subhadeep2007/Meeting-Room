import {
    createNotification,
    NotificationType,
} from "../services/notificationService.js";

const registerNotificationEvents = (io, socket) => {

    // ==========================================
    // Generic Notification
    // ==========================================

    socket.on(
        "notify",
        ({
                meetingCode,
                type,
                title,
                message,
                data = {},
            },
            callback
        ) => {

            try {

                const notification = createNotification(
                    type,
                    title,
                    message,
                    data
                );

                io.to(meetingCode).emit(
                    "notification",
                    notification
                );

                if (callback) {
                    return callback({
                        success: true,
                    });
                }

            } catch (error) {

                console.error("Notification Error:", error);

                if (callback) {
                    return callback({
                        success: false,
                        message: error.message,
                    });
                }

            }

        }
    );

};

export default registerNotificationEvents;