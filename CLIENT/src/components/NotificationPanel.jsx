const NotificationPanel = ({

    notifications,

    markAllRead,

    clearNotifications,

}) => {

    return (

        <div

            className="absolute right-0 mt-2 w-96 bg-gray-900 rounded-lg shadow-lg border border-gray-700"

        >

            <div className="flex justify-between items-center p-4 border-b border-gray-700">

                <h2 className="font-bold">

                    Notifications

                </h2>

                <div className="flex gap-2">

                    <button

                        onClick={markAllRead}

                        className="text-blue-400"

                    >

                        Read

                    </button>

                    <button

                        onClick={clearNotifications}

                        className="text-red-400"

                    >

                        Clear

                    </button>

                </div>

            </div>

            <div className="max-h-96 overflow-y-auto">

                {

                    notifications.length === 0 ? (

                        <div className="p-5 text-center text-gray-400">

                            No Notifications

                        </div>

                    ) : (

                        notifications.map(

                            (notification) => (

                                <div

                                    key={notification.id}

                                    className="border-b border-gray-800 p-4"

                                >

                                    <div className="font-semibold">

                                        {notification.title}

                                    </div>

                                    <div className="text-sm text-gray-400">

                                        {notification.message}

                                    </div>

                                    <div className="text-xs text-gray-500 mt-1">

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