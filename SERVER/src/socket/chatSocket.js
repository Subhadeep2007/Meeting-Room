import {
    createMessage,
    editMessage,
    deleteMessageForMe,
    deleteMessageForEveryone,
} from "../services/messageService.js";


// ==========================================
// REGISTER CHAT EVENTS
// ==========================================

const registerChatEvents = (
    io,
    socket
) => {

    // ==========================================
    // SEND MESSAGE
    // ==========================================

    socket.on(
        "send-message",
        async(
            data,
            callback
        ) => {

            try {

                const {

                    meetingId,

                    encryptedMessage,

                    iv,
                    replyTo = null,
                } = data || {};


                // ==========================================
                // Validate Meeting ID
                // ==========================================

                if (!meetingId) {

                    if (callback) {

                        callback({

                            success: false,

                            message: "Meeting ID is required",

                        });

                    }

                    return;

                }


                // ==========================================
                // Validate Encrypted Message
                // ==========================================

                if (!encryptedMessage ||
                    !iv
                ) {

                    if (callback) {

                        callback({

                            success: false,

                            message: "Encrypted message data is required",

                        });

                    }

                    return;

                }


                // ==========================================
                // Save Message
                // ==========================================

                const result =
                    await createMessage({

                        meetingId,

                        sender: socket.user._id,

                        encryptedMessage,

                        iv,
                        replyTo,

                    });


                const {
                    message: savedMessage,
                    meetingCode,
                } = result;


                // ==========================================
                // Broadcast To Meeting
                // ==========================================

                io.to(
                    meetingCode
                ).emit(

                    "receive-message",

                    savedMessage

                );


                // ==========================================
                // ACK
                // ==========================================

                if (callback) {

                    callback({

                        success: true,

                        message: "Message sent successfully",

                        data: savedMessage,

                    });

                }


            } catch (error) {

                console.error(
                    "Send Message Error:",
                    error
                );


                if (callback) {

                    callback({

                        success: false,

                        message: error.message,

                    });

                }

            }

        }
    );


    // ==========================================
    // EDIT MESSAGE
    // ==========================================

    socket.on(
        "edit-message",
        async(
            data,
            callback
        ) => {

            try {

                const {

                    messageId,

                    encryptedMessage,

                    iv,

                } = data || {};


                // ==========================================
                // Edit Message
                // ==========================================

                const result =
                    await editMessage({

                        messageId,

                        userId: socket.user._id,

                        encryptedMessage,

                        iv,

                    });


                const {
                    message: updatedMessage,

                    meetingCode,

                } = result;


                // ==========================================
                // Populate Sender
                // ==========================================

                await updatedMessage.populate({

                    path: "sender",

                    select: "name username profilePicture",

                });


                // ==========================================
                // Broadcast Edited Message
                // ==========================================

                io.to(
                    meetingCode
                ).emit(

                    "message-edited",

                    updatedMessage

                );


                // ==========================================
                // ACK
                // ==========================================

                if (callback) {

                    callback({

                        success: true,

                        message: "Message edited successfully",

                        data: updatedMessage,

                    });

                }


            } catch (error) {

                console.error(
                    "Edit Message Error:",
                    error
                );


                if (callback) {

                    callback({

                        success: false,

                        message: error.message,

                    });

                }

            }

        }
    );


    // ==========================================
    // DELETE MESSAGE FOR ME
    // ==========================================

    socket.on(
        "delete-message-for-me",
        async(
            data,
            callback
        ) => {

            try {

                const {

                    messageId,

                } = data || {};


                // ==========================================
                // Delete For Current User
                // ==========================================

                await deleteMessageForMe({

                    messageId,

                    userId: socket.user._id,

                });


                // ==========================================
                // ACK
                // ==========================================

                if (callback) {

                    callback({

                        success: true,

                        messageId,

                    });

                }


            } catch (error) {

                console.error(
                    "Delete Message For Me Error:",
                    error
                );


                if (callback) {

                    callback({

                        success: false,

                        message: error.message,

                    });

                }

            }

        }
    );


    // ==========================================
    // DELETE MESSAGE FOR EVERYONE
    // ==========================================

    socket.on(
        "delete-message-for-everyone",
        async(
            data,
            callback
        ) => {

            try {

                const {

                    messageId,

                } = data || {};


                // ==========================================
                // Delete For Everyone
                // ==========================================

                const result =
                    await deleteMessageForEveryone({

                        messageId,

                        userId: socket.user._id,

                    });


                const {
                    message: deletedMessage,

                    meetingCode,

                } = result;


                // ==========================================
                // Broadcast Deleted Message
                // ==========================================

                io.to(
                    meetingCode
                ).emit(

                    "message-deleted-for-everyone",

                    {

                        messageId: deletedMessage._id.toString(),

                        deletedAt: deletedMessage.deletedAt,

                    }

                );


                // ==========================================
                // ACK
                // ==========================================

                if (callback) {

                    callback({

                        success: true,

                        messageId,

                    });

                }


            } catch (error) {

                console.error(
                    "Delete Message For Everyone Error:",
                    error
                );


                if (callback) {

                    callback({

                        success: false,

                        message: error.message,

                    });

                }

            }

        }
    );


    // ==========================================
    // USER TYPING
    // ==========================================

    socket.on(
        "typing",
        ({
            meetingId,
        } = {}) => {

            if (!meetingId) {

                return;

            }


            socket
                .to(meetingId)
                .emit(

                    "user-typing",

                    {

                        userId: socket.user._id.toString(),

                        username: socket.user.username,

                        profilePicture: socket.user.profilePicture,

                    }

                );

        }
    );


    // ==========================================
    // STOP TYPING
    // ==========================================

    socket.on(
        "stop-typing",
        ({
            meetingId,
        } = {}) => {

            if (!meetingId) {

                return;

            }


            socket
                .to(meetingId)
                .emit(

                    "user-stop-typing",

                    {

                        userId: socket.user._id.toString(),

                    }

                );

        }
    );

};


export default registerChatEvents;