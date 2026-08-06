import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useWebRTC from "../hooks/useWebRTC";

import VideoGrid from "../components/VideoGrid";
import Controls from "../components/Controls";
import EmojiReaction from "../components/EmojiReaction";
import FloatingReaction from "../components/FloatingReaction";
import ParticipantSidebar from "../components/ParticipantSidebar";
import WaitingRoomSidebar from "../components/WaitingRoomSidebar";

const MeetingRoom = () => {

    const navigate = useNavigate();
    const { meetingCode } = useParams();

    // =========================================
    // Dummy User
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
        mySocketId,

        reactions,
        sendReaction,
         waitingUsers,
    approveUser,
    rejectUser,

        cameraEnabled,
        microphoneEnabled,
        connectionState,

        handleToggleCamera,
        handleToggleMicrophone,
        startScreenShare,
        stopScreenShare,
        handleRaiseHand,
        kickUser,

muteUser,

disableCamera,

transferHost,

makeCoHost,

lockMeeting,

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

        stopScreenShare();

        navigate("/dashboard");

    };

    // =========================================
    // Loading Screen
    // =========================================

    if (loading) {

        return (

            <div className="h-screen flex justify-center items-center bg-black text-white text-3xl">

                Connecting To Meeting...

            </div>

        );

    }

    return (

        <div className="relative bg-black h-screen flex flex-col">

            {/* ===========================
                Header
            =========================== */}

            <div className="flex justify-between items-center px-6 py-4 bg-gray-900 text-white">

                <h2 className="text-xl font-bold">

                    Meeting Code : {meetingCode}

                </h2>

                <div>

                    Status :

                    <span className="text-green-400 ml-2">

                        {connectionState}

                    </span>

                </div>

            </div>

           <div className="flex flex-1">

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
        Participant Sidebar
    =========================== */}

    <ParticipantSidebar

        participants={participants}
        kickUser={kickUser}

muteUser={muteUser}

disableCamera={disableCamera}

transferHost={transferHost}

makeCoHost={makeCoHost}

lockMeeting={lockMeeting}

meetingLocked={false}

isHost={true}

    />

    <WaitingRoomSidebar

    waitingUsers={waitingUsers}

    approveUser={approveUser}

    rejectUser={rejectUser}

/>

</div>

            {/* ===========================
                Emoji Picker
            =========================== */}

            <div className="absolute top-20 right-5 z-50">

                <EmojiReaction

                    onSelect={sendReaction}

                />

            </div>

            {/* ===========================
                Floating Reactions
            =========================== */}

            {

                reactions.map((reaction) => (

                    <FloatingReaction

                        key={reaction.createdAt}

                        reaction={reaction}

                    />

                ))

            }

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

                onReaction={() => {}}

            />

        </div>

    );

};

export default MeetingRoom;