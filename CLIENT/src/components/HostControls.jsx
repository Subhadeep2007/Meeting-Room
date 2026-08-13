import {
    UserX,
    MicOff,
    VideoOff,
    Lock,
    Unlock,
} from "lucide-react";

const HostControls = ({
    participant,

    onKick,

    onMute,

    onDisableCamera,

    onLock,

    meetingLocked,

}) => {

    return (

        <div className="flex items-center gap-2">

            {/* ==========================
                Kick User
            ========================== */}

            <button
                type="button"

                onClick={() =>
                    onKick(
                        participant
                    )
                }

                className="
                    p-2
                    rounded-lg
                    text-red-400
                    hover:bg-red-500/20
                    hover:text-red-300
                    transition
                "

                title="Kick User"

            >

                <UserX size={18} />

            </button>


            {/* ==========================
                Mute User
            ========================== */}

            <button
                type="button"

                onClick={() =>
                    onMute(
                        participant
                    )
                }

                className="
                    p-2
                    rounded-lg
                    text-yellow-400
                    hover:bg-yellow-500/20
                    hover:text-yellow-300
                    transition
                "

                title="Mute User"

            >

                <MicOff size={18} />

            </button>


            {/* ==========================
                Disable Camera
            ========================== */}

            <button
                type="button"

                onClick={() =>
                    onDisableCamera(
                        participant
                    )
                }

                className="
                    p-2
                    rounded-lg
                    text-blue-400
                    hover:bg-blue-500/20
                    hover:text-blue-300
                    transition
                "

                title="Disable Camera"

            >

                <VideoOff size={18} />

            </button>


            {/* ==========================
                Lock / Unlock Meeting
            ========================== */}

            <button
                type="button"

                onClick={onLock}

                className="
                    p-2
                    rounded-lg
                    text-white
                    hover:bg-gray-700
                    transition
                "

                title={
                    meetingLocked
                        ? "Unlock Meeting"
                        : "Lock Meeting"
                }

            >

                {meetingLocked ? (

                    <Unlock size={18} />

                ) : (

                    <Lock size={18} />

                )}

            </button>

        </div>

    );

};

export default HostControls;