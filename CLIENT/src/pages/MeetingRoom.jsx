import api from "../services/api";

import { useEffect, useRef, useState } from "react";

import {
    Grid2X2,
    Maximize,
    Minimize,
} from "lucide-react";

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


    // =====================================
    // User
    // =====================================

    const username = "Subha";


    // =====================================
    // Loading
    // =====================================

    const [loading, setLoading] = useState(true);


    // =====================================
    // Meeting UI States
    // =====================================

    const [speakerView, setSpeakerView] = useState(false);

    const [isFullscreen, setIsFullscreen] = useState(false);

    const [pinnedUser, setPinnedUser] = useState(null);


    // =====================================
    // Fullscreen Reference
    // =====================================

    const meetingContainerRef = useRef(null);


    // =====================================
    // WebRTC
    // =====================================

    const {

        localStream,

        remoteStreams,

        participants,

        mySocketId,


        reactions,

        sendReaction,


        waitingUsers,

        isWaiting,

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

        lockMeeting,

        meetingLocked,

        endMeeting,

    } = useWebRTC(meetingCode);


    // =====================================
    // Loading Check
    // =====================================

    useEffect(() => {

        console.log(
            "Local Stream:",
            localStream
        );


        if (localStream) {

            console.log(
                "Meeting Ready"
            );

            setLoading(false);

        }

    }, [localStream]);


    // =====================================
    // Fullscreen Change Listener
    // =====================================

    useEffect(() => {

        const handleFullscreenChange = () => {

            setIsFullscreen(
                Boolean(
                    document.fullscreenElement
                )
            );

        };


        document.addEventListener(
            "fullscreenchange",
            handleFullscreenChange
        );


        return () => {

            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );

        };

    }, []);


    // =====================================
    // Fullscreen Handler
    // =====================================

    const handleFullscreen = async () => {

        try {

            if (!document.fullscreenElement) {

                await meetingContainerRef
                    .current
                    ?.requestFullscreen();

            } else {

                await document.exitFullscreen();

            }

        } catch (error) {

            console.error(
                "Fullscreen Error:",
                error
            );

        }

    };


    // =====================================
    // Leave Meeting
    // =====================================

    const leaveMeeting = () => {

        stopScreenShare();

        navigate("/dashboard");

    };


    // =====================================
    // Current User Host Check
    // =====================================

    const isHost =
        participants[mySocketId]?.isHost ?? false;


    // =====================================
    // End Meeting
    // =====================================

    const handleEndMeeting = async () => {

        try {

            await endMeeting();

            stopScreenShare();

            navigate("/dashboard");

        } catch (error) {

            console.error(
                "Failed to end meeting:",
                error
            );

        }

    };


    // =====================================
    // Waiting Room Screen
    // =====================================

    if (isWaiting) {

        return (

            <div className="
                h-screen
                flex
                flex-col
                justify-center
                items-center
                bg-gray-950
                text-white
            ">

                <div className="text-6xl mb-6">

                    ⏳

                </div>


                <h1 className="
                    text-3xl
                    font-bold
                    mb-3
                ">

                    Waiting for Host Approval

                </h1>


                <p className="
                    text-gray-400
                    text-center
                    max-w-md
                ">

                    The meeting is locked.
                    Please wait while the host
                    approves your request to join.

                </p>


                <button

                    type="button"

                    onClick={leaveMeeting}

                    className="
                        mt-8
                        px-6
                        py-3
                        rounded-lg
                        bg-red-600
                        hover:bg-red-700
                        transition
                    "

                >

                    Leave Meeting

                </button>

            </div>

        );

    }


    // =====================================
    // Loading Screen
    // =====================================

    if (loading) {

        return (

            <div className="
                h-screen
                flex
                justify-center
                items-center
                bg-black
                text-white
                text-3xl
            ">

                Connecting To Meeting...

            </div>

        );

    }


    // =====================================
    // Meeting UI
    // =====================================

    return (

        <div
            ref={meetingContainerRef}
            className="
                h-screen
                flex
                flex-col
                bg-gray-100
            "
        >

            {/* =================================
                Navbar
            ================================= */}

            <Navbar />


            {/* =================================
                Main Meeting Area
            ================================= */}

            <div className="
                flex
                flex-1
                overflow-hidden
            ">


                {/* =================================
                    Participant Sidebar
                ================================= */}

                <div className="
                    hidden
                    lg:block
                    w-72
                    border-r
                    bg-white
                    overflow-y-auto
                ">

                    <ParticipantSidebar

                        participants={participants}

                        kickUser={kickUser}

                        muteUser={muteUser}

                        disableCamera={
                            disableCamera
                        }

                        lockMeeting={
                            lockMeeting
                        }

                        meetingLocked={
                            meetingLocked
                        }

                        isHost={isHost}

                        onPin={setPinnedUser}

                    />

                </div>


                {/* =================================
                    Video Area
                ================================= */}

                <div className="
                    flex-1
                    relative
                    bg-black
                    overflow-hidden
                ">


                    {/* =================================
                        Meeting Toolbar
                    ================================= */}

                    <div className="
                        absolute
                        top-5
                        left-5
                        z-50
                        flex
                        gap-3
                    ">


                        {/* Speaker / Grid */}

                        <button

                            type="button"

                            onClick={() => {

                                setSpeakerView(
                                    !speakerView
                                );

                            }}

                            className="
                                bg-black/60
                                hover:bg-black/80
                                text-white
                                p-3
                                rounded-xl
                                transition
                            "

                            title={
                                speakerView
                                    ? "Grid View"
                                    : "Speaker View"
                            }

                        >

                            <Grid2X2 size={20} />

                        </button>


                        {/* Fullscreen */}

                        <button

                            type="button"

                            onClick={
                                handleFullscreen
                            }

                            className="
                                bg-black/60
                                hover:bg-black/80
                                text-white
                                p-3
                                rounded-xl
                                transition
                            "

                            title={
                                isFullscreen
                                    ? "Exit Fullscreen"
                                    : "Fullscreen"
                            }

                        >

                            {

                                isFullscreen

                                    ? (

                                        <Minimize
                                            size={20}
                                        />

                                    )

                                    : (

                                        <Maximize
                                            size={20}
                                        />

                                    )

                            }

                        </button>

                    </div>


                    {/* =================================
                        Video Grid
                    ================================= */}

                    <VideoGrid

                        username={username}

                        localStream={
                            localStream
                        }

                        remoteStreams={
                            remoteStreams
                        }

                        participants={
                            participants
                        }

                        mySocketId={
                            mySocketId
                        }

                        cameraEnabled={
                            cameraEnabled
                        }

                        microphoneEnabled={
                            microphoneEnabled
                        }

                        connectionState={
                            connectionState
                        }

                        speakerView={
                            speakerView
                        }

                        pinnedUser={
                            pinnedUser
                        }

                    />


                    {/* =================================
                        Emoji Reaction
                    ================================= */}

                    <div className="
                        absolute
                        top-5
                        right-5
                        z-50
                    ">

                        <EmojiReaction

                            onSelect={
                                sendReaction
                            }

                        />

                    </div>


                    {/* =================================
                        Floating Reactions
                    ================================= */}

                    {

                        reactions.map(
                            (reaction) => (

                                <FloatingReaction

                                    key={
                                        reaction.createdAt
                                    }

                                    reaction={
                                        reaction
                                    }

                                />

                            )
                        )

                    }

                </div>


                {/* =================================
                    Waiting Room
                ================================= */}

                <div className="
                    hidden
                    xl:block
                    w-80
                    border-l
                    bg-white
                    overflow-y-auto
                ">

                    <WaitingRoomSidebar

                        waitingUsers={
                            waitingUsers
                        }

                        approveUser={
                            approveUser
                        }

                        rejectUser={
                            rejectUser
                        }

                    />

                </div>

            </div>


            {/* =================================
                Meeting Controls
            ================================= */}

            <Controls

                cameraEnabled={
                    cameraEnabled
                }

                microphoneEnabled={
                    microphoneEnabled
                }

                onToggleCamera={
                    handleToggleCamera
                }

                onToggleMicrophone={
                    handleToggleMicrophone
                }

                onScreenShare={
                    startScreenShare
                }

                onLeave={
                    leaveMeeting
                }

                onEndMeeting={
                    handleEndMeeting
                }

                isHost={
                    isHost
                }

                onRaiseHand={
                    handleRaiseHand
                }

                onReaction={
                    sendReaction
                }

            />

        </div>

    );

};


export default MeetingRoom;