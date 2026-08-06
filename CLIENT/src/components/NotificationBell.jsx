import { Bell } from "lucide-react";

const NotificationBell = ({

    unreadCount,

    onClick,

}) => {

    return (

        <button

            onClick={onClick}

            className="relative"

        >

            <Bell size={24} />

            {

                unreadCount > 0 && (

                    <span

                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"

                    >

                        {

                            unreadCount > 99

                                ? "99+"

                                : unreadCount

                        }

                    </span>

                )

            }

        </button>

    );

};

export default NotificationBell;