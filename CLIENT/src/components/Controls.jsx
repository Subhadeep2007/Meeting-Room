import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    PhoneOff,
    MonitorUp,
    Hand,
    Smile,
    Settings,
} from "lucide-react";


const Controls = ({

    cameraEnabled,

    microphoneEnabled,

    onToggleCamera,

    onToggleMicrophone,

    onScreenShare,

    onLeave,

    onEndMeeting,

    isHost,

    onRaiseHand,

    onReaction,

}) => {

    return (

        <div
            className="
                fixed
                z-50

                bottom-2
                sm:bottom-4
                md:bottom-5

                left-1/2
                -translate-x-1/2

                w-[calc(100%-16px)]
                sm:w-auto
                max-w-[calc(100%-16px)]

                bg-gray-900/95
                backdrop-blur-md

                rounded-2xl
                sm:rounded-full

                px-2
                sm:px-4
                md:px-6

                py-2
                sm:py-2.5
                md:py-3

                flex
                items-center
                justify-center

                gap-1.5
                sm:gap-2.5
                md:gap-4

                shadow-xl

                overflow-x-auto
                scrollbar-hide
            "
        >

            {/* ==========================
                Microphone
            ========================== */}

            <button

                type="button"

                onClick={
                    onToggleMicrophone
                }

                className="
                    shrink-0

                    p-2
                    sm:p-2.5
                    md:p-3

                    rounded-full

                    bg-gray-700
                    hover:bg-gray-600

                    active:scale-95

                    transition

                    flex
                    items-center
                    justify-center
                "

                title={
                    microphoneEnabled
                        ? "Turn microphone off"
                        : "Turn microphone on"
                }

            >

                {
                    microphoneEnabled

                        ?

                        <Mic
                            size={18}
                            className="
                                sm:w-5
                                sm:h-5
                                text-white
                            "
                        />

                        :

                        <MicOff
                            size={18}
                            className="
                                sm:w-5
                                sm:h-5
                                text-red-400
                            "
                        />
                }

            </button>


            {/* ==========================
                Camera
            ========================== */}

            <button

                type="button"

                onClick={
                    onToggleCamera
                }

                className="
                    shrink-0

                    p-2
                    sm:p-2.5
                    md:p-3

                    rounded-full

                    bg-gray-700
                    hover:bg-gray-600

                    active:scale-95

                    transition

                    flex
                    items-center
                    justify-center
                "

                title={
                    cameraEnabled
                        ? "Turn camera off"
                        : "Turn camera on"
                }

            >

                {
                    cameraEnabled

                        ?

                        <Video
                            size={18}
                            className="
                                sm:w-5
                                sm:h-5
                                text-white
                            "
                        />

                        :

                        <VideoOff
                            size={18}
                            className="
                                sm:w-5
                                sm:h-5
                                text-red-400
                            "
                        />
                }

            </button>


            {/* ==========================
                Screen Share
            ========================== */}

            <button

                type="button"

                onClick={
                    onScreenShare
                }

                className="
                    shrink-0

                    p-2
                    sm:p-2.5
                    md:p-3

                    rounded-full

                    bg-gray-700
                    hover:bg-gray-600

                    active:scale-95

                    transition

                    flex
                    items-center
                    justify-center
                "

                title="Share screen"

            >

                <MonitorUp
                    size={18}
                    className="
                        sm:w-5
                        sm:h-5
                        text-white
                    "
                />

            </button>


            {/* ==========================
                Raise Hand
            ========================== */}

            <button

                type="button"

                onClick={
                    onRaiseHand
                }

                className="
                    shrink-0

                    p-2
                    sm:p-2.5
                    md:p-3

                    rounded-full

                    bg-gray-700
                    hover:bg-gray-600

                    active:scale-95

                    transition

                    flex
                    items-center
                    justify-center
                "

                title="Raise hand"

            >

                <Hand
                    size={18}
                    className="
                        sm:w-5
                        sm:h-5
                        text-white
                    "
                />

            </button>


            {/* ==========================
                Emoji Reaction
            ========================== */}

            <button

                type="button"

                onClick={
                    onReaction
                }

                className="
                    shrink-0

                    p-2
                    sm:p-2.5
                    md:p-3

                    rounded-full

                    bg-gray-700
                    hover:bg-gray-600

                    active:scale-95

                    transition

                    flex
                    items-center
                    justify-center
                "

                title="Reaction"

            >

                <Smile
                    size={18}
                    className="
                        sm:w-5
                        sm:h-5
                        text-white
                    "
                />

            </button>


            {/* ==========================
                Settings
            ========================== */}

            <button

                type="button"

                className="
                    shrink-0

                    p-2
                    sm:p-2.5
                    md:p-3

                    rounded-full

                    bg-gray-700
                    hover:bg-gray-600

                    active:scale-95

                    transition

                    flex
                    items-center
                    justify-center
                "

                title="Settings"

            >

                <Settings
                    size={18}
                    className="
                        sm:w-5
                        sm:h-5
                        text-white
                    "
                />

            </button>


            {/* ==========================
                Leave
            ========================== */}

            <button

                type="button"

                onClick={
                    onLeave
                }

                className="
                    shrink-0

                    p-2
                    sm:p-2.5
                    md:p-3

                    rounded-full

                    bg-red-600
                    hover:bg-red-700

                    active:scale-95

                    transition

                    flex
                    items-center
                    justify-center
                "

                title="Leave meeting"

            >

                <PhoneOff
                    size={18}
                    className="
                        sm:w-5
                        sm:h-5
                        text-white
                    "
                />

            </button>


            {/* ==========================
                End Meeting - Host Only
            ========================== */}

            {
                isHost && (

                    <button

                        type="button"

                        onClick={
                            onEndMeeting
                        }

                        className="
                            shrink-0

                            p-2
                            sm:p-2.5
                            md:p-3

                            rounded-full

                            bg-red-800
                            hover:bg-red-900

                            active:scale-95

                            transition

                            flex
                            items-center
                            justify-center
                        "

                        title="End Meeting"

                    >

                        <PhoneOff
                            size={18}
                            className="
                                sm:w-5
                                sm:h-5
                                text-white
                            "
                        />

                    </button>

                )
            }

        </div>

    );

};


export default Controls;