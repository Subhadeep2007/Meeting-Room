import { useEffect, useRef } from "react";

import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    Wifi,
    WifiOff,
} from "lucide-react";


const VideoPlayer = ({
    stream,
    username,
    profilePicture,
    isLocal = false,
    cameraEnabled = true,
    microphoneEnabled = true,
    handRaised = false,
    isSpeaking = false,
    connectionState = "connected",
}) => {

    const videoRef = useRef(null);


    // =====================================
    // Attach Stream
    // =====================================

    useEffect(() => {

        if (!videoRef.current || !stream) {
            return;
        }

        videoRef.current.srcObject = stream;

    }, [stream]);


    // =====================================
    // Connection State
    // =====================================

    const isConnected =
        connectionState === "connected";


    return (

        <div
            className={`
                relative
                isolate
                w-full
                h-full
                min-h-0

                overflow-hidden

                rounded-xl
                sm:rounded-2xl

                bg-gray-950

                shadow-lg

                transition-all
                duration-200

                ${
                    isSpeaking
                        ? "ring-2 sm:ring-4 ring-green-500"
                        : "ring-1 ring-white/10"
                }
            `}
        >

            {/* =====================================
                Video
            ===================================== */}

            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocal}
                style={{
    transform: isLocal ? "scaleX(-1)" : "none",
}}
                className={`
                    absolute
                    inset-0

                    w-full
                    h-full

                    object-cover

                    transition-opacity
                    duration-200

                    ${
                        cameraEnabled
                            ? "opacity-100"
                            : "opacity-0"
                    }
                `}
            />


            {/* =====================================
                Camera OFF Avatar
            ===================================== */}

            {!cameraEnabled && (

                <div
                    className="
                        absolute
                        inset-0

                        flex
                        flex-col
                        items-center
                        justify-center

                        bg-gray-900
                    "
                >

                    <div
                        className="
                            w-16
                            h-16
                            sm:w-20
                            sm:h-20
                            md:w-24
                            md:h-24

                            rounded-full

                            bg-blue-600

                            flex
                            items-center
                            justify-center

                            text-white

                            text-2xl
                            sm:text-3xl

                            font-bold

                            shadow-xl
                        "
                    >

                         {profilePicture ? (
        <img
            src={profilePicture}
            alt={username || "User"}
            className="w-full h-full object-cover"
        />
    ) : (
        username?.charAt(0)?.toUpperCase() || "U"
    )}

                    </div>

                    <span
                        className="
                            mt-3

                            text-xs
                            sm:text-sm

                            text-gray-400
                        "
                    >
                        Camera is off
                    </span>

                </div>

            )}


            {/* =====================================
                Top Gradient
            ===================================== */}

            <div
                className="
                    pointer-events-none

                    absolute
                    inset-x-0
                    top-0

                    h-24

                    bg-gradient-to-b
                    from-black/60
                    to-transparent
                "
            />


            {/* =====================================
                Bottom Gradient
            ===================================== */}

            <div
                className="
                    pointer-events-none

                    absolute
                    inset-x-0
                    bottom-0

                    h-28

                    bg-gradient-to-t
                    from-black/70
                    to-transparent
                "
            />


            {/* =====================================
                Connection Status
            ===================================== */}

            <div
                className="
                    absolute
                    top-2
                    left-2
                    sm:top-3
                    sm:left-3

                    z-10

                    flex
                    items-center
                    gap-1.5

                    px-2
                    py-1

                    rounded-full

                    bg-black/55
                    backdrop-blur-md

                    border
                    border-white/10

                    text-[10px]
                    sm:text-xs

                    text-white
                "
            >

                {
                    isConnected

                        ? (
                            <Wifi
                                size={12}
                            />
                        )

                        : (
                            <WifiOff
                                size={12}
                            />
                        )
                }

                <span className="hidden sm:inline">
                    {connectionState}
                </span>

            </div>


            {/* =====================================
                Camera / Mic Status
            ===================================== */}

            <div
                className="
                    absolute
                    top-2
                    right-2
                    sm:top-3
                    sm:right-3

                    z-10

                    flex
                    items-center
                    gap-1

                    px-2
                    py-1

                    rounded-full

                    bg-black/55
                    backdrop-blur-md

                    border
                    border-white/10
                "
            >

                {
                    microphoneEnabled

                        ? (
                            <Mic
                                size={14}
                                className="text-white"
                            />
                        )

                        : (
                            <MicOff
                                size={14}
                                className="text-red-400"
                            />
                        )
                }

                <span
                    className="
                        w-px
                        h-3
                        bg-white/20
                    "
                />

                {
                    cameraEnabled

                        ? (
                            <Video
                                size={14}
                                className="text-white"
                            />
                        )

                        : (
                            <VideoOff
                                size={14}
                                className="text-red-400"
                            />
                        )
                }

            </div>


            {/* =====================================
                Raised Hand
            ===================================== */}

            {handRaised && (

                <div
                    className="
                        absolute

                        top-11
                        left-2
                        sm:top-12
                        sm:left-3

                        z-10

                        flex
                        items-center
                        gap-1.5

                        px-2.5
                        py-1

                        rounded-full

                        bg-yellow-400
                        text-black

                        text-[10px]
                        sm:text-xs

                        font-semibold

                        shadow-lg
                    "
                >

                    <span>
                        ✋
                    </span>

                    <span>
                        Raised
                    </span>

                </div>

            )}


            {/* =====================================
                Speaking Indicator
            ===================================== */}

            {isSpeaking && (

                <div
                    className="
                        absolute

                        bottom-11
                        left-2
                        sm:bottom-12
                        sm:left-3

                        z-10

                        flex
                        items-center
                        gap-1.5

                        px-2
                        py-1

                        rounded-full

                        bg-green-500/90
                        text-white

                        text-[10px]
                        sm:text-xs

                        font-semibold
                    "
                >

                    <span
                        className="
                            w-1.5
                            h-1.5

                            rounded-full

                            bg-white

                            animate-pulse
                        "
                    />

                    Speaking

                </div>

            )}


            {/* =====================================
                Username
            ===================================== */}

            <div
                className="
                    absolute

                    bottom-2
                    left-2
                    sm:bottom-3
                    sm:left-3

                    z-10

                    max-w-[85%]

                    px-3
                    sm:px-3.5

                    py-1.5
                    sm:py-1.5

                    rounded-lg

                    bg-black/70
                    backdrop-blur-md

                    border
                    border-white/15

                    text-white

                    text-xs
                    sm:text-sm
                    md:text-base

                    font-semibold

                    shadow-lg

                    whitespace-nowrap
                    overflow-hidden
                    text-ellipsis
                "
            >

                <span className="inline-flex items-center gap-1">
                    <span className="truncate">
                        {username || "User"}
                    </span>

                    {isLocal && (
                        <span className="shrink-0 text-gray-300 font-medium">
                            (You)
                        </span>
                    )}
                </span>

            </div>


            {/* =====================================
                Local Badge
            ===================================== */}

            {isLocal && (

                <div
                    className="
                        absolute

                        bottom-2
                        right-2
                        sm:bottom-3
                        sm:right-3

                        z-10

                        px-2
                        py-1

                        rounded-full

                        bg-blue-600/90
                        text-white

                        text-[9px]
                        sm:text-[10px]

                        font-semibold
                    "
                >
                    YOU
                </div>

            )}

        </div>

    );

};


export default VideoPlayer;