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

    onRaiseHand,

    onReaction,

}) => {

    return (

        <div
            className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-900 rounded-full px-6 py-3 flex items-center gap-4 shadow-xl"
        >

            {/* ==========================
                Microphone
            ========================== */}

            <button

                onClick={onToggleMicrophone}

                className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"

            >

                {

                    microphoneEnabled

                        ?

                        <Mic color="white"/>

                        :

                        <MicOff color="red"/>

                }

            </button>

            {/* ==========================
                Camera
            ========================== */}

            <button

                onClick={onToggleCamera}

                className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"

            >

                {

                    cameraEnabled

                        ?

                        <Video color="white"/>

                        :

                        <VideoOff color="red"/>

                }

            </button>

            {/* ==========================
                Screen Share
            ========================== */}

            <button

                onClick={onScreenShare}

                className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"

            >

                <MonitorUp color="white"/>

            </button>

            {/* ==========================
                Raise Hand
            ========================== */}

            <button

                onClick={onRaiseHand}

                className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"

            >

                <Hand color="white"/>

            </button>

            {/* ==========================
                Emoji Reaction
            ========================== */}

            <button

                onClick={onReaction}

                className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"

            >

                <Smile color="white"/>

            </button>

            {/* ==========================
                Settings
            ========================== */}

            <button

                className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"

            >

                <Settings color="white"/>

            </button>

            {/* ==========================
                Leave
            ========================== */}

            <button

                onClick={onLeave}

                className="p-3 rounded-full bg-red-600 hover:bg-red-700"

            >

                <PhoneOff color="white"/>

            </button>

        </div>

    );

};

export default Controls;