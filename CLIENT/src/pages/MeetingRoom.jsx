import api from "../services/api";



import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useWebRTC from "../hooks/useWebRTC";

import VideoGrid from "../components/VideoGrid";
import Controls from "../components/Controls";
import EmojiReaction from "../components/EmojiReaction";
import FloatingReaction from "../components/FloatingReaction";
import ParticipantSidebar from "../components/ParticipantSidebar";
import WaitingRoomSidebar from "../components/WaitingRoomSidebar";
import Navbar from "../layout/Navbar.jsx";

const MeetingRoom = () => {

    const navigate = useNavigate();
    const { meetingCode } = useParams();

    const username = "Subha";
    const [loading, setLoading] = useState(true);

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

   

    useEffect(() => {

    console.log(localStream);

    if(localStream){

        console.log("Meeting Ready");

        setLoading(false);

    }

},[localStream]);

    const leaveMeeting = () => {

        stopScreenShare();

        navigate("/dashboard");

    };

    if (loading) {

        return (
            <div className="h-screen flex justify-center items-center bg-black text-white text-3xl">
                Connecting To Meeting...
            </div>
        );

    }

    return (

<div className="h-screen flex flex-col bg-gray-100">

    {/* Navbar */}

    <Navbar/>

    {/* Main */}

    <div className="flex flex-1 overflow-hidden">

        {/* Left Sidebar */}

        <div className="hidden lg:block w-72 border-r bg-white overflow-y-auto">

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

        </div>

        {/* Video */}

        <div className="flex-1 relative bg-black">

            <VideoGrid

                username={username}

                localStream={localStream}

                remoteStreams={remoteStreams}

                participants={participants}

                cameraEnabled={cameraEnabled}

                microphoneEnabled={microphoneEnabled}

                connectionState={connectionState}

            />

            <div className="absolute top-5 right-5">

                <EmojiReaction

                    onSelect={sendReaction}

                />

            </div>

            {

                reactions.map((reaction)=>(

                    <FloatingReaction

                        key={reaction.createdAt}

                        reaction={reaction}

                    />

                ))

            }

        </div>

        {/* Waiting Room */}

        <div className="hidden xl:block w-80 border-l bg-white overflow-y-auto">

            <WaitingRoomSidebar

                waitingUsers={waitingUsers}

                approveUser={approveUser}

                rejectUser={rejectUser}

            />

        </div>

    </div>

    {/* Controls */}

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