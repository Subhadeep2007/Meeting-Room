import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useWebRTC from "../hooks/useWebRTC";

import VideoGrid from "../components/VideoGrid";
import Controls from "../components/Controls";

const MeetingRoom = () => {

    const navigate = useNavigate();

    const { meetingCode } = useParams();

    // =========================================
    // Dummy Logged In User
    // Later JWT API se ayega
    // =========================================

    const username = "Subha";

    // =========================================
    // Loading
    // =========================================

    const [loading, setLoading] = useState(true);

    // =========================================
    // WebRTC Hook
    // =========================================

    const {

        localStream,

        remoteStreams,
        participants,

        cameraEnabled,

        microphoneEnabled,

        connectionState,

        handleToggleCamera,

        handleToggleMicrophone,

        startScreenShare,

        handleRaiseHand,

        stopScreenShare,

    } = useWebRTC(meetingCode);

    // =========================================
    // Loading
    // =========================================

    useEffect(() => {

        if (localStream) {

            setLoading(false);

        }

    }, [localStream]);

    // =========================================
    // Leave Meeting
    // =========================================

    const leaveMeeting = () => {

        navigate("/dashboard");

    };

    

    // =========================================
    // Emoji
    // =========================================

    const sendReaction = () => {

        console.log("😊 Emoji");

    };

    // =========================================
    // Loading
    // =========================================

    if (loading) {

        return (

            <div className="h-screen flex justify-center items-center bg-black text-white text-3xl">

                Connecting To Meeting...

            </div>

        );

    }

    return (

        <div className="bg-black h-screen flex flex-col">

            {/* ===========================
                Meeting Header
            =========================== */}

            <div className="flex justify-between items-center px-6 py-4 bg-gray-900 text-white">

                <h2 className="text-xl font-bold">

                    Meeting Code :

                    {meetingCode}

                </h2>

                <div>

                    Status :

                    <span className="text-green-400">

                        {connectionState}

                    </span>

                </div>

            </div>

            {/* ===========================
                Video Grid
            =========================== */}

            <div className="flex-1 overflow-hidden">

                <VideoGrid

                    username={username}

                    localStream={localStream}

                    remoteStreams={remoteStreams}

                    participants={participants}

                    cameraEnabled={cameraEnabled}

                    microphoneEnabled={microphoneEnabled}

                    connectionState={connectionState}

                />

            </div>

            {/* ===========================
                Controls
            =========================== */}

            <Controls

                cameraEnabled={cameraEnabled}

                microphoneEnabled={microphoneEnabled}

                onToggleCamera={handleToggleCamera}

                onToggleMicrophone={handleToggleMicrophone}

                onScreenShare={startScreenShare}

                onLeave={leaveMeeting}

                onRaiseHand={handleRaiseHand}

                onReaction={sendReaction}

            />

        </div>

    );

};

export default MeetingRoom;