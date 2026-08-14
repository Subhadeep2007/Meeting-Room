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
    // Responsive Grid
    // =====================================

    let gridClass = "";

    if (totalUsers === 1) {

        gridClass = "grid-cols-1";

    } else if (totalUsers === 2) {

        gridClass = "grid-cols-1 sm:grid-cols-2";

    } else if (totalUsers <= 4) {

        gridClass = "grid-cols-1 sm:grid-cols-2";

    } else if (totalUsers <= 6) {

        gridClass = "grid-cols-2 md:grid-cols-3";

    } else if (totalUsers <= 9) {

        gridClass = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3";

    } else {

        gridClass = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

    }


    // =====================================
    // Helper
    // =====================================

    const videoProps = (user, isLocal = false) => {

        const socketId = isLocal
            ? mySocketId
            : user.socketId;

        const participant =
            participants[socketId];

        return {

            stream: isLocal
                ? localStream
                : user.stream,

            username: isLocal
    ? username
    : participant?.username ||
      user.username ||
      "Participant",
            isLocal,


            profilePicture: isLocal
    ? null
    : participant?.profilePicture || null,

            cameraEnabled: isLocal
                ? cameraEnabled
                : participant?.cameraEnabled ?? true,

            microphoneEnabled: isLocal
                ? microphoneEnabled
                : participant?.microphoneEnabled ?? true,

            handRaised:
                participant?.handRaised ?? false,

            isSpeaking:
                participant?.isSpeaking ?? false,

            connectionState: isLocal
                ? connectionState
                : "connected",

        };

    };


    // =====================================
    // Pinned View
    // =====================================

    if (pinnedUser) {

        return (

            <div
                className="
                    flex
                    flex-col

                    w-full
                    h-full
                    min-h-0

                    p-2
                    sm:p-3
                    md:p-4

                    gap-2
                    sm:gap-3
                "
            >

                {/* =========================
                    Pinned Video
                ========================= */}

                <div
                    className="
                        relative

                        flex-1
                        min-h-0
                        w-full

                        rounded-xl
                        sm:rounded-2xl

                        overflow-hidden

                        bg-gray-950

                        ring-1
                        ring-white/10

                        shadow-2xl
                    "
                >

                    {/* Pinned Badge */}

                    <div
                        className="
                            absolute
                            top-2
                            left-2
                            sm:top-3
                            sm:left-3

                            z-20

                            flex
                            items-center
                            gap-1.5

                            px-2.5
                            py-1

                            rounded-full

                            bg-black/65
                            backdrop-blur-md

                            text-white
                            text-[10px]
                            sm:text-xs

                            font-medium

                            border
                            border-white/10
                        "
                    >

                        <span>
                            📌
                        </span>

                        <span>
                            Pinned
                        </span>

                    </div>


                    {
                        isLocalPinned ? (

                            <VideoPlayer
                                {...videoProps(
                                    null,
                                    true
                                )}
                            />

                        ) : pinnedRemoteUser ? (

                            <VideoPlayer
                                {...videoProps(
                                    pinnedRemoteUser
                                )}
                            />

                        ) : (

                            <div
                                className="
                                    h-full
                                    w-full

                                    flex
                                    items-center
                                    justify-center

                                    text-gray-400
                                    text-sm
                                "
                            >
                                Participant unavailable
                            </div>

                        )
                    }

                </div>


                {/* =========================
                    Remaining Participants
                ========================= */}

                <div
                    className="
                        shrink-0

                        w-full

                        h-24
                        sm:h-28
                        md:h-32

                        flex
                        gap-2

                        overflow-x-auto
                        overflow-y-hidden

                        snap-x
                        snap-mandatory

                        pb-1

                        scrollbar-hide
                    "
                >

                    {/* Local User */}

                    {!isLocalPinned && (

                        <div
                            className="
                                relative

                                shrink-0

                                w-32
                                sm:w-40
                                md:w-44

                                h-full

                                snap-start

                                rounded-lg
                                sm:rounded-xl

                                overflow-hidden

                                bg-gray-950

                                ring-1
                                ring-white/10
                            "
                        >

                            <VideoPlayer
                                {...videoProps(
                                    null,
                                    true
                                )}
                            />

                        </div>

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

                            <div
                                key={
                                    user.socketId
                                }
                                className="
                                    relative

                                    shrink-0

                                    w-32
                                    sm:w-40
                                    md:w-44

                                    h-full

                                    snap-start

                                    rounded-lg
                                    sm:rounded-xl

                                    overflow-hidden

                                    bg-gray-950

                                    ring-1
                                    ring-white/10
                                "
                            >

                                <VideoPlayer
                                    {...videoProps(
                                        user
                                    )}
                                />

                            </div>

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

                gap-2
                sm:gap-3
                md:gap-4

                w-full
                h-full

                min-h-0

                p-2
                sm:p-3
                md:p-4

                auto-rows-fr

                overflow-y-auto
                overflow-x-hidden

                content-center
            `}
        >

            {/* =========================
                Local User
            ========================= */}

            <div
                className="
                    relative

                    min-h-[160px]
                    sm:min-h-[190px]
                    md:min-h-[220px]

                    rounded-xl
                    sm:rounded-2xl

                    overflow-hidden

                    bg-gray-950

                    ring-1
                    ring-white/10

                    shadow-lg

                    transition
                    duration-200

                    hover:ring-white/20
                "
            >

                <VideoPlayer
                    {...videoProps(
                        null,
                        true
                    )}
                />

            </div>


            {/* =========================
                Remote Users
            ========================= */}

            {remoteStreams.map((user) => (

                <div
                    key={user.socketId}
                    className="
                        relative

                        min-h-[160px]
                        sm:min-h-[190px]
                        md:min-h-[220px]

                        rounded-xl
                        sm:rounded-2xl

                        overflow-hidden

                        bg-gray-950

                        ring-1
                        ring-white/10

                        shadow-lg

                        transition
                        duration-200

                        hover:ring-white/20
                    "
                >

                    <VideoPlayer
                        {...videoProps(
                            user
                        )}
                    />

                </div>

            ))}

        </div>

    );

};


export default VideoGrid;