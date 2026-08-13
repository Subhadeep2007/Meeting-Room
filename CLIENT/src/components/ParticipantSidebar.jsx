import { useState } from "react";

import {
    Lock,
    Unlock,
    Search,
    Users,
} from "lucide-react";

import ParticipantCard from "./ParticipantCard";


const ParticipantSidebar = ({

    participants,

    onPin,
    pinnedUser,

    // ================================
    // Host Controls
    // ================================

    isHost,

    kickUser,

    muteUser,

    disableCamera,

    lockMeeting,

    meetingLocked,

}) => {

    const [search, setSearch] = useState("");


    // =====================================
    // Participants
    // =====================================

    const users = Object.values(
        participants
    ).filter(
        (user) =>
            user.username
                ?.toLowerCase()
                .includes(
                    search.toLowerCase()
                )
    );


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

                    pt-4
                    sm:pt-5

                    pb-3

                    border-b
                    border-white/10
                "
            >

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        gap-3
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2.5
                            min-w-0
                        "
                    >

                        <div
                            className="
                                shrink-0

                                w-9
                                h-9

                                rounded-xl

                                bg-blue-600/15

                                flex
                                items-center
                                justify-center

                                text-blue-400
                            "
                        >

                            <Users
                                size={19}
                            />

                        </div>


                        <div
                            className="
                                min-w-0
                            "
                        >

                            <h2
                                className="
                                    text-base
                                    sm:text-lg

                                    font-bold

                                    truncate
                                "
                            >
                                Participants
                            </h2>

                            <p
                                className="
                                    text-xs
                                    text-gray-400
                                "
                            >
                                {users.length}{" "}
                                {users.length === 1
                                    ? "participant"
                                    : "participants"}
                            </p>

                        </div>

                    </div>


                    {/* =========================
                        Lock Meeting
                    ========================= */}

                    {isHost && (

                        <button

                            type="button"

                            onClick={() => {

                                lockMeeting(
                                    !meetingLocked
                                );

                            }}

                            className="
                                shrink-0

                                w-9
                                h-9

                                sm:w-10
                                sm:h-10

                                rounded-xl

                                flex
                                items-center
                                justify-center

                                text-white

                                bg-red-600/90
                                hover:bg-red-600

                                active:scale-95

                                transition

                                shadow-lg
                            "

                            title={
                                meetingLocked
                                    ? "Unlock Meeting"
                                    : "Lock Meeting"
                            }

                        >

                            {meetingLocked ? (

                                <Lock
                                    size={18}
                                />

                            ) : (

                                <Unlock
                                    size={18}
                                />

                            )}

                        </button>

                    )}

                </div>


                {/* =========================
                    Search
                ========================= */}

                <div
                    className="
                        relative
                        mt-3
                    "
                >

                    <Search
                        size={17}
                        className="
                            absolute
                            left-3
                            top-1/2
                            -translate-y-1/2

                            text-gray-500

                            pointer-events-none
                        "
                    />

                    <input

                        type="text"

                        placeholder="Search participants..."

                        value={search}

                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }

                        className="
                            w-full

                            h-10
                            sm:h-11

                            pl-9
                            pr-3

                            rounded-xl

                            bg-white/5

                            border
                            border-white/10

                            text-white

                            text-sm

                            placeholder:text-gray-500

                            outline-none

                            focus:border-blue-500/60
                            focus:ring-2
                            focus:ring-blue-500/10

                            transition
                        "

                    />

                </div>

            </div>


            {/* =================================
                Participant List
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

                {

                    users.length > 0 ? (

                        users.map((user) => (

                            <div
                                key={user.socketId}

                                className="
                                    rounded-xl

                                    transition

                                    hover:bg-white/[0.03]
                                "
                            >

                                <ParticipantCard

                                    participant={user}

                                    onPin={onPin}

                                    pinnedUser={
                                        pinnedUser
                                    }

                                    // =========================
                                    // Host Controls
                                    // =========================

                                    isHost={isHost}

                                    kickUser={
                                        kickUser
                                    }

                                    muteUser={
                                        muteUser
                                    }

                                    disableCamera={
                                        disableCamera
                                    }

                                    lockMeeting={
                                        lockMeeting
                                    }

                                    meetingLocked={
                                        meetingLocked
                                    }

                                />

                            </div>

                        ))

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

                                <Users
                                    size={21}
                                />

                            </div>


                            <p
                                className="
                                    text-sm
                                    font-medium
                                    text-gray-300
                                "
                            >
                                No participants found
                            </p>


                            <p
                                className="
                                    mt-1
                                    text-xs
                                    text-gray-500
                                "
                            >
                                Try another search
                            </p>

                        </div>

                    )

                }

            </div>

        </div>

    );

};


export default ParticipantSidebar;