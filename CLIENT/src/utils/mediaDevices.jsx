// =========================================
// Local Media Stream
// =========================================

let localStream = null;


// =========================================
// Get Camera + Microphone
// =========================================

export const getLocalStream = async () => {

    // =====================================
    // Already Available
    // =====================================

    if (localStream) {

        return localStream;

    }


    // =====================================
    // Try Camera + Microphone
    // =====================================

    try {

        localStream =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    width: 1280,

                    height: 720,

                    frameRate: 30,

                    facingMode: "user",

                },

                audio: {

                    echoCancellation: true,

                    noiseSuppression: true,

                    autoGainControl: true,

                },

            });


        console.log(
            "📷 Camera + Microphone stream created"
        );


        return localStream;

    } catch (error) {

        console.warn(
            "⚠️ Camera + Microphone unavailable:",
            error.name,
            error.message
        );

    }


    // =====================================
    // Try Audio Only
    // =====================================

    try {

        localStream =
            await navigator.mediaDevices.getUserMedia({

                audio: {

                    echoCancellation: true,

                    noiseSuppression: true,

                    autoGainControl: true,

                },

                video: false,

            });


        console.log(
            "🎤 Audio-only stream created"
        );


        return localStream;

    } catch (error) {

        console.warn(
            "⚠️ Audio unavailable:",
            error.name,
            error.message
        );

    }


    // =====================================
    // No Media Available
    // =====================================
    // IMPORTANT:
    // Meeting should NOT fail just because
    // camera/microphone is unavailable.
    // =====================================

    console.warn(
        "⚠️ No camera/microphone available. Continuing without media."
    );


    localStream = new MediaStream();


    return localStream;

};


// =========================================
// Get Current Stream
// =========================================

export const getCurrentStream = () => {

    return localStream;

};


// =========================================
// Stop All Tracks
// =========================================

export const stopLocalStream = () => {

    if (!localStream) {

        return;

    }


    localStream
        .getTracks()
        .forEach((track) => {

            track.stop();

        });


    localStream = null;

};


// =========================================
// Toggle Camera
// =========================================

export const toggleCamera = (forceState) => {

    if (!localStream) {

        return false;

    }


    const videoTrack =
        localStream.getVideoTracks()[0];


    if (!videoTrack) {

        console.warn(
            "⚠️ No camera track available"
        );

        return false;

    }


    if (
        typeof forceState === "boolean"
    ) {

        videoTrack.enabled =
            forceState;

    } else {

        videoTrack.enabled =
            !videoTrack.enabled;

    }


    return videoTrack.enabled;

};


// =========================================
// Toggle Microphone
// =========================================

export const toggleMicrophone = () => {

    if (!localStream) {

        return false;

    }


    const audioTrack =
        localStream.getAudioTracks()[0];


    if (!audioTrack) {

        console.warn(
            "⚠️ No microphone track available"
        );

        return false;

    }


    audioTrack.enabled =
        !audioTrack.enabled;


    return audioTrack.enabled;

};


// =========================================
// Replace Camera
// =========================================

export const switchCamera = async () => {

    if (!localStream) {

        return null;

    }


    const devices =
        await navigator.mediaDevices.enumerateDevices();


    const cameras =
        devices.filter(
            (device) =>
                device.kind === "videoinput"
        );


    if (cameras.length < 2) {

        return localStream;

    }


    const currentTrack =
        localStream.getVideoTracks()[0];


    if (!currentTrack) {

        return localStream;

    }


    const currentDeviceId =
        currentTrack
            .getSettings()
            .deviceId;


    const nextCamera =
        cameras.find(
            (camera) =>
                camera.deviceId !==
                currentDeviceId
        );


    if (!nextCamera) {

        return localStream;

    }


    try {

        const newStream =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    deviceId: {

                        exact:
                            nextCamera.deviceId,

                    },

                },

                audio: false,

            });


        const newVideoTrack =
            newStream.getVideoTracks()[0];


        if (!newVideoTrack) {

            return localStream;

        }


        currentTrack.stop();


        localStream.removeTrack(
            currentTrack
        );


        localStream.addTrack(
            newVideoTrack
        );


        return localStream;

    } catch (error) {

        console.error(
            "Switch Camera Error:",
            error
        );


        return localStream;

    }

};