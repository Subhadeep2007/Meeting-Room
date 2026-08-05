import { useEffect, useRef, useState } from "react";

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

    const [localStream, setLocalStream] = useState(null);

    const [remoteStreams, setRemoteStreams] = useState([]);

    const [cameraEnabled, setCameraEnabled] = useState(true);

    const [microphoneEnabled, setMicrophoneEnabled] = useState(true);

    const [connectionState, setConnectionState] =
        useState("new");



        const [participants, setParticipants] = useState({});
        const [reactions, setReactions] = useState([]);

    // ========================================
    // Refs
    // ========================================

    const peersRef = useRef({});

    const socketRef = useRef(socket);

    const analyserRef = useRef(null);

const audioContextRef = useRef(null);

const speakingIntervalRef = useRef(null);

    // ========================================
    // Initialize
    // ========================================

    useEffect(() => {

    const initialize = async () => {

        connectSocket();

        const stream = await getLocalStream();

        setLocalStream(stream);

        startSpeakingDetection();

        socket.emit("join-room", {
            meetingCode,
        });

    };

    initialize();

    return () => {

        socket.emit("leave-room", {
            meetingCode,
        });

        // ✅ Stop Speaking Detection
        clearInterval(speakingIntervalRef.current);

        // ✅ Close AudioContext
        audioContextRef.current?.close();

        // ✅ Close All Peer Connections
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


// ========================================
// Toggle Camera
// ========================================

const handleToggleCamera = () => {

    const enabled = toggleCamera();

    setCameraEnabled(enabled);


    socket.emit(
    "camera-status",
    {
        meetingCode,
        enabled,
    }
);

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

                localStream

                    .getVideoTracks()[0]

            );

        }

    });

};


// ========================================
// Toggle Microphone
// ========================================

const handleToggleMicrophone = () => {

    const enabled = toggleMicrophone();

    setMicrophoneEnabled(enabled);

    socket.emit(

    "microphone-status",

    {

        meetingCode,

        enabled,

    }

);

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

const startSpeakingDetection = () => {

    if (!localStream) return;

    const AudioContext =

        window.AudioContext ||

        window.webkitAudioContext;

    const audioContext =

        new AudioContext();

    audioContextRef.current = audioContext;

    const analyser =

        audioContext.createAnalyser();

    analyser.fftSize = 512;

    analyserRef.current = analyser;

    const microphone =

        audioContext.createMediaStreamSource(

            localStream

        );

    microphone.connect(analyser);

    const dataArray =

        new Uint8Array(

            analyser.frequencyBinCount

        );

    speakingIntervalRef.current =

        setInterval(() => {

            analyser.getByteFrequencyData(

                dataArray

            );

            let sum = 0;

            for (

                let i = 0;

                i < dataArray.length;

                i++

            ) {

                sum += dataArray[i];

            }

            const average =

                sum /

                dataArray.length;

            const speaking =

                average > 18;

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


// ======================================
// Raise Hand
// ======================================

const handleRaiseHand = () => {

    const current =

        participants[socket.id]?.handRaised ?? false;

    socket.emit(

        "raise-hand",

        {

            meetingCode,

            raised: !current,

        }

    );

    setParticipants((prev) => ({

        ...prev,

        [socket.id]: {

            ...prev[socket.id],

            handRaised: !current,

        },

    }));

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

        const sendReaction = (emoji) => {

    socket.emit(

        "send-reaction",

        {

            meetingCode,

            emoji,

        }

    );

};

    });

    setLocalStream(

        cameraStream

    );


    const kickUser=(socketId)=>{

socket.emit(

"kick-user",

{

targetSocketId:socketId,

}

);

};

};
return {

    localStream,

    remoteStreams,


    participants,
mySocketId: socket.id,

    connectionState,

    cameraEnabled,

    microphoneEnabled,

    handleToggleCamera,

    handleToggleMicrophone,

    startScreenShare,

    handleRaiseHand,

    stopScreenShare,


    reactions,

sendReaction,
kickUser,


};



}


export default useWebRTC;