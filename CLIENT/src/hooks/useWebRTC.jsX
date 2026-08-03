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

    // ========================================
    // Refs
    // ========================================

    const peersRef = useRef({});

    const socketRef = useRef(socket);

    // ========================================
    // Initialize
    // ========================================

    useEffect(() => {

        const initialize = async () => {

            try {

                // Connect Socket
                connectSocket();

                // Get Camera + Mic
                const stream = await getLocalStream();

                setLocalStream(stream);

                // Join Meeting Room
                socket.emit("join-room", {

                    meetingCode,

                });

            }

            catch (error) {

                console.log(error);

            }

        };

        initialize();

        return () => {

            socket.emit("leave-room", {

                meetingCode,

            });

           Object.values(peersRef.current).forEach(

        (peer) => {

            peer.close();

        }

    );

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

            console.log(

                socketId,

                "Left"

            );

            // Close Peer

            const peer =

                peersRef.current[socketId];

            if (peer) {

                peer.close();

                delete peersRef.current[socketId];

            }

            // Remove Video

            setRemoteStreams((prev) =>

                prev.filter(

                    (user) =>

                        user.socketId !== socketId

                )

            );

        }

    );

    return () => {

        socket.off(

            "user-left"

        );

    };

}, []);
}