import { SOCKET_EVENTS } from "../constants/socketEvents.js";

const registerSignalingEvents = (io, socket) => {

    // =====================================
    // JOIN CALL
    // =====================================

    socket.on(

        SOCKET_EVENTS.JOIN_CALL,

        ({ meetingId }) => {

            socket.join(meetingId);

            socket.to(meetingId).emit(

                SOCKET_EVENTS.USER_JOINED,

                {

                    userId: socket.user._id,

                    username: socket.user.username,

                    profilePicture: socket.user.profilePicture,

                }

            );

        }

    );

    // =====================================
    // LEAVE CALL
    // =====================================

    socket.on(

        SOCKET_EVENTS.LEAVE_CALL,

        ({ meetingId }) => {

            socket.leave(meetingId);

            socket.to(meetingId).emit(

                SOCKET_EVENTS.USER_LEFT,

                {

                    userId: socket.user._id,

                }

            );

        }

    );

    // =====================================
    // OFFER
    // =====================================

    socket.on(

        SOCKET_EVENTS.OFFER,

        ({ targetSocketId, offer }) => {

            io.to(targetSocketId).emit(

                SOCKET_EVENTS.OFFER,

                {

                    offer,

                    from: socket.id,

                    user: {

                        id: socket.user._id,

                        username: socket.user.username,

                    },

                }

            );

        }

    );

    // =====================================
    // ANSWER
    // =====================================

    socket.on(

        SOCKET_EVENTS.ANSWER,

        ({ targetSocketId, answer }) => {

            io.to(targetSocketId).emit(

                SOCKET_EVENTS.ANSWER,

                {

                    answer,

                    from: socket.id,

                }

            );

        }

    );

    // =====================================
    // ICE Candidate
    // =====================================

    socket.on(

        SOCKET_EVENTS.ICE_CANDIDATE,

        ({ targetSocketId, candidate }) => {

            io.to(targetSocketId).emit(

                SOCKET_EVENTS.ICE_CANDIDATE,

                {

                    candidate,

                    from: socket.id,

                }

            );

        }

    );

};

export default registerSignalingEvents;