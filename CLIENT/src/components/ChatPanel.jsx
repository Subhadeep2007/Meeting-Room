import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Send,
    MessageCircle,
} from "lucide-react";

import api from "../services/api";

import socket from "../services/socket";

import {
    encryptMessage,
    decryptMessage,
} from "../services/clientEncryption";

import {
    getMeetingKey,
} from "../services/chatEncryptionManager";


// ==========================================
// CHAT PANEL
// ==========================================

const ChatPanel = ({
    meetingId,
    meetingCode,
}) => {

    // ==========================================
    // State
    // ==========================================

    const [
        messages,
        setMessages,
    ] = useState([]);

    const [
        input,
        setInput,
    ] = useState("");

    const [
        loadingHistory,
        setLoadingHistory,
    ] = useState(true);

    const [
        sending,
        setSending,
    ] = useState(false);

    const [
        encryptionReady,
        setEncryptionReady,
    ] = useState(false);

    const [
        typingUser,
        setTypingUser,
    ] = useState(null);


    // ==========================================
    // Ref
    // ==========================================

    const messagesEndRef =
        useRef(null);

    const typingTimeoutRef =
        useRef(null);


    // ==========================================
    // Check Encryption Key
    // ==========================================

   const checkEncryptionKey = async () => {

    const key =
        await getMeetingKey(
            meetingCode
        );

    if (key) {

        setEncryptionReady(true);

        return true;

    }

    setEncryptionReady(false);

    return false;

};

    // ==========================================
    // Initial Encryption Check
    // ==========================================

    useEffect(() => {

    const initializeEncryption = async () => {

        await checkEncryptionKey();

    };

    initializeEncryption();


    const handleEncryptionReady = async () => {

        await checkEncryptionKey();

    };


    window.addEventListener(
        "chat-encryption-ready",
        handleEncryptionReady
    );


    return () => {

        window.removeEventListener(
            "chat-encryption-ready",
            handleEncryptionReady
        );

    };

}, [meetingCode]);


    // ==========================================
    // Load Chat History
    // ==========================================

    useEffect(() => {

        if (!meetingId) {

            return;

        }


        let cancelled = false;


        const loadHistory = async () => {

            try {

                setLoadingHistory(
                    true
                );


                // =================================
                // Wait For Encryption Key
                // =================================

                let meetingKey =
    await getMeetingKey(
        meetingCode
    );


                if (!meetingKey) {

                    setLoadingHistory(
                        false
                    );

                    return;

                }


                // =================================
                // Get History
                // =================================

                const { data } =
                    await api.get(
                        `/messages/${meetingId}`
                    );


                if (cancelled) {

                    return;

                }


                const encryptedMessages =
                    data.messages || [];


                // =================================
                // Decrypt Messages
                // =================================

                const decryptedMessages =
                    await Promise.all(

                        encryptedMessages.map(
                            async (item) => {

                                try {

                                    const message =
                                        await decryptMessage(

                                            item.encryptedMessage,

                                            item.iv,

                                            meetingKey

                                        );


                                    return {

                                        ...item,

                                        message,

                                    };

                                } catch (error) {

                                    console.error(
                                        "Message decrypt error:",
                                        error
                                    );


                                    return {

                                        ...item,

                                        message:
                                            "Unable to decrypt message",

                                    };

                                }

                            }
                        )

                    );


                setMessages(
                    decryptedMessages
                );


            } catch (error) {

                console.error(
                    "Chat History Error:",
                    error
                );

            } finally {

                if (!cancelled) {

                    setLoadingHistory(
                        false
                    );

                }

            }

        };


        loadHistory();


        return () => {

            cancelled = true;

        };

    }, [
        meetingId,
        meetingCode,
        encryptionReady,
    ]);


    // ==========================================
    // Receive New Message
    // ==========================================

    useEffect(() => {

        const handleReceiveMessage = async (
            encryptedMessage
        ) => {

            try {

                const meetingKey =
    await getMeetingKey(
        meetingCode
    );


                if (!meetingKey) {

                    console.error(
                        "Meeting encryption key not available"
                    );

                    return;

                }


                const message =
                    await decryptMessage(

                        encryptedMessage
                            .encryptedMessage,

                        encryptedMessage.iv,

                        meetingKey

                    );


                setMessages(
                    (prev) => [

                        ...prev,

                        {

                            ...encryptedMessage,

                            message,

                        },

                    ]
                );


            } catch (error) {

                console.error(
                    "Receive Message Decryption Error:",
                    error
                );

            }

        };


        socket.on(
            "receive-message",
            handleReceiveMessage
        );


        return () => {

            socket.off(
                "receive-message",
                handleReceiveMessage
            );

        };

    }, [meetingCode]);


    // ==========================================
    // Typing
    // ==========================================

    useEffect(() => {

        const handleTyping = (user) => {

            setTypingUser(
                user
            );

        };


        const handleStopTyping = () => {

            setTypingUser(
                null
            );

        };


        socket.on(
            "user-typing",
            handleTyping
        );


        socket.on(
            "user-stop-typing",
            handleStopTyping
        );


        return () => {

            socket.off(
                "user-typing",
                handleTyping
            );

            socket.off(
                "user-stop-typing",
                handleStopTyping
            );

        };

    }, []);


    // ==========================================
    // Auto Scroll
    // ==========================================

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({

            behavior: "smooth",

        });

    }, [messages]);


    // ==========================================
    // Send Message
    // ==========================================

    const handleSendMessage = async (
        e
    ) => {

        e.preventDefault();


        const text =
            input.trim();


        if (!text) {

            return;

        }


        const meetingKey =
    await getMeetingKey(
        meetingCode
    );


        if (!meetingKey) {

            console.error(
                "Meeting encryption key not ready"
            );

            return;

        }


        try {

            setSending(
                true
            );


            // =================================
            // Encrypt In Browser
            // =================================

            const encrypted =
                await encryptMessage(

                    text,

                    meetingKey

                );


            // =================================
            // Send Ciphertext
            // =================================

            socket.emit(

                "send-message",

                {

                    meetingId,

                    encryptedMessage:
                        encrypted.encryptedMessage,

                    iv:
                        encrypted.iv,

                },

                (response) => {

                    if (
                        !response?.success
                    ) {

                        console.error(
                            "Send Message Failed:",
                            response?.message
                        );

                    }

                }

            );


            setInput("");


            // =================================
            // Stop Typing
            // =================================

            socket.emit(
                "stop-typing",
                {
                    meetingId:
                        meetingCode,
                }
            );


        } catch (error) {

            console.error(
                "Send Message Error:",
                error
            );

        } finally {

            setSending(
                false
            );

        }

    };


    // ==========================================
    // Handle Typing
    // ==========================================

    const handleInputChange = (
        e
    ) => {

        const value =
            e.target.value;


        setInput(
            value
        );


        if (!value.trim()) {

            socket.emit(
                "stop-typing",
                {

                    meetingId:
                        meetingCode,

                }
            );

            return;

        }


        socket.emit(
            "typing",
            {

                meetingId:
                    meetingCode,

            }
        );


        clearTimeout(
            typingTimeoutRef.current
        );


        typingTimeoutRef.current =
            setTimeout(() => {

                socket.emit(
                    "stop-typing",
                    {

                        meetingId:
                            meetingCode,

                    }
                );

            }, 1200);

    };


    // ==========================================
    // Render
    // ==========================================

    return (

        <div className="
            h-full
            flex
            flex-col
            bg-gray-900
            text-white
        ">

            {/* =================================
                Header
            ================================= */}

            <div className="
                flex
                items-center
                gap-3
                px-4
                py-3
                border-b
                border-gray-700
            ">

                <MessageCircle
                    size={20}
                    className="text-blue-400"
                />

                <h2 className="
                    font-semibold
                ">

                    Meeting Chat

                </h2>

            </div>


            {/* =================================
                Messages
            ================================= */}

            <div className="
                flex-1
                overflow-y-auto
                p-4
                space-y-3
            ">

                {loadingHistory ? (

                    <div className="
                        text-center
                        text-gray-400
                        mt-10
                    ">

                        Loading chat...

                    </div>

                ) : messages.length === 0 ? (

                    <div className="
                        text-center
                        text-gray-500
                        mt-10
                    ">

                        No messages yet.

                    </div>

                ) : (

                    messages.map(
                        (item) => (

                            <div
                                key={item._id}
                                className="
                                    flex
                                    gap-3
                                "
                            >

                                <img
                                    src={
                                        item.sender
                                            ?.profilePicture
                                            ?.url ||
                                        "/default-avatar.png"
                                    }
                                    alt={
                                        item.sender
                                            ?.username ||
                                        "User"
                                    }
                                    className="
                                        w-8
                                        h-8
                                        rounded-full
                                        object-cover
                                        flex-shrink-0
                                    "
                                />


                                <div>

                                    <div className="
                                        text-xs
                                        text-gray-400
                                        mb-1
                                    ">

                                        {
                                            item.sender
                                                ?.username ||
                                            "User"
                                        }

                                    </div>


                                    <div className="
                                        bg-gray-800
                                        rounded-xl
                                        px-3
                                        py-2
                                        break-words
                                    ">

                                        {
                                            item.message
                                        }

                                    </div>

                                </div>

                            </div>

                        )
                    )

                )}


                {/* =================================
                    Typing
                ================================= */}

                {typingUser && (

                    <div className="
                        text-xs
                        text-gray-500
                    ">

                        {
                            typingUser.username
                        }
                        {" "}
                        is typing...

                    </div>

                )}


                <div
                    ref={
                        messagesEndRef
                    }
                />

            </div>


            {/* =================================
                Encryption Status
            ================================= */}

            {!encryptionReady && (

                <div className="
                    px-4
                    py-2
                    text-xs
                    text-yellow-400
                    border-t
                    border-gray-700
                ">

                    Securing chat...

                </div>

            )}


            {/* =================================
                Input
            ================================= */}

            <form
                onSubmit={
                    handleSendMessage
                }
                className="
                    p-3
                    border-t
                    border-gray-700
                    flex
                    gap-2
                "
            >

                <input

                    type="text"

                    value={input}

                    onChange={
                        handleInputChange
                    }

                    disabled={
                        !encryptionReady ||
                        sending
                    }

                    placeholder={
                        encryptionReady
                            ? "Type a message..."
                            : "Securing chat..."
                    }

                    className="
                        flex-1
                        bg-gray-800
                        text-white
                        rounded-xl
                        px-4
                        py-3
                        outline-none
                        focus:ring-2
                        focus:ring-blue-500
                        disabled:opacity-50
                    "

                />


                <button

                    type="submit"

                    disabled={
                        !encryptionReady ||
                        sending ||
                        !input.trim()
                    }

                    className="
                        w-12
                        rounded-xl
                        bg-blue-600
                        hover:bg-blue-700
                        disabled:bg-gray-700
                        disabled:cursor-not-allowed
                        flex
                        items-center
                        justify-center
                    "

                >

                    <Send
                        size={18}
                    />

                </button>

            </form>

        </div>

    );

};


export default ChatPanel;