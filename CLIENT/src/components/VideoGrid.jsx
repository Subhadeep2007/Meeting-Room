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
    pinnedUser,
}) => {

    const totalUsers = remoteStreams.length + 1;

    // =====================================
    // Pinned User
    // =====================================

    const isLocalPinned =
        pinnedUser?.socketId === mySocketId;

    const pinnedRemoteUser =
        pinnedUser &&
        !isLocalPinned
            ? remoteStreams.find(
                (user) =>
                    user.socketId ===
                    pinnedUser.socketId
            )
            : null;


    // =====================================
    // Normal Grid
    // =====================================

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


    // =====================================
    // Pinned View
    // =====================================

    if (pinnedUser) {

        return (

            <div className="
                flex
                flex-col
                gap-3
                w-full
                h-full
                p-4
            ">

                {/* =========================
                    Pinned Video
                ========================= */}

                <div className="
                    flex-1
                    min-h-0
                    w-full
                ">

                    {

                        isLocalPinned ? (

                            <VideoPlayer

                                stream={localStream}

                                username={username}

                                isLocal={true}

                                cameraEnabled={
                                    cameraEnabled
                                }

                                microphoneEnabled={
                                    microphoneEnabled
                                }

                                handRaised={
                                    participants[
                                        mySocketId
                                    ]?.handRaised ?? false
                                }

                                isSpeaking={
                                    participants[
                                        mySocketId
                                    ]?.isSpeaking ?? false
                                }

                                connectionState={
                                    connectionState
                                }

                            />

                        ) : pinnedRemoteUser ? (

                            <VideoPlayer

                                stream={
                                    pinnedRemoteUser.stream
                                }

                                username={
                                    pinnedRemoteUser.username
                                }

                                isLocal={false}

                                cameraEnabled={
                                    participants[
                                        pinnedRemoteUser.socketId
                                    ]?.cameraEnabled ?? true
                                }

                                microphoneEnabled={
                                    participants[
                                        pinnedRemoteUser.socketId
                                    ]?.microphoneEnabled ?? true
                                }

                                handRaised={
                                    participants[
                                        pinnedRemoteUser.socketId
                                    ]?.handRaised ?? false
                                }

                                isSpeaking={
                                    participants[
                                        pinnedRemoteUser.socketId
                                    ]?.isSpeaking ?? false
                                }

                                connectionState="connected"

                            />

                        ) : null

                    }

                </div>


                {/* =========================
                    Remaining Participants
                ========================= */}

                <div className="
                    grid
                    grid-cols-4
                    gap-2
                    h-32
                    shrink-0
                    overflow-x-auto
                ">

                    {/* Local User */}

                    {!isLocalPinned && (

                        <VideoPlayer

                            stream={localStream}

                            username={username}

                            isLocal={true}

                            cameraEnabled={
                                cameraEnabled
                            }

                            microphoneEnabled={
                                microphoneEnabled
                            }

                            handRaised={
                                participants[
                                    mySocketId
                                ]?.handRaised ?? false
                            }

                            isSpeaking={
                                participants[
                                    mySocketId
                                ]?.isSpeaking ?? false
                            }

                            connectionState={
                                connectionState
                            }

                        />

                    )}


                    {/* Remote Users */}

                    {remoteStreams.map((user) => {

                        if (
                            user.socketId ===
                            pinnedUser?.socketId
                        ) {
                            return null;
                        }

                        return (

                            <VideoPlayer

                                key={user.socketId}

                                stream={user.stream}

                                username={
                                    user.username
                                }

                                isLocal={false}

                                cameraEnabled={
                                    participants[
                                        user.socketId
                                    ]?.cameraEnabled ?? true
                                }

                                microphoneEnabled={
                                    participants[
                                        user.socketId
                                    ]?.microphoneEnabled ?? true
                                }

                                handRaised={
                                    participants[
                                        user.socketId
                                    ]?.handRaised ?? false
                                }

                                isSpeaking={
                                    participants[
                                        user.socketId
                                    ]?.isSpeaking ?? false
                                }

                                connectionState="connected"

                            />

                        );

                    })}

                </div>

            </div>

        );

    }


    // =====================================
    // Normal Grid
    // =====================================

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
                    participants[
                        mySocketId
                    ]?.handRaised ?? false
                }

                isSpeaking={
                    participants[
                        mySocketId
                    ]?.isSpeaking ?? false
                }

                connectionState={
                    connectionState
                }

            />


            {/* =========================
                Remote Users
            ========================= */}

            {remoteStreams.map((user) => (

                <VideoPlayer

                    key={user.socketId}

                    stream={user.stream}

                    username={user.username}

                    isLocal={false}

                    cameraEnabled={
                        participants[
                            user.socketId
                        ]?.cameraEnabled ?? true
                    }

                    microphoneEnabled={
                        participants[
                            user.socketId
                        ]?.microphoneEnabled ?? true
                    }

                    handRaised={
                        participants[
                            user.socketId
                        ]?.handRaised ?? false
                    }

                    isSpeaking={
                        participants[
                            user.socketId
                        ]?.isSpeaking ?? false
                    }

                    connectionState="connected"

                />

            ))}

        </div>

    );

};

export default VideoGrid;