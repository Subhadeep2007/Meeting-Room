import WaitingUserCard from "./WaitingUserCard";

const WaitingRoomSidebar = ({

    waitingUsers,

    approveUser,

    rejectUser,

}) => {

    return (

        <div className="w-80 bg-gray-900 p-4">

            <h2 className="text-white font-bold mb-4">

                Waiting Room

            </h2>

            <div className="space-y-2">

                {

                    waitingUsers.map(

                        (user) => (

                            <WaitingUserCard

                                key={user.userId}

                                user={user}

                                approveUser={approveUser}

                                rejectUser={rejectUser}

                            />

                        )

                    )

                }

            </div>

        </div>

    );

};

export default WaitingRoomSidebar;