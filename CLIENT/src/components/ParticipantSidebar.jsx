import { useState } from "react";

import {
    Lock,
    Unlock,
} from "lucide-react";

import ParticipantCard from "./ParticipantCard";


const ParticipantSidebar = ({

    participants,

    onPin,

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

    const users = Object.values(participants).filter(
        (user) =>
            user.username
                ?.toLowerCase()
                .includes(search.toLowerCase())
    );


    return (

        <div className="
            w-80
            bg-gray-900
            h-full
            p-4
            border-l
            border-gray-700
        ">


            {/* =================================
                Header
            ================================= */}

            <div className="
                flex
                items-center
                justify-between
                mb-4
            ">

                <h2 className="
                    text-white
                    text-xl
                    font-bold
                ">

                    Participants ({users.length})

                </h2>

            </div>


            {/* =================================
                Lock Meeting
            ================================= */}

            {isHost && (

                <button

                    type="button"

                    onClick={() => {

                        console.log(
                            "🔒 LOCK BUTTON CLICKED"
                        );

                        console.log(
                            "Current meetingLocked:",
                            meetingLocked
                        );

                        console.log(
                            "lockMeeting function:",
                            lockMeeting
                        );

                        lockMeeting(
                            !meetingLocked
                        );

                    }}

                    className="
                        flex
                        items-center
                        justify-center
                        w-10
                        h-10
                        rounded-lg
                        bg-red-600
                        hover:bg-red-700
                        text-white
                        cursor-pointer
                        mb-4
                    "

                    title={
                        meetingLocked
                            ? "Unlock Meeting"
                            : "Lock Meeting"
                    }

                >

                    {meetingLocked ? (

                        <Lock size={20} />

                    ) : (

                        <Unlock size={20} />

                    )}

                </button>

            )}


            {/* =================================
                Search
            ================================= */}

            <input

                type="text"

                placeholder="Search Participant..."

                value={search}

                onChange={(e) =>
                    setSearch(e.target.value)
                }

                className="
                    w-full
                    p-2
                    rounded-lg
                    mb-4
                    bg-gray-800
                    text-white
                    outline-none
                    focus:ring-2
                    focus:ring-blue-500
                "

            />


            {/* =================================
                Participant List
            ================================= */}

            <div
                className="
                    space-y-2
                    overflow-y-auto
                    h-[80vh]
                "
            >

                {

                    users.length > 0 ? (

                        users.map((user) => (

                            <ParticipantCard

                                key={user.socketId}

                                participant={user}

                                onPin={onPin}

                                // =========================
                                // Host Controls
                                // =========================

                                isHost={isHost}

                                kickUser={kickUser}

                                muteUser={muteUser}

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

                        ))

                    ) : (

                        <div className="
                            text-center
                            text-gray-400
                            mt-10
                        ">

                            No Participants Found

                        </div>

                    )

                }

            </div>

        </div>

    );

};


export default ParticipantSidebar;