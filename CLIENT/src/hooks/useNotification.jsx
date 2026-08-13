import { useEffect, useState } from "react";

import socket from "../services/socket";

import {
    successToast,
    errorToast,
    warningToast,
    infoToast,
} from "../utils/toast";

const MAX_NOTIFICATIONS = 50;

const useNotification = () => {

    // =====================================
    // State
    // =====================================

    const [notifications, setNotifications] = useState([]);

    const [unreadCount, setUnreadCount] = useState(0);


    // =====================================
    // Listen Notifications
    // =====================================

    useEffect(() => {

        const handleNotification = (notification) => {

            setNotifications((prev) => {

                const updated = [

                    notification,

                    ...prev,

                ];

                return updated.slice(
                    0,
                    MAX_NOTIFICATIONS
                );

            });


            setUnreadCount((prev) => prev + 1);


            // =====================================
            // Notification Toast
            // =====================================

            switch (notification.type) {

                case "USER_JOINED":

                    infoToast(
                        notification.message
                    );

                    break;


                case "USER_LEFT":

                    warningToast(
                        notification.message
                    );

                    break;


                case "NEW_MESSAGE":

                    successToast(
                        notification.message
                    );

                    break;


                case "FILE_UPLOADED":

                    successToast(
                        notification.message
                    );

                    break;


                case "RAISE_HAND":

                    infoToast(
                        notification.message
                    );

                    break;


                case "HOST_ACTION":

                    warningToast(
                        notification.message
                    );

                    break;


                case "WAITING_ROOM":

                    infoToast(
                        notification.message
                    );

                    break;


                case "REACTION":

    infoToast(
        notification.message
    );

    break;


                default:

                    infoToast(
                        notification.message
                    );

            }

        };


        socket.on(
            "notification",
            handleNotification
        );


        return () => {

            socket.off(
                "notification",
                handleNotification
            );

        };

    }, []);


    // =====================================
    // Remove Raise Hand Notification
    // =====================================

    useEffect(() => {

        const handleRemoveRaiseHandNotification = ({
            socketId,
            userId,
        }) => {

            setNotifications((prev) => {

                // =====================================
                // Find notifications to remove
                // =====================================

                const notificationsToRemove =
                    prev.filter((notification) => {

                        if (
                            notification.type !==
                            "RAISE_HAND"
                        ) {

                            return false;

                        }


                        const sameSocket =
                            socketId &&
                            notification.socketId ===
                            socketId;


                        const sameUser =
                            userId &&
                            notification.userId ===
                            userId;


                        return (
                            sameSocket ||
                            sameUser
                        );

                    });


                // =====================================
                // Nothing Found
                // =====================================

                if (
                    notificationsToRemove.length === 0
                ) {

                    return prev;

                }


                // =====================================
                // Update Unread Count
                // =====================================

                setUnreadCount((prevCount) => {

                    return Math.max(
                        0,
                        prevCount -
                        notificationsToRemove.length
                    );

                });


                // =====================================
                // Remove Notification
                // =====================================

                return prev.filter((notification) => {

                    if (
                        notification.type !==
                        "RAISE_HAND"
                    ) {

                        return true;

                    }


                    const sameSocket =
                        socketId &&
                        notification.socketId ===
                        socketId;


                    const sameUser =
                        userId &&
                        notification.userId ===
                        userId;


                    return !(
                        sameSocket ||
                        sameUser
                    );

                });

            });

        };


        socket.on(
            "raise-hand-notification-removed",
            handleRemoveRaiseHandNotification
        );


        return () => {

            socket.off(
                "raise-hand-notification-removed",
                handleRemoveRaiseHandNotification
            );

        };

    }, []);


    // =====================================
    // Mark All Read
    // =====================================

    const markAllRead = () => {

        setUnreadCount(0);

    };


    // =====================================
    // Clear Notifications
    // =====================================

    const clearNotifications = () => {

        setNotifications([]);

        setUnreadCount(0);

    };


    // =====================================
    // Return
    // =====================================

    return {

        notifications,

        unreadCount,

        markAllRead,

        clearNotifications,

    };

};

export default useNotification;