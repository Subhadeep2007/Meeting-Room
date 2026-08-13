const NotificationPanel = ({

    notifications,

    markAllRead,

    clearNotifications,

}) => {

    return (

        <div
            className="
                absolute
                right-0
                top-full
                mt-2

                w-[calc(100vw-1rem)]
                max-w-[24rem]

                bg-gray-900
                text-white

                rounded-xl
                shadow-2xl

                border
                border-gray-700

                overflow-hidden

                z-50
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
                    gap-3

                    px-4
                    py-3

                    border-b
                    border-gray-700
                "
            >

                <h2
                    className="
                        font-semibold
                        text-base
                        sm:text-lg
                        whitespace-nowrap
                    "
                >
                    Notifications
                </h2>


                <div
                    className="
                        flex
                        items-center
                        gap-3
                        shrink-0
                    "
                >

                    <button
                        type="button"
                        onClick={markAllRead}
                        className="
                            text-xs
                            sm:text-sm
                            text-blue-400
                            hover:text-blue-300
                            transition
                            whitespace-nowrap
                        "
                    >
                        Read
                    </button>


                    <button
                        type="button"
                        onClick={clearNotifications}
                        className="
                            text-xs
                            sm:text-sm
                            text-red-400
                            hover:text-red-300
                            transition
                            whitespace-nowrap
                        "
                    >
                        Clear
                    </button>

                </div>

            </div>


            {/* =====================================
                Notification List
            ===================================== */}

            <div
                className="
                    max-h-[70vh]
                    sm:max-h-96

                    overflow-y-auto
                    overscroll-contain
                "
            >

                {

                    notifications.length === 0 ? (

                        <div
                            className="
                                px-5
                                py-10
                                text-center
                                text-gray-400
                                text-sm
                            "
                        >

                            No Notifications

                        </div>

                    ) : (

                        notifications.map(

                            (notification) => (

                                <div
                                    key={
                                        notification.id
                                    }
                                    className="
                                        px-4
                                        py-3

                                        border-b
                                        border-gray-800

                                        hover:bg-gray-800/70

                                        transition

                                        break-words
                                    "
                                >

                                    {/* =================================
                                        Title
                                    ================================= */}

                                    <div
                                        className="
                                            font-semibold
                                            text-sm
                                            sm:text-base

                                            text-white

                                            break-words
                                            leading-5
                                        "
                                    >

                                        {notification.title}

                                    </div>


                                    {/* =================================
                                        Message
                                    ================================= */}

                                    <div
                                        className="
                                            mt-1

                                            text-xs
                                            sm:text-sm

                                            text-gray-400

                                            break-words
                                            whitespace-normal

                                            leading-5
                                        "
                                    >

                                        {notification.message}

                                    </div>


                                    {/* =================================
                                        Time
                                    ================================= */}

                                    <div
                                        className="
                                            mt-1.5

                                            text-[10px]
                                            sm:text-xs

                                            text-gray-500
                                        "
                                    >

                                        {
                                            new Date(
                                                notification.createdAt
                                            ).toLocaleTimeString()
                                        }

                                    </div>

                                </div>

                            )

                        )

                    )

                }

            </div>

        </div>

    );

};


export default NotificationPanel;