import WaitingUserCard from "./WaitingUserCard";


const WaitingRoomSidebar = ({
    waitingUsers,
    approveUser,
    rejectUser,
     isHost,
}) => {

     if (!isHost) {

        return null;

    }

    return (

        <div
            className="
                flex
                flex-col

                w-full
                h-full

                bg-gray-950

                text-white

                overflow-hidden
            "
        >

            {/* =================================
                Header
            ================================= */}

            <div
                className="
                    shrink-0

                    px-4
                    sm:px-5

                    py-4

                    border-b
                    border-white/10

                    bg-gray-900/90
                    backdrop-blur-md
                "
            >

                <div
                    className="
                        flex
                        items-center
                        justify-between
                    "
                >

                    <div>

                        <h2
                            className="
                                text-base
                                sm:text-lg

                                font-bold
                            "
                        >
                            Waiting Room
                        </h2>

                        <p
                            className="
                                mt-0.5

                                text-xs

                                text-gray-500
                            "
                        >
                            {waitingUsers.length}{" "}
                            {waitingUsers.length === 1
                                ? "person"
                                : "people"}{" "}
                            waiting
                        </p>

                    </div>


                    {/* Waiting Count */}

                    <div
                        className="
                            min-w-8
                            h-8

                            px-2

                            rounded-full

                            bg-yellow-500/10

                            border
                            border-yellow-500/20

                            flex
                            items-center
                            justify-center

                            text-yellow-400

                            text-sm
                            font-semibold
                        "
                    >
                        {waitingUsers.length}
                    </div>

                </div>

            </div>


            {/* =================================
                Waiting Users
            ================================= */}

            <div
                className="
                    flex-1
                    min-h-0

                    overflow-y-auto
                    overflow-x-hidden

                    p-3
                    sm:p-4

                    space-y-2

                    scrollbar-hide
                "
            >

                {waitingUsers.length > 0 ? (

                    waitingUsers.map(
                        (user) => (

                            <WaitingUserCard

                                key={
                                    user.userId
                                }

                                user={
                                    user
                                }

                                approveUser={
                                    approveUser
                                }

                                rejectUser={
                                    rejectUser
                                }

                            />

                        )
                    )

                ) : (

                    <div
                        className="
                            h-full
                            min-h-40

                            flex
                            flex-col
                            items-center
                            justify-center

                            text-center
                            px-6
                        "
                    >

                        <div
                            className="
                                w-12
                                h-12

                                rounded-full

                                bg-white/5

                                flex
                                items-center
                                justify-center

                                text-gray-500

                                mb-3
                            "
                        >
                            ⏳
                        </div>

                        <p
                            className="
                                text-sm
                                font-medium

                                text-gray-300
                            "
                        >
                            No one is waiting
                        </p>

                        <p
                            className="
                                mt-1

                                text-xs

                                text-gray-500
                            "
                        >
                            New join requests will appear here.
                        </p>

                    </div>

                )}

            </div>

        </div>

    );

};


export default WaitingRoomSidebar;