import { useEffect, useState } from "react";

import socket from "../socket/socket";
import {

successToast,

errorToast,

warningToast,

infoToast,

} from "../utils/toast";

const MAX_NOTIFICATIONS = 50;

const useNotification = () => {

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

        return updated.slice(0, MAX_NOTIFICATIONS);

    });

    setUnreadCount((prev) => prev + 1);

    switch (notification.type) {

        case "USER_JOINED":

            infoToast(notification.message);

            break;

        case "USER_LEFT":

            warningToast(notification.message);

            break;

        case "NEW_MESSAGE":

            successToast(notification.message);

            break;

        case "FILE_UPLOADED":

            successToast(notification.message);

            break;

        case "RAISE_HAND":

            infoToast(notification.message);

            break;

        case "HOST_ACTION":

            warningToast(notification.message);

            break;

        case "WAITING_ROOM":

            infoToast(notification.message);

            break;

        default:

            infoToast(notification.message);

    }

};

        socket.on("notification", handleNotification);

        return () => {

            socket.off("notification", handleNotification);

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

    return {

        notifications,

        unreadCount,

        markAllRead,

        clearNotifications,

    };

};

export default useNotification;