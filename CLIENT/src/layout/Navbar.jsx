import { useState } from "react";
import NotificationBell from "../components/NotificationBell";
import NotificationPanel from "../components/NotificationPanel";
import useNotification from "../hooks/useNotification";

const Navbar = () => {

    const [showNotifications, setShowNotifications] = useState(false);

    const {
        notifications,
        unreadCount,
        markAllRead,
        clearNotifications,
    } = useNotification();

    return (
        <nav className="flex justify-between items-center p-4 bg-gray-900">

            {/* Logo */}
            <h1 className="text-xl font-bold text-white">
                Meeting Room
            </h1>

            {/* Right Side */}
            <div className="flex items-center gap-4">

                <div className="relative">

                    <NotificationBell
                        unreadCount={unreadCount}
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            markAllRead();
                        }}
                    />

                    {
                        showNotifications && (
                            <NotificationPanel
                                notifications={notifications}
                                markAllRead={markAllRead}
                                clearNotifications={clearNotifications}
                            />
                        )
                    }

                </div>

            </div>

        </nav>
    );

};

export default Navbar;