const WaitingUserCard = ({

    user,

    approveUser,

    rejectUser,

}) => {

    return (

        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800">

            <div className="flex items-center gap-3">

                <img

                    src={user.profilePicture?.url}

                    alt=""

                    className="w-10 h-10 rounded-full"

                />

                <div>

                    <div className="text-white">

                        {user.username}

                    </div>

                    <div className="text-gray-400 text-xs">

                        Waiting...

                    </div>

                </div>

            </div>

            <div className="flex gap-2">

                <button

                    onClick={() => approveUser(user.userId)}

                    className="bg-green-600 px-3 py-1 rounded"

                >

                    Approve

                </button>

                <button

                    onClick={() => rejectUser(user.userId)}

                    className="bg-red-600 px-3 py-1 rounded"

                >

                    Reject

                </button>

            </div>

        </div>

    );

};

export default WaitingUserCard;