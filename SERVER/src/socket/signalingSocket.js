const registerSignalingEvents = (io, socket) => {

    // =============================
    // WebRTC Offer
    // =============================
    socket.on("offer", ({ meetingCode, offer }) => {

        socket.to(meetingCode).emit("offer", {

            sender: socket.user._id,

            username: socket.user.username,

            offer,

        });

    });

    // =============================
    // WebRTC Answer
    // =============================
    socket.on("answer", ({ meetingCode, answer }) => {

        socket.to(meetingCode).emit("answer", {

            sender: socket.user._id,

            answer,

        });

    });

    // =============================
    // ICE Candidate
    // =============================
    socket.on("ice-candidate", ({ meetingCode, candidate }) => {

        socket.to(meetingCode).emit("ice-candidate", {

            sender: socket.user._id,

            candidate,

        });

    });

};

export default registerSignalingEvents;