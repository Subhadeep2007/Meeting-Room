import VideoPlayer from "./VideoPlayer";

const VideoGrid = ({

    localStream,

    remoteStreams,

    participants,

    mySocketId,

    username,

    cameraEnabled,

    microphoneEnabled,

    connectionState,

}) => {

    const totalUsers = remoteStreams.length + 1;

    let gridClass = "";

    if (totalUsers === 1) {

        gridClass = "grid-cols-1";

    }

    else if (totalUsers <= 4) {

        gridClass = "grid-cols-2";

    }

    else if (totalUsers <= 9) {

        gridClass = "grid-cols-3";

    }

    else {

        gridClass = "grid-cols-4";

    }

    return (

        <div
            className={`

                grid

                ${gridClass}

                gap-4

                w-full

                h-full

                p-4

            `}
        >

            {/* =========================
                Local User
            ========================= */}

            <VideoPlayer

                stream={localStream}

                username={username}

                isLocal={true}

                cameraEnabled={cameraEnabled}

                microphoneEnabled={microphoneEnabled}

                handRaised={
                    participants[mySocketId]?.handRaised ?? false
                }

                isSpeaking={
                    participants[mySocketId]?.isSpeaking ?? false
                }

                connectionState={connectionState}

            />

            {/* =========================
                Remote Users
            ========================= */}

            {

                remoteStreams.map((user) => (

                    <VideoPlayer

                        key={user.socketId}

                        stream={user.stream}

                        username={user.username}

                        isLocal={false}

                        cameraEnabled={
                            participants[user.socketId]
                                ?.cameraEnabled ?? true
                        }

                        microphoneEnabled={
                            participants[user.socketId]
                                ?.microphoneEnabled ?? true
                        }

                        handRaised={
                            participants[user.socketId]
                                ?.handRaised ?? false
                        }

                        isSpeaking={
                            participants[user.socketId]
                                ?.isSpeaking ?? false
                        }

                        connectionState="connected"

                    />

                ))

            }

        </div>

    );

};

export default VideoGrid;