import api from "../services/api";

import { useEffect, useRef, useState } from "react";

import {
    Grid2X2,
    Maximize,
    Minimize,
    Users,
    MessageCircle,
    Clock3,
    X,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import useWebRTC from "../hooks/useWebRTC.jsx";

import VideoGrid from "../components/VideoGrid";
import Controls from "../components/Controls";
import EmojiReaction from "../components/EmojiReaction";
import FloatingReaction from "../components/FloatingReaction";
import ParticipantSidebar from "../components/ParticipantSidebar";
import WaitingRoomSidebar from "../components/WaitingRoomSidebar";
import ChatPanel from "../components/ChatPanel";
import Navbar from "../layout/Navbar.jsx";
import FilePanel from "../components/FilePanel.jsx";

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
    const [pinNotice, setPinNotice] = useState(null);

    // =====================================
    // Responsive Side Panels
    // =====================================

    const [activePanel, setActivePanel] = useState(null);

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
 files,
    uploadMeetingFile,
    deleteMeetingFile,
    uploadProgress,
    isUploadingFile,

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
                relative
                flex
                flex-1
                min-h-0
                overflow-hidden
            ">

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


                    {/* =================================
                        Pin Notice
                    ================================= */}

                    {pinNotice?.pinned && (

                        <div className="
                            absolute
                            top-4
                            left-1/2
                            -translate-x-1/2
                            z-50
                            max-w-[85%]
                            px-4
                            py-2
                            rounded-lg
                            bg-blue-600
                            text-white
                            text-xs
                            sm:text-sm
                            font-semibold
                            shadow-lg
                            text-center
                            whitespace-nowrap
                            overflow-hidden
                            text-ellipsis
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


                    {/* =================================
                        Responsive Panel Buttons
                    ================================= */}

                    <div className="
                        absolute
                        bottom-3
                        left-1/2
                        -translate-x-1/2
                        z-50
                        flex
                        items-center
                        gap-2
                        sm:gap-3
                    ">

                        {/* Participants */}

                        <button
                            type="button"
                            onClick={() =>
                                setActivePanel(
                                    activePanel === "participants"
                                        ? null
                                        : "participants"
                                )
                            }
                            className="
                                flex
                                items-center
                                justify-center
                                w-10
                                h-10
                                rounded-full
                                bg-black/70
                                hover:bg-black/90
                                text-white
                                backdrop-blur
                                transition
                                shadow-lg
                            "
                            title="Participants"
                        >
                            <Users size={19} />
                        </button>


                        {/* Chat */}

                        <button
                            type="button"
                            onClick={() =>
                                setActivePanel(
                                    activePanel === "chat"
                                        ? null
                                        : "chat"
                                )
                            }
                            className="
                                flex
                                items-center
                                justify-center
                                w-10
                                h-10
                                rounded-full
                                bg-black/70
                                hover:bg-black/90
                                text-white
                                backdrop-blur
                                transition
                                shadow-lg
                            "
                            title="Chat"
                        >
                            <MessageCircle size={19} />
                        </button>


                        {/* Waiting Room - Host only */}

                        {isHost && (

                            <button
                                type="button"
                                onClick={() =>
                                    setActivePanel(
                                        activePanel === "waiting"
                                            ? null
                                            : "waiting"
                                    )
                                }
                                className="
                                    flex
                                    items-center
                                    justify-center
                                    w-10
                                    h-10
                                    rounded-full
                                    bg-black/70
                                    hover:bg-black/90
                                    text-white
                                    backdrop-blur
                                    transition
                                    shadow-lg
                                "
                                title="Waiting Room"
                            >
                                <Clock3 size={19} />
                            </button>

                        )}


                         {/* Files */}

<button
    type="button"
    onClick={() =>
        setActivePanel(
            activePanel === "files"
                ? null
                : "files"
        )
    }
    className="
        flex
        items-center
        justify-center
        w-10
        h-10
        rounded-full
        bg-black/70
        hover:bg-black/90
        text-white
        backdrop-blur
        transition
        shadow-lg
    "
    title="Files"
>
    📁
</button>


                    </div>

                </div>



               

                {/* =================================
                    Responsive Drawer Overlay
                ================================= */}

                {activePanel && (

                    <div
                        className="
                            absolute
                            inset-0
                            z-[90]
                            bg-black/50
                            backdrop-blur-[1px]
                        "
                        onClick={() =>
                            setActivePanel(null)
                        }
                    />

                )}


                {/* =================================
                    Responsive Participant Drawer
                ================================= */}

                {activePanel === "participants" && (

                    <div className="
                        absolute
                        inset-y-0
                        left-0
                        z-[100]
                        w-[min(88vw,24rem)]
                        max-w-[24rem]
                        bg-gray-900
                        shadow-2xl
                        overflow-hidden
                    ">

                        <div className="
                            h-full
                            relative
                        ">

                            <button
                                type="button"
                                onClick={() =>
                                    setActivePanel(null)
                                }
                                className="
                                    absolute
                                    top-3
                                    right-3
                                    z-20
                                    flex
                                    items-center
                                    justify-center
                                    w-9
                                    h-9
                                    rounded-full
                                    bg-black/60
                                    text-white
                                    hover:bg-black/80
                                "
                                title="Close Participants"
                            >
                                <X size={18} />
                            </button>

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

                                onPin={
                                    handlePinParticipant
                                }

                                pinnedUser={
                                    pinnedUser
                                }

                            />

                        </div>

                    </div>

                )}


                {/* =================================
                    Responsive Waiting Room Drawer
                ================================= */}

                {activePanel === "waiting" && isHost && (

                    <div className="
                        absolute
                        inset-y-0
                        right-0
                        z-[100]
                        w-[min(88vw,24rem)]
                        max-w-[24rem]
                        bg-white
                        shadow-2xl
                        overflow-y-auto
                    ">
                        <button
                            type="button"
                            onClick={() =>
                                setActivePanel(null)
                            }
                            className="
                                absolute
                                top-3
                                right-3
                                z-20
                                flex
                                items-center
                                justify-center
                                w-9
                                h-9
                                rounded-full
                                bg-gray-900
                                text-white
                                hover:bg-gray-700
                            "
                            title="Close Waiting Room"
                        >
                            <X size={18} />
                        </button>

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

                            isHost={
                                isHost
                            }

                        />

                    </div>

                )}


                {/* =================================
                    Responsive Chat Drawer
                ================================= */}

                {activePanel === "chat" && (

                    <div className="
                        absolute
                        inset-y-0
                        right-0
                        z-[100]
                        w-[min(92vw,26rem)]
                        max-w-[26rem]
                        bg-gray-900
                        shadow-2xl
                        overflow-hidden
                    ">

                        <button
                            type="button"
                            onClick={() =>
                                setActivePanel(null)
                            }
                            className="
                                absolute
                                top-3
                                right-3
                                z-20
                                flex
                                items-center
                                justify-center
                                w-9
                                h-9
                                rounded-full
                                bg-black/70
                                text-white
                                hover:bg-black/90
                            "
                            title="Close Chat"
                        >
                            <X size={18} />
                        </button>

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

                )}


                {/* =================================
                    Responsive Files Drawer
                ================================= */}

                {activePanel === "files" && (

                    <div className="
                        absolute
                        inset-y-0
                        right-0
                        z-[100]
                        w-[min(92vw,26rem)]
                        max-w-[26rem]
                        bg-gray-900
                        shadow-2xl
                        overflow-hidden
                    ">

                        <button
                            type="button"
                            onClick={() =>
                                setActivePanel(null)
                            }
                            className="
                                absolute
                                top-3
                                right-3
                                z-20
                                flex
                                items-center
                                justify-center
                                w-9
                                h-9
                                rounded-full
                                bg-black/70
                                text-white
                                hover:bg-black/90
                            "
                            title="Close Files"
                        >

                            <X size={18} />

                        </button>

                        <FilePanel

                            files={files}

                            uploadMeetingFile={
                                uploadMeetingFile
                            }

                            deleteMeetingFile={
                                deleteMeetingFile
                            }

                            uploadProgress={
                                uploadProgress
                            }

                            isUploadingFile={
                                isUploadingFile
                            }

                            currentUserId={
                                participants[mySocketId]?.userId
                            }

                        />

                    </div>

                )}

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