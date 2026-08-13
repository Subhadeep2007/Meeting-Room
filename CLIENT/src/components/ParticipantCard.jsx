import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    Hand,
    Crown,
    Pin,
} from "lucide-react";

import HostControls from "./HostControls";


const ParticipantCard = ({
    participant,

    // ==========================
    // Host Controls
    // ==========================

    isHost,

    onPin,
    pinnedUser,

    kickUser,

    muteUser,

    disableCamera,

    lockMeeting,

    meetingLocked,

}) => {

    return (

        <div
            className={`
                flex
                items-center
                justify-between
                p-3
                rounded-lg
                transition

                ${
                    participant.isSpeaking
                        ? "border-2 border-green-500 bg-green-900"
                        : "hover:bg-gray-700"
                }
            `}
        >

            {/* ===========================
                Left Section
            =========================== */}

            <div className="flex items-center gap-3">

                <img
                    src={
                        participant.profilePicture?.url ||
                        "/default-avatar.png"
                    }
                    alt={participant.username}
                    className="
                        w-10
                        h-10
                        rounded-full
                        object-cover
                    "
                />


                <div>

                    <div className="
                        font-semibold
                        text-white
                    ">

                        {participant.username}

                    </div>


                    <div className="
                        text-xs
                        text-gray-400
                    ">

                        {participant.isHost
                            ? "Host 👑"
                            : "Participant"
                        }

                    </div>

                </div>

            </div>


            {/* ===========================
                Right Section
            =========================== */}

            <div className="
                flex
                items-center
                gap-2
            ">

                {/* ==========================
                    Camera
                ========================== */}

                {
                    participant.cameraEnabled

                        ? (
                            <Video
                                size={18}
                                className="text-green-400"
                            />
                        )

                        : (
                            <VideoOff
                                size={18}
                                className="text-red-500"
                            />
                        )
                }


                {/* ==========================
                    Microphone
                ========================== */}

                {
                    participant.microphoneEnabled

                        ? (
                            <Mic
                                size={18}
                                className="text-green-400"
                            />
                        )

                        : (
                            <MicOff
                                size={18}
                                className="text-red-500"
                            />
                        )
                }


                {/* ==========================
                    Hand Raised
                ========================== */}

                {
                    participant.handRaised && (

                        <Hand
                            size={18}
                            className="text-yellow-400"
                        />

                    )
                }


                {/* ==========================
                    Host Badge
                ========================== */}

                {
                    participant.isHost && (

                        <Crown
                            size={18}
                            className="text-yellow-400"
                        />

                    )
                }


                {/* ==========================
                    Pin Participant
                ========================== */}

              {
    onPin && (

        <button

            type="button"

            onClick={() => {

                if (
                    pinnedUser?.socketId ===
                    participant.socketId
                ) {

                    // Unpin
                    onPin(null);

                } else {

                    // Pin
                    onPin(participant);

                }

            }}

            className="
                p-1.5
                rounded-lg
                text-blue-400
                hover:bg-blue-500/20
                hover:text-blue-300
                transition
            "

            title={
                pinnedUser?.socketId ===
                participant.socketId

                    ? "Unpin Participant"

                    : "Pin Participant"
            }

        >

            <Pin size={18} />

        </button>

    )
}

                {/* ==========================
                    Host Controls
                ========================== */}

                {
                    isHost &&
                    !participant.isHost && (

                        <HostControls

                            participant={participant}

                            onKick={kickUser}

                            onMute={muteUser}

                            onDisableCamera={
                                disableCamera
                            }

                            onLock={lockMeeting}

                            meetingLocked={
                                meetingLocked
                            }

                        />

                    )
                }

            </div>

        </div>

    );

};


export default ParticipantCard;