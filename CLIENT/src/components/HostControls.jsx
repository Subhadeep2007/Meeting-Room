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

        <div
            className="
                flex
                items-center
                justify-end

                gap-1
                sm:gap-1.5
            "
        >

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
                    w-8
                    h-8

                    sm:w-9
                    sm:h-9

                    shrink-0

                    rounded-lg

                    flex
                    items-center
                    justify-center

                    text-red-400

                    bg-white/5

                    hover:bg-red-500/15
                    hover:text-red-300

                    active:scale-95

                    transition-all
                "

                title="Kick User"

                aria-label="Kick User"

            >

                <UserX
                    size={16}
                    className="sm:w-[18px] sm:h-[18px]"
                />

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
                    w-8
                    h-8

                    sm:w-9
                    sm:h-9

                    shrink-0

                    rounded-lg

                    flex
                    items-center
                    justify-center

                    text-yellow-400

                    bg-white/5

                    hover:bg-yellow-500/15
                    hover:text-yellow-300

                    active:scale-95

                    transition-all
                "

                title="Mute User"

                aria-label="Mute User"

            >

                <MicOff
                    size={16}
                    className="sm:w-[18px] sm:h-[18px]"
                />

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
                    w-8
                    h-8

                    sm:w-9
                    sm:h-9

                    shrink-0

                    rounded-lg

                    flex
                    items-center
                    justify-center

                    text-blue-400

                    bg-white/5

                    hover:bg-blue-500/15
                    hover:text-blue-300

                    active:scale-95

                    transition-all
                "

                title="Disable Camera"

                aria-label="Disable Camera"

            >

                <VideoOff
                    size={16}
                    className="sm:w-[18px] sm:h-[18px]"
                />

            </button>


            {/* ==========================
                Lock / Unlock Meeting
            ========================== */}

           

        </div>

    );

};


export default HostControls;