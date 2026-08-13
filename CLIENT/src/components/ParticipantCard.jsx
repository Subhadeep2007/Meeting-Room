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

    const isPinned =
        pinnedUser?.socketId ===
        participant.socketId;


    return (

        <div
            className={`
                group

                flex
                items-center
                justify-between

                gap-2

                w-full

                p-2.5
                sm:p-3

                rounded-xl

                bg-white/[0.02]

                border

                transition-all
                duration-200

                ${
                    participant.isSpeaking
                        ? "border-green-500/70 bg-green-500/10 shadow-lg shadow-green-500/5"
                        : isPinned
                            ? "border-blue-500/60 bg-blue-500/10"
                            : "border-transparent hover:border-white/10 hover:bg-white/[0.04]"
                }
            `}
        >

            {/* ===========================
                Left Section
            =========================== */}

            <div
                className="
                    flex
                    items-center
                    gap-2.5

                    min-w-0
                    flex-1
                "
            >

                {/* Avatar */}

                <div
                    className="
                        relative
                        shrink-0
                    "
                >

                    <img
                        src={
                            participant.profilePicture?.url ||
                            "/default-avatar.png"
                        }
                        alt={participant.username}
                        className="
                            w-9
                            h-9

                            sm:w-10
                            sm:h-10

                            rounded-full

                            object-cover

                            ring-1
                            ring-white/10
                        "
                    />


                    {/* Speaking Indicator */}

                    {participant.isSpeaking && (

                        <span
                            className="
                                absolute
                                -right-0.5
                                -bottom-0.5

                                w-2.5
                                h-2.5

                                rounded-full

                                bg-green-400

                                ring-2
                                ring-gray-950

                                animate-pulse
                            "
                        />

                    )}

                </div>


                {/* User Information */}

                <div
                    className="
                        min-w-0
                        flex-1
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-1.5

                            min-w-0
                        "
                    >

                        <span
                            className="
                                font-semibold

                                text-sm
                                sm:text-sm

                                text-white

                                truncate
                            "
                        >
                            {participant.username}
                        </span>


                        {participant.isHost && (

                            <Crown
                                size={14}
                                className="
                                    shrink-0
                                    text-yellow-400
                                "
                            />

                        )}

                    </div>


                    <div
                        className="
                            mt-0.5

                            flex
                            items-center
                            gap-1.5

                            text-[10px]
                            sm:text-xs

                            text-gray-500
                        "
                    >

                        <span>
                            {participant.isHost
                                ? "Host"
                                : "Participant"}
                        </span>


                        {isPinned && (

                            <>
                                <span>
                                    •
                                </span>

                                <span
                                    className="
                                        text-blue-400
                                        font-medium
                                    "
                                >
                                    Pinned
                                </span>
                            </>

                        )}

                    </div>

                </div>

            </div>


            {/* ===========================
                Right Section
            =========================== */}

            <div
                className="
                    flex
                    items-center
                    justify-end

                    gap-1
                    sm:gap-1.5

                    shrink-0
                "
            >

                {/* ==========================
                    Camera Status
                ========================== */}

                <div
                    className="
                        w-7
                        h-7

                        sm:w-8
                        sm:h-8

                        rounded-lg

                        bg-white/5

                        flex
                        items-center
                        justify-center
                    "
                    title={
                        participant.cameraEnabled
                            ? "Camera on"
                            : "Camera off"
                    }
                >

                    {participant.cameraEnabled ? (

                        <Video
                            size={15}
                            className="
                                text-green-400
                            "
                        />

                    ) : (

                        <VideoOff
                            size={15}
                            className="
                                text-red-400
                            "
                        />

                    )}

                </div>


                {/* ==========================
                    Microphone Status
                ========================== */}

                <div
                    className="
                        w-7
                        h-7

                        sm:w-8
                        sm:h-8

                        rounded-lg

                        bg-white/5

                        flex
                        items-center
                        justify-center
                    "
                    title={
                        participant.microphoneEnabled
                            ? "Microphone on"
                            : "Microphone muted"
                    }
                >

                    {participant.microphoneEnabled ? (

                        <Mic
                            size={15}
                            className="
                                text-green-400
                            "
                        />

                    ) : (

                        <MicOff
                            size={15}
                            className="
                                text-red-400
                            "
                        />

                    )}

                </div>


                {/* ==========================
                    Hand Raised
                ========================== */}

                {participant.handRaised && (

                    <div
                        className="
                            w-7
                            h-7

                            sm:w-8
                            sm:h-8

                            rounded-lg

                            bg-yellow-400/10

                            flex
                            items-center
                            justify-center

                            text-yellow-400
                        "
                        title="Hand raised"
                    >

                        <Hand
                            size={15}
                        />

                    </div>

                )}


                {/* ==========================
                    Pin Participant
                ========================== */}

                {onPin && (

                    <button

                        type="button"

                        onClick={() => {

                            if (isPinned) {

                                // Unpin
                                onPin(null);

                            } else {

                                // Pin
                                onPin(participant);

                            }

                        }}

                        className={`
                            w-8
                            h-8

                            sm:w-9
                            sm:h-9

                            rounded-lg

                            flex
                            items-center
                            justify-center

                            active:scale-95

                            transition-all

                            ${
                                isPinned
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                    : "bg-white/5 text-blue-400 hover:bg-blue-500/15 hover:text-blue-300"
                            }
                        `}

                        title={
                            isPinned
                                ? "Unpin Participant"
                                : "Pin Participant"
                        }

                        aria-label={
                            isPinned
                                ? "Unpin Participant"
                                : "Pin Participant"
                        }

                    >

                        <Pin
                            size={16}
                            className={
                                isPinned
                                    ? "fill-current"
                                    : ""
                            }
                        />

                    </button>

                )}


                {/* ==========================
                    Host Controls
                ========================== */}

                {
                    isHost &&
                    !participant.isHost && (

                        <HostControls

                            participant={
                                participant
                            }

                            onKick={
                                kickUser
                            }

                            onMute={
                                muteUser
                            }

                            onDisableCamera={
                                disableCamera
                            }

                            onLock={
                                lockMeeting
                            }

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