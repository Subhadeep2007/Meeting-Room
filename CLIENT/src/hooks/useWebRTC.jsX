import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import socket, {
    connectSocket,
    disconnectSocket,
} from "../services/socket";

import {
    getLocalStream,
    getCurrentStream,
    stopLocalStream,
    toggleCamera,
    toggleMicrophone,
} from "../utils/mediaDevices";


import {
    initializeUserEncryption,
    getPublicKey,
    createMeetingEncryptionKey,
    getMeetingKey,
    createEncryptedMeetingKeyForUser,
    receiveEncryptedMeetingKey,
    removeMeetingKey,
} from "../services/chatEncryptionManager.jsx";

import {
    importPublicKey,
} from "../services/clientEncryption.jsx";

import { createPeerConnection } from "../utils/peerConnection";

// ========================================
// Hook
// ========================================

const useWebRTC = (meetingCode) => {

    // ========================================
    // State
    // ========================================
    const [mySocketId, setMySocketId] = useState("");
    const [currentUsername, setCurrentUsername] = useState("");
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
// CHAT ENCRYPTION KEY EXCHANGE
// ========================================

useEffect(() => {

    let mounted = true;


    // =====================================
    // Initialize User Encryption
    // =====================================

    const initializeEncryption = async () => {

        try {

            await initializeUserEncryption();

            console.log(
                "🔐 User encryption initialized"
            );

        } catch (error) {

            console.error(
                "❌ Encryption initialization failed:",
                error
            );

        }

    };


    initializeEncryption();


    // =====================================
    // Current User Joined Meeting
    // =====================================

    const handleMeetingUserInfo = async ({
        socketId,
        userId,
        
        isHost,
    }) => {

        if (!mounted) {

            return;

        }


        // =====================================
        // Only Handle Current Socket
        // =====================================

        if (
            socketId !== socket.id
        ) {

            return;

        }

        


        try {

            console.log(
                "🔐 Meeting encryption setup:",
                {
                    userId,
                    isHost,
                }
            );


            // =================================
            // HOST
            // =================================

            if (isHost) {

                const existingKey =
                    await getMeetingKey(
                        meetingCode
                    );


                if (!existingKey) {

                    await createMeetingEncryptionKey(
                        meetingCode
                    );

                    console.log(
                        "🔐 Host created meeting encryption key"
                    );

                }

                 // =================================
    // Tell Chat UI
    // =================================

    window.dispatchEvent(
        new CustomEvent(
            "chat-encryption-ready"
        )
    );


                return;

            }


            // =================================
            // PARTICIPANT
            // =================================

            const publicKey =
                await getPublicKey();


            // Publish public key
            socket.emit(
                "publish-chat-public-key",
                {

                    meetingCode,

                    publicKey,

                }
            );


            console.log(
                "🔐 Public key published"
            );


            // Ask host for encrypted meeting key
            socket.emit(
    "request-chat-encryption-key",
    {
        meetingCode,
        publicKey,
    },
    (response) => {

        if (!response?.success) {

            console.error(
                "❌ Chat key request failed:",
                response?.message
            );

        }

    }
);

            console.log(
                "🔐 Requested meeting encryption key"
            );


        } catch (error) {

            console.error(
                "❌ Meeting encryption setup failed:",
                error
            );

        }

    };


    socket.on(
        "meeting-user-info",
        handleMeetingUserInfo
    );


    return () => {

        mounted = false;

        socket.off(
            "meeting-user-info",
            handleMeetingUserInfo
        );

    };

}, [meetingCode]);




// ========================================
// HOST RECEIVES PARTICIPANT PUBLIC KEY
// ========================================

useEffect(() => {

    const handleChatPublicKey = async ({
        userId,
        publicKey,
    }) => {

        try {

            // =====================================
            // Current User Must Be Host
            // =====================================

            const currentParticipant =
                participants[socket.id];


            if (
                !currentParticipant?.isHost
            ) {

                return;

            }


            if (
                !userId ||
                !publicKey
            ) {

                return;

            }


            console.log(
                "🔐 Participant public key received:",
                userId
            );


            // =====================================
            // Import Participant Public Key
            // =====================================

            const importedPublicKey =
                await importPublicKey(
                    publicKey
                );


            // =====================================
            // Get Meeting AES Key
            // =====================================

            let meetingKey =
                await getMeetingKey(
                    meetingCode
                );


            // Safety: create if missing

            if (!meetingKey) {

                meetingKey =
                    await createMeetingEncryptionKey(
                        meetingCode
                    );

            }


            // =====================================
            // Encrypt Meeting Key
            // For Participant
            // =====================================

            const encryptedMeetingKey =
                await createEncryptedMeetingKeyForUser(

                    meetingCode,

                    importedPublicKey

                );


            // =====================================
            // Send To Participant
            // =====================================

            socket.emit(
                "send-encrypted-chat-key",
                {

                    meetingCode,

                    userId,

                    encryptedMeetingKey,

                }
            );


            console.log(
                "🔐 Encrypted meeting key sent:",
                userId
            );


        } catch (error) {

            console.error(
                "❌ Failed to send encrypted meeting key:",
                error
            );

        }

    };


    socket.on(
        "chat-public-key",
        handleChatPublicKey
    );


    return () => {

        socket.off(
            "chat-public-key",
            handleChatPublicKey
        );

    };

}, [
    meetingCode,
    participants,
]);



useEffect(() => {

    const handleChatKeyRequest = async ({
        meetingCode: requestedMeetingCode,
        userId,
        publicKey,
    }) => {

        try {

            if (
                requestedMeetingCode?.toUpperCase() !==
                meetingCode.toUpperCase()
            ) {

                return;

            }


            if (
                !userId ||
                !publicKey
            ) {

                return;

            }


            const myUserId =
                participants[socket.id]?.userId;


            if (
                myUserId &&
                myUserId.toString() ===
                userId.toString()
            ) {

                return;

            }


            console.log(
                "🔐 Chat key request received from:",
                userId
            );


            // =====================================
            // Get Our AES Meeting Key
            // =====================================

            const meetingKey =
                await getMeetingKey(
                    meetingCode
                );


            if (!meetingKey) {

                console.log(
                    "ℹ️ We do not have meeting encryption key"
                );

                return;

            }


            // =====================================
            // Import Requester's RSA Public Key
            // =====================================

            const importedPublicKey =
                await importPublicKey(
                    publicKey
                );


            // =====================================
            // Encrypt AES Key For Requester
            // =====================================

            const encryptedMeetingKey =
                await createEncryptedMeetingKeyForUser(

                    meetingCode,

                    importedPublicKey

                );


            // =====================================
            // Send Through Server
            // =====================================

            socket.emit(
                "send-encrypted-chat-key",
                {

                    meetingCode,

                    userId,

                    encryptedMeetingKey,

                },
                (response) => {

                    if (
                        !response?.success
                    ) {

                        console.error(
                            "❌ Failed to deliver chat key:",
                            response?.message
                        );

                        return;

                    }


                    console.log(
                        "🔐 Chat key delivered to:",
                        userId
                    );

                }
            );


        } catch (error) {

            console.error(
                "❌ Chat key distribution error:",
                error
            );

        }

    };


    socket.on(
        "chat-key-request",
        handleChatKeyRequest
    );


    return () => {

        socket.off(
            "chat-key-request",
            handleChatKeyRequest
        );

    };


}, [
    meetingCode,
    participants,
]);



// ========================================
// RECEIVE ENCRYPTED MEETING KEY
// ========================================

useEffect(() => {

    const handleEncryptedChatKey = async ({
        meetingCode: encryptedMeetingCode,
        encryptedMeetingKey,
    }) => {

        try {

            if (
                encryptedMeetingCode !==
                meetingCode
            ) {

                return;

            }


            if (
                !encryptedMeetingKey
            ) {

                return;

            }


            console.log(
                "🔐 Encrypted meeting key received"
            );


            // =====================================
            // Decrypt Using Private Key
            // =====================================

            await receiveEncryptedMeetingKey(

                meetingCode,

                encryptedMeetingKey

            );


            console.log(
                "✅ Meeting encryption key ready"
            );


            // =====================================
            // Optional Browser Event
            // =====================================

            window.dispatchEvent(
                new CustomEvent(
                    "chat-encryption-ready"
                )
            );


        } catch (error) {

            console.error(
                "❌ Failed to decrypt meeting key:",
                error
            );

        }

    };


    socket.on(
        "encrypted-chat-key",
        handleEncryptedChatKey
    );


    return () => {

        socket.off(
            "encrypted-chat-key",
            handleEncryptedChatKey
        );

    };

}, [meetingCode]);
// ========================================
// Current Meeting User Info
// ========================================

useEffect(() => {

    const handleMeetingUserInfo = ({
        socketId,
        userId,
        username,
        profilePicture,
        isHost,
        users = [],
    }) => {

        setParticipants((prev) => {

            const updated = {
                ...prev,
            };

            // Current user
            updated[socketId] = {

                ...(updated[socketId] || {}),

                socketId,
                userId,
                username,
                profilePicture,
                isHost,
                isOnline: true,

            };

            // Existing users already inside the meeting
            users.forEach((user) => {

                updated[user.socketId] = {

                    ...(updated[user.socketId] || {}),

                    socketId: user.socketId,
                    userId: user.userId,
                    username: user.username,
                    profilePicture: user.profilePicture,
                    cameraEnabled:
                        updated[user.socketId]?.cameraEnabled ?? true,
                    microphoneEnabled:
                        updated[user.socketId]?.microphoneEnabled ?? true,
                    handRaised:
                        updated[user.socketId]?.handRaised ?? false,
                    isSpeaking:
                        updated[user.socketId]?.isSpeaking ?? false,
                    isHost: user.isHost ?? false,
                    isOnline: true,

                };

            });

            return updated;

        });


        // ========================================
    // REQUEST CURRENT MEDIA STATUS
    // FROM EXISTING USERS
    // ========================================

    if (
        socketId === socket.id &&
        users.length > 0
    ) {

        socket.emit(
            "request-media-status",
            {
                meetingCode,
            }
        );

    }


        if (socketId === socket.id) {

            setCurrentUsername(username);

        }

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
// REQUEST CURRENT MEDIA STATUS
// ========================================

useEffect(() => {

    const handleMediaStatusRequest = ({
        requesterSocketId,
    }) => {

        // =====================================
        // Send My Current Camera Status
        // =====================================

        socket.emit(
            "media-status-response",
            {
                targetSocketId:
                    requesterSocketId,

                meetingCode,

                cameraEnabled,

                microphoneEnabled,
            }
        );

    };


    socket.on(
        "request-media-status",
        handleMediaStatusRequest
    );


    return () => {

        socket.off(
            "request-media-status",
            handleMediaStatusRequest
        );

    };

}, [
    meetingCode,
    cameraEnabled,
    microphoneEnabled,
]);


// ========================================
// RECEIVE MEDIA STATUS
// ========================================

useEffect(() => {

    const handleMediaStatusResponse = ({
        socketId,
        cameraEnabled,
        microphoneEnabled,
    }) => {

        setParticipants((prev) => ({

            ...prev,

            [socketId]: {

                ...prev[socketId],

                cameraEnabled,

                microphoneEnabled,

            },

        }));

    };


    socket.on(
        "media-status-response",
        handleMediaStatusResponse
    );


    return () => {

        socket.off(
            "media-status-response",
            handleMediaStatusResponse
        );

    };

}, []);



// ========================================
// Existing Meeting Users
// ========================================

useEffect(() => {

    const handleExistingMeetingUsers = (
        existingUsers
    ) => {

        console.log(
            "👥 EXISTING MEETING USERS:",
            existingUsers
        );

        setParticipants((prev) => {

            const updated = {
                ...prev,
            };

            existingUsers.forEach((user) => {

                updated[user.socketId] = {
                    ...(updated[user.socketId] || {}),

                    socketId:
                        user.socketId,

                    userId:
                        user.userId,

                    username:
                        user.username,

                    profilePicture:
                        user.profilePicture,
  cameraEnabled:
                        updated[user.socketId]
                            ?.cameraEnabled ?? true,

                    microphoneEnabled:
                        updated[user.socketId]
                            ?.microphoneEnabled ?? true,

                    handRaised:
                        updated[user.socketId]
                            ?.handRaised ?? false,

                    isSpeaking:
                        updated[user.socketId]
                            ?.isSpeaking ?? false,

                    isHost:
                        user.isHost ?? false,
                    
                };

            });

            return updated;

        });

    };


    socket.on(
        "existing-meeting-users",
        handleExistingMeetingUsers
    );


    return () => {

        socket.off(
            "existing-meeting-users",
            handleExistingMeetingUsers
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
// Existing Waiting Users
// ========================================

useEffect(() => {

    const handleExistingWaitingUsers = (
        users = []
    ) => {

        console.log(
            "⏳ EXISTING WAITING USERS:",
            users
        );

        setWaitingUsers(users);

    };


    socket.on(
        "existing-waiting-users",
        handleExistingWaitingUsers
    );


    return () => {

        socket.off(
            "existing-waiting-users",
            handleExistingWaitingUsers
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
console.log(
    "CURRENT STREAM:",
    getCurrentStream()
);

console.log(
    "VIDEO TRACKS:",
    getCurrentStream()?.getVideoTracks()
);

console.log(
    "AUDIO TRACKS:",
    getCurrentStream()?.getAudioTracks()
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
// ========================================
// Participant Pinned
// ========================================

useEffect(() => {

    const handleUserPinned = ({
        pinned,
        pinnedBy,
        pinnedByUsername,
    }) => {

        if (pinned) {

            console.log(
                "📌 YOU ARE PINNED BY:",
                pinnedByUsername
            );

            window.dispatchEvent(
                new CustomEvent(
                    "participant-pinned",
                    {
                        detail: {
                            pinned: true,
                            pinnedBy,
                            pinnedByUsername,
                        },
                    }
                )
            );

        } else {

            console.log(
                "📌 YOU ARE UNPINNED"
            );

            window.dispatchEvent(
                new CustomEvent(
                    "participant-unpinned"
                )
            );

        }

    };


    socket.on(
        "user-pinned",
        handleUserPinned
    );


    return () => {

        socket.off(
            "user-pinned",
            handleUserPinned
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
    setParticipants((prev) => ({
    ...prev,

    [socket.id]: {
        ...prev[socket.id],

        cameraEnabled: enabled,
    },

}));

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
    setParticipants((prev) => ({
    ...prev,

    [socket.id]: {
        ...prev[socket.id],

        microphoneEnabled: enabled,
    },

}));

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

    // =====================================
    // No Stream
    // =====================================

    if (!stream) {

        console.log(
            "ℹ️ Speaking detection skipped: no stream"
        );

        return;

    }

    // =====================================
    // Check Microphone Track
    // =====================================

    const audioTracks =
        stream.getAudioTracks();

    if (audioTracks.length === 0) {

        console.log(
            "ℹ️ Speaking detection skipped: no microphone"
        );

        return;

    }

    // =====================================
    // Clear Existing Detection
    // =====================================

    if (speakingIntervalRef.current) {

        clearInterval(
            speakingIntervalRef.current
        );

        speakingIntervalRef.current = null;

    }

    // =====================================
    // Audio Context
    // =====================================

    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContext) {

        console.warn(
            "⚠️ AudioContext is not supported"
        );

        return;

    }

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

    // =====================================
    // No Camera Available
    // =====================================

    if (!cameraTrack) {

        console.warn(
            "⚠️ Cannot restore camera: no camera track available"
        );

        setLocalStream(
            cameraStream
        );

        return;

    }

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

// ======================================
// Pin / Unpin User
// ======================================

const pinUser = (participant, pinned) => {

    if (!participant) {
        return;
    }

    socket.emit(
        "pin-user",
        {
            meetingCode,

            targetSocketId:
                participant.socketId,

            targetUserId:
                participant.userId,

            pinned,
        },
        (response) => {

            console.log(
                "📌 Pin Response:",
                response
            );

        }
    );

};

const kickUser = (participant) => {

    socket.emit(
        "kick-user",
        {
            meetingCode,
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
            meetingCode,
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
            meetingCode,
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
pinUser,

lockMeeting,
meetingLocked,

endMeeting,

};

};




export default useWebRTC;