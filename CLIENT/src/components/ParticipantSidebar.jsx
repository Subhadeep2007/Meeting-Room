import { useState } from "react";

import ParticipantCard from "./ParticipantCard";

const ParticipantSidebar = ({

    participants,

    // Host Controls
    isHost,

    kickUser,

    muteUser,

    disableCamera,

    transferHost,

    makeCoHost,

    lockMeeting,

    meetingLocked,

}) => {

    const [search, setSearch] = useState("");

    const users = Object.values(participants).filter((user) =>

        user.username
            ?.toLowerCase()
            .includes(search.toLowerCase())

    );

    return (

        <div className="w-80 bg-gray-900 h-full p-4 border-l border-gray-700">

            {/* ===========================
                Header
            =========================== */}

            <h2 className="text-white text-xl font-bold mb-4">

                Participants ({users.length})

            </h2>

            {/* ===========================
                Search
            =========================== */}

            <input

                type="text"

                placeholder="Search Participant..."

                value={search}

                onChange={(e) =>

                    setSearch(e.target.value)

                }

                className="w-full p-2 rounded-lg mb-4 bg-gray-800 text-white outline-none"

            />

            {/* ===========================
                Participant List
            =========================== */}

            <div className="space-y-2 overflow-y-auto h-[80vh]">

                {

                    users.length > 0 ? (

                        users.map((user) => (

                            <ParticipantCard

                                key={user.socketId}

                                participant={user}

                                onPin={onPin}

                                // Host Controls
                                isHost={isHost}

                                kickUser={kickUser}

                                muteUser={muteUser}

                                disableCamera={disableCamera}

                                transferHost={transferHost}

                                makeCoHost={makeCoHost}

                                lockMeeting={lockMeeting}

                                meetingLocked={meetingLocked}

                            />

                        ))

                    ) : (

                        <div className="text-center text-gray-400 mt-10">

                            No Participants Found

                        </div>

                    )

                }

            </div>

        </div>

    );

};

export default ParticipantSidebar;