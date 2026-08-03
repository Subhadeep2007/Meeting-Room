import { useEffect, useRef } from "react";

const VideoPlayer = ({

    stream,

    username,

    isLocal = false,

    cameraEnabled = true,

    microphoneEnabled = true,

     handRaised = false,

    connectionState = "connected",

}) => {

    const videoRef = useRef(null);

    // =====================================
    // Attach Stream
    // =====================================

    useEffect(() => {

        if (videoRef.current && stream) {

            videoRef.current.srcObject = stream;

        }

    }, [stream]);

    return (

        <div className="relative w-full h-72 bg-gray-900 rounded-xl overflow-hidden shadow-lg">

            {/* ===========================
                Video
            =========================== */}

            {

                cameraEnabled ? (

                    <video

                        ref={videoRef}

                        autoPlay

                        playsInline

                        muted={isLocal}

                        className="w-full h-full object-cover"

                    />

                ) : (

                    <div className="flex items-center justify-center h-full">

                        <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">

                            {username?.charAt(0)?.toUpperCase()}

                        </div>

                    </div>

                )

            }


            {

handRaised && (

<div

className="absolute top-14 left-2 bg-yellow-500 text-black rounded-full px-2 py-1 text-xs"

>

✋ Raised

</div>

)

}

            {/* ===========================
                Username
            =========================== */}

            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">

                {username}

                {

                    isLocal && " (You)"

                }

            </div>

            {/* ===========================
                Camera
            =========================== */}

            <div className="absolute top-2 right-2">

                {

                    cameraEnabled

                    ?

                    "📷"

                    :

                    "🚫📷"

                }

            </div>

            {/* ===========================
                Microphone
            =========================== */}

            <div className="absolute top-12 right-2">

                {

                    microphoneEnabled

                    ?

                    "🎤"

                    :

                    "🔇"

                }

            </div>

            {/* ===========================
                Connection
            =========================== */}

            <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs">

                {connectionState}

            </div>

        </div>

    );

};

export default VideoPlayer;