import { createMessage } from "../services/messageService.js";

const registerChatEvents = (io, socket) => {

    // ==========================================
    // SEND MESSAGE
    // ==========================================

    socket.on("send-message", async(data, callback) => {

        try {

            const {
                meetingId,
                message,
                messageType = "text",
                replyTo = null,
                attachments = [],
            } = data || {};

            // Validation

            if (!meetingId) {

                if (callback) {
                    callback({
                        success: false,
                        message: "Meeting ID is required",
                    });
                }

                return;
            }

            if (!message && attachments.length === 0) {

                if (callback) {
                    callback({
                        success: false,
                        message: "Message or Attachment is required",
                    });
                }

                return;
            }

            const savedMessage = await createMessage({

                meetingId,

                sender: socket.user._id,

                message,

                messageType,

                replyTo,

                attachments,

            });

            // Broadcast

            io.to(meetingId).emit(
                "receive-message",
                savedMessage
            );

            // ACK

            if (callback) {

                callback({

                    success: true,

                    message: "Message sent successfully",

                    data: savedMessage,

                });

            }

        } catch (error) {

            console.error(error);

            if (callback) {

                callback({

                    success: false,

                    message: error.message,

                });

            }

        }

    });



    // ==========================================
    // USER TYPING
    // ==========================================

    socket.on("typing", ({ meetingId }) => {

        socket.to(meetingId).emit("user-typing", {

            userId: socket.user._id,

            username: socket.user.username,

            profilePicture: socket.user.profilePicture,

        });

    });



    // ==========================================
    // STOP TYPING
    // ==========================================

    socket.on("stop-typing", ({ meetingId }) => {

        socket.to(meetingId).emit("user-stop-typing", {

            userId: socket.user._id,

        });

    });



    // ==========================================
    // DISCONNECT
    // ==========================================

    socket.on("disconnect", () => {

        console.log(`${socket.user.username} disconnected`);

    });

};

export default registerChatEvents;