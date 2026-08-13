const WaitingUserCard = ({
    user,
    approveUser,
    rejectUser,
}) => {

    return (

        <div
            className="
                flex
                flex-col
                sm:flex-row

                sm:items-center
                sm:justify-between

                gap-3

                w-full

                p-3
                sm:p-3.5

                rounded-xl

                bg-gray-800/80

                border
                border-white/5

                hover:bg-gray-800

                transition
            "
        >

            {/* ==========================
                User Information
            ========================== */}

            <div
                className="
                    flex
                    items-center
                    gap-3

                    min-w-0
                "
            >

                <img
                    src={
                        user.profilePicture?.url ||
                        "/default-avatar.png"
                    }
                    alt={
                        user.username ||
                        "Waiting user"
                    }
                    className="
                        shrink-0

                        w-10
                        h-10

                        sm:w-11
                        sm:h-11

                        rounded-full

                        object-cover

                        ring-1
                        ring-white/10
                    "
                />


                <div
                    className="
                        min-w-0
                    "
                >

                    <div
                        className="
                            text-sm
                            sm:text-base

                            font-medium

                            text-white

                            truncate
                        "
                    >
                        {user.username}
                    </div>


                    <div
                        className="
                            mt-0.5

                            text-[11px]
                            sm:text-xs

                            text-gray-400
                        "
                    >
                        Waiting for approval...
                    </div>

                </div>

            </div>


            {/* ==========================
                Actions
            ========================== */}

            <div
                className="
                    flex

                    w-full
                    sm:w-auto

                    gap-2
                "
            >

                <button

                    type="button"

                    onClick={() =>
                        approveUser(
                            user.userId
                        )
                    }

                    className="
                        flex-1
                        sm:flex-none

                        min-w-0

                        px-3
                        sm:px-4

                        h-9

                        rounded-lg

                        bg-green-600
                        hover:bg-green-700

                        active:scale-[0.98]

                        text-white

                        text-xs
                        sm:text-sm

                        font-medium

                        transition
                    "
                >
                    Approve
                </button>


                <button

                    type="button"

                    onClick={() =>
                        rejectUser(
                            user.userId
                        )
                    }

                    className="
                        flex-1
                        sm:flex-none

                        min-w-0

                        px-3
                        sm:px-4

                        h-9

                        rounded-lg

                        bg-red-600
                        hover:bg-red-700

                        active:scale-[0.98]

                        text-white

                        text-xs
                        sm:text-sm

                        font-medium

                        transition
                    "
                >
                    Reject
                </button>

            </div>

        </div>

    );

};


export default WaitingUserCard;