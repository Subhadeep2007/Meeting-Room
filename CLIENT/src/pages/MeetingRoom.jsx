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
import ChatPanel from "../components/ChatPanel";
import Navbar from "../layout/Navbar.jsx";


const MeetingRoom = () => {

    const navigate = useNavigate();

    const { meetingCode } = useParams();


    // =====================================
    // User
    // =====================================

    

    // =====================================
    // Loading
    // =====================================

    const [loading, setLoading] = useState(true);

    // =====================================
// Meeting ID
// =====================================

const [
    meetingId,
    setMeetingId,
] = useState(null);
    // =====================================
    // Meeting UI States
    // =====================================

    const [speakerView, setSpeakerView] = useState(false);

    const [isFullscreen, setIsFullscreen] = useState(false);

    const [pinnedUser, setPinnedUser] = useState(null);
const [pinNotice, setPinNotice] =
    useState(null);

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
        pinUser,

        lockMeeting,

        meetingLocked,

        endMeeting,

    } = useWebRTC(meetingCode);

const username =
    participants[mySocketId]?.username || "User";

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
// Get MongoDB Meeting ID
// =====================================

useEffect(() => {

    const fetchMeeting = async () => {

        try {

            const { data } =
                await api.get(
                    `/meeting/${meetingCode}`
                );


            setMeetingId(
                data.meeting._id
            );


        } catch (error) {

            console.error(
                "Failed to fetch meeting:",
                error
            );

        }

    };


    if (meetingCode) {

        fetchMeeting();

    }

}, [meetingCode]);


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
useEffect(() => {

    const handlePinned = (event) => {

        setPinNotice({
            pinned: true,

            username:
                event.detail?.pinnedByUsername ||
                "Host",
        });

    };


    const handleUnpinned = () => {

        setPinNotice(null);

    };


    window.addEventListener(
        "participant-pinned",
        handlePinned
    );

    window.addEventListener(
        "participant-unpinned",
        handleUnpinned
    );


    return () => {

        window.removeEventListener(
            "participant-pinned",
            handlePinned
        );

        window.removeEventListener(
            "participant-unpinned",
            handleUnpinned
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
const handlePinParticipant = (participant) => {

    // =========================
    // UNPIN
    // =========================

    if (participant === null) {

        if (pinnedUser) {

            pinUser(
                pinnedUser,
                false
            );

        }

        setPinnedUser(null);

        return;
    }


    // =========================
    // PIN
    // =========================

    pinUser(
        participant,
        true
    );

    setPinnedUser(
        participant
    );

};

    // =====================================
    // Meeting UI
    // =====================================

    return (

        <div
            ref={meetingContainerRef}
            className="
                h-screen
                w-full
                flex
                flex-col
                bg-gray-100
                overflow-hidden
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
                min-h-0
                overflow-hidden
            ">


                {/* =================================
                    Participant Sidebar
                ================================= */}

                <div className="
                    hidden
                    lg:block
                    w-56
                    xl:w-72
                    shrink-0
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

                       onPin={handlePinParticipant}
                        pinnedUser={pinnedUser}

                    />

                </div>


                {/* =================================
                    Video Area
                ================================= */}

                <div className="
                    flex-1
                    min-w-0
                    min-h-0
                    relative
                    bg-black
                    overflow-hidden
                ">


                    {/* =================================
                        Meeting Toolbar
                    ================================= */}

                    <div className="
                        absolute
                        top-2
                        left-2
                        sm:top-3
                        sm:left-3
                        md:top-5
                        md:left-5
                        z-50
                        flex
                        gap-2
                        sm:gap-3
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
                                p-2
                                sm:p-3
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
                                p-2
                                sm:p-3
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
{pinNotice?.pinned && (

    <div className="
        absolute
        top-4
        left-1/2
        -translate-x-1/2
        z-50
        px-4
        py-2
        rounded-lg
        bg-blue-600
        text-white
        text-sm
        font-semibold
        shadow-lg
    ">

        📌 You are pinned by{" "}
        {pinNotice.username}

    </div>

)}

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
                        top-2
                        right-2
                        sm:top-3
                        sm:right-3
                        md:top-5
                        md:right-5
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
    w-64
    2xl:w-80
    shrink-0
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


{/* =================================
    Meeting Chat
================================= */}

<div className="
    
    block
    w-80
    border-l
    border-gray-700
    overflow-hidden
">

    {meetingId ? (

        <ChatPanel

            meetingId={
                meetingId
            }

            meetingCode={
                meetingCode
            }

        />

    ) : (

        <div className="
            h-full
            bg-gray-900
            text-gray-400
            flex
            items-center
            justify-center
            text-sm
        ">

            Loading Chat...

        </div>

    )}

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