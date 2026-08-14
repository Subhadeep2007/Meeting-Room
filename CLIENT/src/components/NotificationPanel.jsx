const NotificationPanel = ({
    notifications,
    markAllRead,
    clearNotifications,
}) => {

    return (

        <div
            className="
               absolute
        left-1/2
        top-full
        mt-3
        -translate-x-1/2

                w-[calc(100vw-1rem)]
                sm:w-[24rem]

                max-w-[24rem]

                bg-gray-950
                text-white

                rounded-2xl
                shadow-2xl

                border
                border-gray-800

                overflow-hidden

                z-[100]
            "
        >

            {/* =====================================
                Header
            ===================================== */}

            <div
                className="
                    flex
                    items-center
                    justify-between

                    px-4
                    py-3

                    bg-gray-900

                    border-b
                    border-gray-800
                "
            >

                <div className="flex items-center gap-2">

                    <span className="text-lg">
                        🔔
                    </span>

                    <h2
                        className="
                            font-semibold
                            text-base
                            sm:text-lg
                        "
                    >
                        Notifications
                    </h2>

                    {notifications.length > 0 && (

                        <span
                            className="
                                min-w-5
                                h-5
                                px-1.5

                                flex
                                items-center
                                justify-center

                                rounded-full

                                bg-blue-600
                                text-white

                                text-[10px]
                                font-semibold
                            "
                        >
                            {notifications.length}
                        </span>

                    )}

                </div>


                {/* Clear Button */}

                {notifications.length > 0 && (

                    <button
                        type="button"
                        onClick={clearNotifications}
                        className="
                            text-xs
                            sm:text-sm

                            text-red-400

                            hover:text-red-300
                            hover:bg-red-500/10

                            px-2
                            py-1

                            rounded-lg

                            transition
                        "
                    >
                        Clear
                    </button>

                )}

            </div>


            {/* =====================================
                Notification List
            ===================================== */}

            <div
                className="
                    max-h-[65vh]
                    sm:max-h-96

                    overflow-y-auto

                    overscroll-contain

                    scrollbar-thin
                    scrollbar-thumb-gray-700
                    scrollbar-track-transparent
                "
            >

                {notifications.length === 0 ? (

                    /* Empty State */

                    <div
                        className="
                            px-5
                            py-12

                            flex
                            flex-col
                            items-center
                            justify-center

                            text-center
                        "
                    >

                        <div
                            className="
                                w-14
                                h-14

                                rounded-full

                                bg-gray-800

                                flex
                                items-center
                                justify-center

                                text-2xl

                                mb-3
                            "
                        >
                            🔔
                        </div>

                        <p
                            className="
                                text-sm
                                font-medium
                                text-gray-300
                            "
                        >
                            No Notifications
                        </p>

                        <p
                            className="
                                mt-1
                                text-xs
                                text-gray-500
                            "
                        >
                            You're all caught up
                        </p>

                    </div>

                ) : (

                    notifications.map((notification) => (

                        <div
                            key={notification.id}
                            className="
                                px-4
                                py-3.5

                                border-b
                                border-gray-800

                                hover:bg-gray-900

                                transition

                                break-words
                            "
                        >

                            {/* Title */}

                            <div
                                className="
                                    flex
                                    items-start
                                    gap-3
                                "
                            >

                                <div
                                    className="
                                        mt-0.5

                                        w-8
                                        h-8

                                        shrink-0

                                        rounded-full

                                        bg-blue-500/10

                                        flex
                                        items-center
                                        justify-center

                                        text-sm
                                    "
                                >
                                    🔔
                                </div>


                                <div
                                    className="
                                        min-w-0
                                        flex-1
                                    "
                                >

                                    <div
                                        className="
                                            font-semibold
                                            text-sm

                                            text-white

                                            leading-5

                                            break-words
                                        "
                                    >
                                        {notification.title}
                                    </div>


                                    {/* Message */}

                                    <div
                                        className="
                                            mt-1

                                            text-xs
                                            sm:text-sm

                                            text-gray-400

                                            leading-5

                                            break-words
                                            whitespace-normal
                                        "
                                    >
                                        {notification.message}
                                    </div>


                                    {/* Time */}

                                    <div
                                        className="
                                            mt-2

                                            text-[10px]
                                            sm:text-xs

                                            text-gray-500
                                        "
                                    >
                                        {new Date(
                                            notification.createdAt
                                        ).toLocaleTimeString(
                                            [],
                                            {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }
                                        )}
                                    </div>

                                </div>

                            </div>

                        </div>

                    ))

                )}

            </div>

        </div>

    );
};

export default NotificationPanel;