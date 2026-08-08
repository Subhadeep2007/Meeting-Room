import { useEffect, useRef } from "react";

const VideoPlayer = ({
    stream,
    username,
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

    return (

        <div
            className={`
                relative
                w-full
                h-72
                rounded-xl
                overflow-hidden
                shadow-lg
                bg-gray-900
                ${
                    isSpeaking
                        ? "border-4 border-green-500"
                        : "border border-gray-700"
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
                className={`
                    w-full
                    h-full
                    object-cover
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

                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">

                    <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">

                        {username?.charAt(0)?.toUpperCase()}

                    </div>

                </div>

            )}

            {/* =====================================
                Raised Hand
            ===================================== */}

            {handRaised && (

                <div className="absolute top-14 left-2 bg-yellow-500 text-black rounded-full px-2 py-1 text-xs font-semibold">

                    ✋ Raised

                </div>

            )}

            {/* =====================================
                Username
            ===================================== */}

            <div className="absolute bottom-2 left-2 bg-black/60 text-white px-3 py-1 rounded-lg text-sm">

                {username}

                {isLocal && " (You)"}

            </div>

            {/* =====================================
                Camera Status
            ===================================== */}

            <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-lg">

                {cameraEnabled ? "📷" : "🚫📷"}

            </div>

            {/* =====================================
                Microphone Status
            ===================================== */}

            <div className="absolute top-12 right-2 bg-black/60 px-2 py-1 rounded-lg">

                {microphoneEnabled ? "🎤" : "🔇"}

            </div>

            {/* =====================================
                Connection Status
            ===================================== */}

            <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs">

                {connectionState}

            </div>

        </div>

    );

};

export default VideoPlayer;