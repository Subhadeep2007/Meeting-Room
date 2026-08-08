// =========================================
// Local Media Stream
// =========================================

let localStream = null;

// =========================================
// Get Camera + Microphone
// =========================================

export const getLocalStream = async () => {

    try {

        if (localStream) {

            return localStream;

        }

        localStream = await navigator.mediaDevices.getUserMedia({

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

        return localStream;

    }

    catch (error) {

        console.error("Media Error :", error);

        throw error;

    }

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

    if (!localStream) return;

    localStream.getTracks().forEach((track) => {

        track.stop();

    });

    localStream = null;

};

// =========================================
// Toggle Camera
// =========================================

// =========================================
// Toggle Camera
// =========================================

export const toggleCamera = (forceState) => {

    if (!localStream) return false;

    const videoTrack = localStream.getVideoTracks()[0];

    if (!videoTrack) return false;

    if (typeof forceState === "boolean") {

        videoTrack.enabled = forceState;

    } else {

        videoTrack.enabled = !videoTrack.enabled;

    }

    return videoTrack.enabled;

};
// =========================================
// Toggle Microphone
// =========================================

export const toggleMicrophone = () => {

    if (!localStream) return false;

    const audioTrack = localStream.getAudioTracks()[0];

    if (!audioTrack) return false;

    audioTrack.enabled = !audioTrack.enabled;

    return audioTrack.enabled;

};

// =========================================
// Replace Camera
// =========================================

export const switchCamera = async () => {

    if (!localStream) return;

    const devices = await navigator.mediaDevices.enumerateDevices();

    const cameras = devices.filter(

        (device) => device.kind === "videoinput"

    );

    if (cameras.length < 2) {

        return localStream;

    }

    const currentTrack = localStream.getVideoTracks()[0];

    const currentDeviceId = currentTrack.getSettings().deviceId;

    const nextCamera = cameras.find(

        (camera) => camera.deviceId !== currentDeviceId

    );

    if (!nextCamera) {

        return localStream;

    }

    const newStream = await navigator.mediaDevices.getUserMedia({

        video: {

            deviceId: {

                exact: nextCamera.deviceId,

            },

        },

        audio: true,

    });

    currentTrack.stop();

    localStream.removeTrack(currentTrack);

    localStream.addTrack(

        newStream.getVideoTracks()[0]

    );

    return localStream;

};