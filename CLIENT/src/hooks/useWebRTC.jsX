

import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import socket, {
    connectSocket,
    disconnectSocket,
} from "../services/socket";

import {
    getLocalStream,
    stopLocalStream,
    toggleCamera,
    toggleMicrophone,
} from "../utils/mediaDevices";

import { createPeerConnection } from "../utils/peerConnection";

// ========================================
// Hook
// ========================================

const useWebRTC = (meetingCode) => {

    // ========================================
    // State
    // ========================================
    const [mySocketId, setMySocketId] = useState("");
    const [localStream, setLocalStream] = useState(null);

    const [remoteStreams, setRemoteStreams] = useState([]);

    const [cameraEnabled, setCameraEnabled] = useState(true);

    const [microphoneEnabled, setMicrophoneEnabled] = useState(true);

    const [connectionState, setConnectionState] =
        useState("new");



        const [participants, setParticipants] = useState({});
        const [reactions, setReactions] = useState([]);
        const [waitingUsers, setWaitingUsers] = useState([]);
        const [meetingLocked, setMeetingLocked] = useState(false);
        const [isWaiting, setIsWaiting] = useState(false);
        const meetingId = meetingCode;

    // ========================================
    // Refs
    // ========================================

    const peersRef = useRef({});

    const socketRef = useRef(socket);

    const analyserRef = useRef(null);

const audioContextRef = useRef(null);

const speakingIntervalRef = useRef(null);

// ========================================
// Current Meeting User Info
// ========================================

useEffect(() => {

    const handleMeetingUserInfo = ({
        socketId,
        userId,
        isHost,
    }) => {

        setParticipants((prev) => ({

            ...prev,

            [socketId]: {

                ...(prev[socketId] || {}),

                socketId,

                userId,

                isHost,

            },

        }));

    };

    socket.on(
        "meeting-user-info",
        handleMeetingUserInfo
    );

    return () => {

        socket.off(
            "meeting-user-info",
            handleMeetingUserInfo
        );

    };

}, []);


// ========================================
// Meeting Locked → Waiting Room
// ========================================

// ========================================
// Waiting User
// ========================================

useEffect(() => {

    const handleMeetingLocked = ({
        meetingCode: lockedMeetingCode,
        message,
    }) => {

        console.log(
            "🔒 MEETING LOCKED - USER IS WAITING:",
            lockedMeetingCode,
            message
        );

        setIsWaiting(true);
        setMeetingLocked(true);
    };

    socket.on(
        "meeting-locked",
        handleMeetingLocked
    );

    return () => {

        socket.off(
            "meeting-locked",
            handleMeetingLocked
        );

    };

}, []);

    // ========================================
    // Initialize
    // ========================================

    useEffect(() => {

   const initializeMedia = async () => {

    try {

        console.log(
            "🚀 INITIALIZING MEETING:",
            meetingCode
        );

        // =====================================
        // Get User Settings
        // =====================================

        const { data } = await api.get(
            "/user/settings"
        );

        const settings = data.settings;

        console.log(
            "⚙️ User Settings:",
            settings
        );


        // =====================================
        // Get Local Media
        // =====================================

        const stream = await getLocalStream();

        console.log(
            "📷 Camera/Mic Stream:",
            stream
        );


        // =====================================
        // Apply Camera Setting
        // =====================================

        const cameraState =
            settings?.cameraEnabled ?? true;

        stream
            .getVideoTracks()
            .forEach((track) => {

                track.enabled = cameraState;

            });

        setCameraEnabled(cameraState);


        // =====================================
        // Apply Microphone Setting
        // =====================================

        const microphoneState =
            settings?.microphoneEnabled ?? true;

        stream
            .getAudioTracks()
            .forEach((track) => {

                track.enabled = microphoneState;

            });

        setMicrophoneEnabled(
            microphoneState
        );


        // =====================================
        // Save Local Stream
        // =====================================

        setLocalStream(stream);


        console.log(
            "📷 Camera Enabled:",
            cameraState
        );

        console.log(
            "🎤 Microphone Enabled:",
            microphoneState
        );


        // =====================================
        // Join Meeting
        // =====================================

        console.log(
            "📡 EMITTING join-room:",
            meetingCode
        );

        socket.emit(
            "join-room",
            {
                meetingCode,
            },
            (response) => {

                console.log(
                    "📡 join-room response:",
                    response
                );

            }
        );


        // =====================================
        // Speaking Detection
        // =====================================

        startSpeakingDetection(stream);


    } catch (error) {

        console.error(
            "❌ Initialization Error:",
            error.response?.data ||
            error.message ||
            error
        );

    }

};

    // ===========================
    // Socket Connected
    // ===========================

    socket.on("connect", async () => {

        console.log("Socket Connected:", socket.id);

        setMySocketId(socket.id);

        await initializeMedia();

    });

    // ===========================
    // Connect Socket
    // ===========================

    if (socket.connected) {

        console.log("Socket Already Connected");

        setMySocketId(socket.id);

        initializeMedia();

    }

    else {

        connectSocket();

    }

    // ===========================
    // Cleanup
    // ===========================

    return () => {

        socket.emit("leave-room", {
            meetingCode,
        });

        socket.off("connect");

        clearInterval(speakingIntervalRef.current);

        audioContextRef.current?.close();

        Object.values(peersRef.current).forEach((peer) => {

            peer.close();

        });

        peersRef.current = {};

        setRemoteStreams([]);

        stopLocalStream();

        disconnectSocket();

    };

}, [meetingCode]);





    // ========================================
// Create Peer
// ========================================

const createPeer = (targetSocketId) => {


    if (!localStream) {

    console.log("Local stream not ready");

    return;

}

    const peer = createPeerConnection({

        localStream,


        

        onIceCandidate: (candidate) => {

            socket.emit("ice-candidate", {

                targetSocketId,

                candidate,

            });

        },

        onTrack: (stream) => {

            setRemoteStreams((prev) => {

                const exists = prev.find(

                    (item) => item.socketId === targetSocketId

                );

                if (exists) {

                    return prev.map((item) =>

                        item.socketId === targetSocketId

                            ? { ...item, stream }

                            : item

                    );

                }

                return [

                    ...prev,

                    {

                        socketId: targetSocketId,

                        stream,

                    },

                ];

            });

        },

        onConnectionStateChange: (state) => {

            setConnectionState(state);

        },

    });

    peersRef.current[targetSocketId] = peer;

    return peer;

};



useEffect(() => {

    socket.on(

        "existing-users",

        async (users) => {


            setParticipants((prev) => {

                const updated = { ...prev };

                users.forEach((user) => {

                    updated[user.socketId] = {

                        socketId: user.socketId,

                        userId: user.userId,

                        username: user.username,

                        profilePicture: user.profilePicture,

                        cameraEnabled: true,

                        microphoneEnabled: true,

                        handRaised: false,

                        isSpeaking: false,

                        isHost: user.isHost || false,

                        isCoHost: false,

                        isOnline: true,

                        joinedAt: new Date(),

                    };

                });

                return updated;

            });

            for (const user of users) {

                if (user.socketId === socket.id) continue;

                const peer = createPeer(

                    user.socketId

                );

                const offer = await peer.createOffer();

                await peer.setLocalDescription(

                    offer

                );

                socket.emit(

                    "offer",

                    {

                        targetSocketId:

                            user.socketId,

                        offer,

                    }

                );

            }

        }

    );

    return () => {

        socket.off("existing-users");

    };

}, [localStream]);


useEffect(() => {

    socket.on(

        "offer",

        async ({

            offer,

            from,

        }) => {

            const peer = createPeer(from);

            await peer.setRemoteDescription(

                new RTCSessionDescription(

                    offer

                )

            );

            const answer =

                await peer.createAnswer();

            await peer.setLocalDescription(

                answer

            );

            socket.emit(

                "answer",

                {

                    targetSocketId: from,

                    answer,

                }

            );

        }

    );

    return () => {

        socket.off("offer");

    };

}, [localStream]);

useEffect(() => {

    socket.on(

        "answer",

        async ({

            answer,

            from,

        }) => {

            const peer =

                peersRef.current[from];

            if (!peer) return;

            await peer.setRemoteDescription(

                new RTCSessionDescription(

                    answer

                )

            );

        }

    );

    return () => {

        socket.off("answer");

    };

}, []);


useEffect(() => {

    socket.on(

        "ice-candidate",

        async ({

            candidate,

            from,

        }) => {

            const peer =

                peersRef.current[from];

            if (!peer) return;

            await peer.addIceCandidate(

                new RTCIceCandidate(

                    candidate

                )

            );

        }

    );

    return () => {

        socket.off(

            "ice-candidate"

        );

    };

}, []);





// ========================================
// User Joined
// ========================================

useEffect(() => {

    socket.on(

        "user-joined",

        async (user) => {

            setParticipants((prev)=>({

...prev,

[user.socketId]:{

socketId:user.socketId,

userId:user.userId,

username:user.username,

profilePicture:user.profilePicture,

cameraEnabled:true,

microphoneEnabled:true,

handRaised:false,

isSpeaking:false,

isHost:false,

isCoHost:false,

isOnline:true,

joinedAt:new Date(),

}

}));

            console.log(

                `${user.username} joined`

            );

            // Ignore Self
            if (user.socketId === socket.id) {

                return;

            }

            // Avoid Duplicate Peer
            if (peersRef.current[user.socketId]) {

                return;

            }

            const peer = createPeer(

                user.socketId

            );

            const offer =

                await peer.createOffer();

            await peer.setLocalDescription(

                offer

            );

            socket.emit(

                "offer",

                {

                    targetSocketId:

                        user.socketId,

                    offer,

                }

            );

        }

    );

    return () => {

        socket.off(

            "user-joined"

        );

    };

}, [localStream]);




// ========================================
// User Left
// ========================================


useEffect(() => {

    socket.on(

        "user-left",

        ({ socketId }) => {

            console.log(socketId, "Left");

            // ==========================
            // Close Peer
            // ==========================

            const peer = peersRef.current[socketId];

            if (peer) {

                peer.close();

                delete peersRef.current[socketId];

            }

            // ==========================
            // Remove Video
            // ==========================

            setRemoteStreams((prev) =>
                prev.filter(
                    (user) =>
                        user.socketId !== socketId
                )
            );

            // ==========================
            // Remove Participant
            // ==========================

            setParticipants((prev) => {

                const updated = { ...prev };

                delete updated[socketId];

                return updated;

            });

        }

    );

    return () => {

        socket.off("user-left");

    };

}, []);

// ========================================
// Meeting Ended By Host
// ========================================

useEffect(() => {

    const handleMeetingEnded = ({
        meetingCode: endedMeetingCode,
        message,
    }) => {

        console.log(
            "Meeting Ended:",
            endedMeetingCode,
            message
        );

        // ================================
        // Close All Peer Connections
        // ================================

        Object.values(
            peersRef.current
        ).forEach((peer) => {

            peer.close();

        });

        peersRef.current = {};

        // ================================
        // Stop Local Media
        // ================================

        stopLocalStream();

        // ================================
        // Clear Remote Streams
        // ================================

        setRemoteStreams([]);

        // ================================
        // Redirect To Dashboard
        // ================================

        window.location.href = "/dashboard";

    };

    socket.on(
        "meeting-ended",
        handleMeetingEnded
    );

    return () => {

        socket.off(
            "meeting-ended",
            handleMeetingEnded
        );

    };

}, []);

useEffect(() => {

    socket.on(

        "camera-status-changed",

        ({

            socketId,

            enabled,

        }) => {

            setParticipants((prev) => ({

                ...prev,

                [socketId]: {

                    ...prev[socketId],

                    cameraEnabled: enabled,

                },

            }));

        }

    );

    return () => {

        socket.off("camera-status-changed");

    };

}, []);


useEffect(() => {

    socket.on(

        "speaking-status-changed",

        ({

            socketId,

            speaking,

        }) => {

            setParticipants((prev)=>({

                ...prev,

                [socketId]:{

                    ...prev[socketId],

                    isSpeaking:speaking,

                }

            }));

        }

    );

    return()=>{

        socket.off(

            "speaking-status-changed"

        );

    };

},[]);


useEffect(() => {

    socket.on(

        "microphone-status-changed",

        ({

            socketId,

            enabled,

        }) => {

            setParticipants((prev) => ({

                ...prev,

                [socketId]: {

                    ...prev[socketId],

                    microphoneEnabled: enabled,

                },

            }));

        }

    );

    return () => {

        socket.off(

            "microphone-status-changed"

        );

    };

}, []);
useEffect(() => {

    socket.on(

        "raise-hand-changed",

        ({

            socketId,

            raised,

        }) => {

            setParticipants((prev) => ({

                ...prev,

                [socketId]: {

                    ...prev[socketId],

                    handRaised: raised,

                },

            }));

        }

    );

    return () => {

        socket.off(

            "raise-hand-changed"

        );

    };

}, []);





useEffect(() => {

    const handleWaitingUser = (user) => {

        console.log(
            "🚨 NEW WAITING USER:",
            user
        );

        setWaitingUsers((prev) => {

            const exists = prev.some(
                (item) =>
                    item.userId === user.userId
            );

            if (exists) {
                return prev;
            }

            return [
                ...prev,
                user,
            ];

        });

    };

    socket.on(
        "waiting-user",
        handleWaitingUser
    );

    return () => {

        socket.off(
            "waiting-user",
            handleWaitingUser
        );

    };

}, []);
useEffect(() => {

    const handleWaitingUserRemoved = ({
        userId,
    }) => {

        setWaitingUsers((prev) =>
            prev.filter(
                (user) =>
                    user.userId !== userId
            )
        );

    };

    socket.on(
        "waiting-user-removed",
        handleWaitingUserRemoved
    );

    return () => {

        socket.off(
            "waiting-user-removed",
            handleWaitingUserRemoved
        );

    };

}, []);


// ========================================
// User Approved
// ========================================

useEffect(() => {

    const handleUserApproved = ({
        userId,
        socketId,
        meetingCode: approvedMeetingCode,
    }) => {

        // =====================================
        // Check Current Socket
        // =====================================

        if (socketId !== socket.id) {

            return;

        }

        console.log(
            "Host Approved Me:",
            userId
        );

        // =====================================
        // Remove Waiting State
        // =====================================

        setIsWaiting(false);

        // =====================================
        // Join Actual Meeting Room
        // =====================================

        socket.emit(
            "join-room",
            {
                meetingCode:
                    approvedMeetingCode ||
                    meetingCode,
            }
        );

    };

    socket.on(
        "user-approved",
        handleUserApproved
    );

    return () => {

        socket.off(
            "user-approved",
            handleUserApproved
        );

    };

}, [meetingCode]);


useEffect(() => {

    socket.on(

        "user-rejected",

        ({ userId }) => {

            setWaitingUsers(

                (prev) =>

                    prev.filter(

                        (user) =>

                            user.userId !== userId

                    )

            );

        }

    );

    return () => {

        socket.off(

            "user-rejected"

        );

    };

}, []);
// ======================================
// Remove Waiting User
// ======================================

useEffect(() => {

    socket.on("waiting-user-removed", ({ userId }) => {

        setWaitingUsers((prev) =>
            prev.filter((user) => user.userId !== userId)
        );

    });

    return () => {

        socket.off("waiting-user-removed");

    };

}, []);


useEffect(() => {

    socket.on(

        "reaction-received",

        (reaction) => {

            setReactions(

                (prev) => [

                    ...prev,

                    reaction,

                ]

            );

            setTimeout(() => {

                setReactions(

                    (prev) =>

                        prev.filter(

                            (item) =>

                                item.createdAt !== reaction.createdAt

                        )

                );

            }, 3000);

        }

    );

    return () => {

        socket.off(

            "reaction-received"

        );

    };

}, []);
useEffect(()=>{

socket.on(

"kicked",

()=>{

alert(

"You have been removed by Host."

);

window.location.href="/dashboard";

});

return()=>{

socket.off(

"kicked"

);

};

},[]);
useEffect(() => {

    socket.on("force-mute", () => {

        handleToggleMicrophone(false);

    });

    socket.on("force-camera-off", () => {

        handleToggleCamera(false);

    });

   socket.on(
    "meeting-lock-status",
    ({ locked }) => {

        console.log(
            "🔐 Meeting Lock Status:",
            locked
        );

        setMeetingLocked(locked);

        // If meeting is unlocked
        if (!locked) {
            setIsWaiting(false);
        }

    }
);


    
    return () => {

        socket.off("force-mute");

        socket.off("force-camera-off");

        socket.off("meeting-lock-status");

       

    };

}, []);


// ========================================
// Toggle Camera
// ========================================

// ========================================
// Toggle Camera
// ========================================

const handleToggleCamera = (forceState) => {

    if (!localStream) {

        console.log("Local stream not available");

        return;

    }

    const enabled = toggleCamera(forceState);

    setCameraEnabled(enabled);

    // =====================================
    // Tell Other Participants
    // =====================================

    socket.emit(
        "camera-status",
        {
            meetingCode,
            enabled,
        }
    );

};


// ========================================
// Toggle Microphone
// ========================================

// ========================================
// Toggle Microphone
// ========================================

const handleToggleMicrophone = (forceState) => {

    if (!localStream) {

        console.log(
            "Local stream not available"
        );

        return;

    }

    let enabled;

    if (typeof forceState === "boolean") {

        const audioTracks =
            localStream.getAudioTracks();

        audioTracks.forEach((track) => {

            track.enabled = forceState;

        });

        enabled = forceState;

    } else {

        enabled = toggleMicrophone();

    }

    setMicrophoneEnabled(enabled);

    socket.emit(
        "microphone-status",
        {
            meetingCode,
            enabled,
        }
    );

    // =====================================
    // Update Peer Audio Tracks
    // =====================================

    Object.values(
        peersRef.current
    ).forEach((peer) => {

        const sender = peer
            .getSenders()
            .find(
                (sender) =>
                    sender.track?.kind === "audio"
            );

        if (sender) {

            sender.replaceTrack(
                localStream
                    .getAudioTracks()[0]
            );

        }

    });

};

// ======================================
// Start Speaking Detection
// ======================================

const startSpeakingDetection = (stream) => {

    if (!stream) return;

    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

    const audioContext = new AudioContext();

    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 512;

    analyserRef.current = analyser;

    // ===============================
    // Use Passed Stream
    // ===============================

    const microphone =
        audioContext.createMediaStreamSource(stream);

    microphone.connect(analyser);

    const dataArray = new Uint8Array(
        analyser.frequencyBinCount
    );

    speakingIntervalRef.current = setInterval(() => {

        analyser.getByteFrequencyData(dataArray);

        let sum = 0;

        for (let i = 0; i < dataArray.length; i++) {

            sum += dataArray[i];

        }

        const average = sum / dataArray.length;

        const speaking = average > 18;

        socket.emit(
            "speaking-status",
            {
                meetingCode,
                speaking,
            }
        );

    }, 250);

};



const startScreenShare = async () => {

    try {

        const screenStream =

            await navigator

                .mediaDevices

                .getDisplayMedia({

                    video: true,

                });

        const screenTrack =

            screenStream

                .getVideoTracks()[0];

        Object.values(

            peersRef.current

        ).forEach((peer) => {

            const sender = peer

                .getSenders()

                .find(

                    (sender) =>

                        sender.track?.kind === "video"

                );

            if (sender) {

                sender.replaceTrack(

                    screenTrack

                );

            }

        });

        setLocalStream(

            screenStream

        );

        screenTrack.onended = () => {

            stopScreenShare();

        };

    }

    catch (error) {

        console.log(error);

    }

};
const joinWaitingRoom = () => {

    socket.emit(
        "waiting-room-join",
        {
            meetingId,
        },
        (response) => {

            console.log(
                "Waiting Room Response:",
                response
            );

            if (
                response?.success &&
                response?.waiting
            ) {

                setIsWaiting(true);

            }

        }
    );

};
const approveUser = (userId) => {

    socket.emit(

        "approve-user",

        {

            meetingId,

            userId,

        },

        (response) => {

            console.log(response);

        }

    );

};
const rejectUser = (userId) => {

    socket.emit(

        "reject-user",

        {

            meetingId,

            userId,

        },

        (response) => {

            console.log(response);

        }

    );

};

// ======================================
// Raise Hand
// ======================================

const handleRaiseHand = () => {

    const current =
        participants[socket.id]?.handRaised ?? false;

    const newRaisedState = !current;

    // =====================================
    // Tell Server
    // =====================================

    socket.emit(
        "raise-hand",
        {
            meetingCode,
            raised: newRaisedState,
        }
    );

    // =====================================
    // Update Local Participant
    // =====================================

    setParticipants((prev) => ({

        ...prev,

        [socket.id]: {

            ...prev[socket.id],

            handRaised: newRaisedState,

        },

    }));

    // =====================================
    // Remove Notification When Hand Down
    // =====================================

    if (!newRaisedState) {

        window.dispatchEvent(

            new CustomEvent(
                "remove-raise-hand-notification",
                {
                    detail: {
                        socketId: socket.id,
                        userId:
                            participants[socket.id]?.userId,
                    },
                }
            )

        );

    }

};
const sendReaction = (emoji) => {

    socket.emit(

        "send-reaction",

        {

            meetingCode,

            emoji,

        }

    );

};

const stopScreenShare = async () => {

    const cameraStream =

        await getLocalStream();

    const cameraTrack =

        cameraStream

            .getVideoTracks()[0];

    Object.values(

        peersRef.current

    ).forEach((peer) => {

        const sender = peer

            .getSenders()

            .find(

                (sender) =>

                    sender.track?.kind === "video"

            );

        if (sender) {

            sender.replaceTrack(

                cameraTrack

            );

        }

        

    });

    setLocalStream(

        cameraStream

    );
};

const kickUser = (participant) => {

    socket.emit(
        "kick-user",
        {
            meetingId,
            targetSocketId: participant.socketId,
            targetUserId: participant.userId,
        },
        (response) => {

            console.log(response);

        }
    );

};


const muteUser = (participant) => {

    socket.emit(
        "mute-user",
        {
            meetingId,
            targetSocketId: participant.socketId,
            targetUserId: participant.userId,
        },
        (response) => {

            console.log(response);

        }
    );

};
const disableCamera = (participant) => {

    socket.emit(
        "disable-camera",
        {
            meetingId,
            targetSocketId: participant.socketId,
            targetUserId: participant.userId,
        },
        (response) => {

            console.log(response);

        }
    );

};


const lockMeeting = (locked) => {

    socket.emit(
        "lock-meeting",
        {
            meetingId,
            locked,
        },
        (response) => {

            console.log(response);

        }
    );

};

// ======================================
// End Meeting
// ======================================

const endMeeting = async () => {

    try {

        const response = await api.put(
            `/meeting/end/${meetingId}`
        );

        console.log(
            "Meeting Ended:",
            response.data
        );

        return response.data;

    } catch (error) {

        console.error(
            "End Meeting Error:",
            error.response?.data || error.message
        );

        throw error;

    }

};


return {

    localStream,

    remoteStreams,


    participants,
mySocketId,

    connectionState,

    cameraEnabled,

    microphoneEnabled,

    handleToggleCamera,

    handleToggleMicrophone,

    startScreenShare,


    waitingUsers,
    isWaiting,

joinWaitingRoom,

approveUser,

rejectUser,

    handleRaiseHand,

    stopScreenShare,


    reactions,

sendReaction,
kickUser,
muteUser,
disableCamera,

lockMeeting,
meetingLocked,

endMeeting,

};

};




export default useWebRTC;