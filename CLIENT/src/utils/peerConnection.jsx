// =========================================
// STUN / TURN Configuration
// =========================================

const configuration = {

    iceServers: [

        // Google STUN
        {
            urls: "stun:stun.l.google.com:19302",
        },

        // Google Backup
        {
            urls: "stun:stun1.l.google.com:19302",
        },

        // Production TURN (Replace Later)
        /*
        {
            urls: "turn:your-turn-server.com:3478",
            username: "username",
            credential: "password",
        },
        */

    ],

};

// =========================================
// Create Peer Connection
// =========================================

export const createPeerConnection = ({

    localStream,

    onIceCandidate,

    onTrack,

    onConnectionStateChange,

}) => {

    const peer = new RTCPeerConnection(configuration);

    // =========================================
    // Add Local Tracks
    // =========================================

    if (localStream) {

        localStream.getTracks().forEach((track) => {

            peer.addTrack(track, localStream);

        });

    }

    // =========================================
    // ICE Candidate
    // =========================================

    peer.onicecandidate = (event) => {

        if (event.candidate) {

            onIceCandidate?.(event.candidate);

        }

    };

    // =========================================
    // Remote Stream
    // =========================================

    peer.ontrack = (event) => {

        const remoteStream = event.streams[0];

        onTrack?.(remoteStream);

    };

    // =========================================
    // Connection State
    // =========================================

    peer.onconnectionstatechange = () => {

    console.log(

        "Connection State:",

        peer.connectionState

    );

    onConnectionStateChange?.(

        peer.connectionState

    );

};

    // =========================================
    // ICE Connection State
    // =========================================

    peer.oniceconnectionstatechange = () => {

        console.log(

            "ICE State:",

            peer.iceConnectionState

        );

    };

    return peer;

};

// =========================================
// Close Peer Connection
// =========================================

export const closePeerConnection = (peer) => {

    if (!peer) return;

    peer.getSenders().forEach((sender) => {

        if (sender.track) {

            sender.track.stop();

        }

    });

    peer.close();

};