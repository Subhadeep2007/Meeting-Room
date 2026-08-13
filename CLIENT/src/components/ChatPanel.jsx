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

        <div
            className="
                h-full
                min-h-0
                flex
                flex-col
                bg-gray-950
                text-white
                overflow-hidden
            "
        >

            {/* =================================
                Header
            ================================= */}

            <div
                className="
                    shrink-0

                    flex
                    items-center
                    gap-3

                    px-4
                    sm:px-5

                    py-3
                    sm:py-4

                    border-b
                    border-white/10

                    bg-gray-900/90
                    backdrop-blur-md
                "
            >

                <div
                    className="
                        w-9
                        h-9

                        rounded-xl

                        bg-blue-600/15

                        flex
                        items-center
                        justify-center

                        text-blue-400
                    "
                >

                    <MessageCircle
                        size={19}
                    />

                </div>


                <div className="min-w-0">

                    <h2
                        className="
                            font-semibold
                            text-sm
                            sm:text-base
                            truncate
                        "
                    >
                        Meeting Chat
                    </h2>

                    <p
                        className="
                            text-[10px]
                            sm:text-xs
                            text-gray-500
                        "
                    >
                        End-to-end encrypted
                    </p>

                </div>

            </div>


            {/* =================================
                Messages
            ================================= */}

            <div
                className="
                    flex-1
                    min-h-0

                    overflow-y-auto
                    overflow-x-hidden

                    px-3
                    sm:px-4

                    py-3
                    sm:py-4

                    space-y-3

                    scrollbar-hide
                "
            >

                {loadingHistory ? (

                    <div
                        className="
                            h-full

                            flex
                            items-center
                            justify-center

                            text-center
                            text-gray-500

                            text-sm
                        "
                    >
                        Loading chat...
                    </div>

                ) : messages.length === 0 ? (

                    <div
                        className="
                            h-full

                            flex
                            flex-col
                            items-center
                            justify-center

                            text-center

                            px-6
                        "
                    >

                        <div
                            className="
                                w-14
                                h-14

                                rounded-full

                                bg-white/5

                                flex
                                items-center
                                justify-center

                                text-gray-500

                                mb-3
                            "
                        >

                            <MessageCircle
                                size={23}
                            />

                        </div>

                        <p
                            className="
                                text-sm
                                font-medium
                                text-gray-300
                            "
                        >
                            No messages yet
                        </p>

                        <p
                            className="
                                mt-1
                                text-xs
                                text-gray-500
                            "
                        >
                            Start the conversation
                        </p>

                    </div>

                ) : (

                    messages.map(
                        (item) => (

                            <div
                                key={item._id}
                                className="
                                    flex
                                    items-end
                                    gap-2.5
                                    sm:gap-3
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
                                        shrink-0

                                        w-8
                                        h-8

                                        sm:w-9
                                        sm:h-9

                                        rounded-full

                                        object-cover

                                        ring-1
                                        ring-white/10
                                    "
                                />


                                <div
                                    className="
                                        min-w-0
                                        max-w-[82%]
                                        sm:max-w-[78%]
                                    "
                                >

                                    <div
                                        className="
                                            px-1
                                            mb-1
                                            text-[10px]
                                            sm:text-xs
                                            text-gray-500
                                            truncate
                                        "
                                    >
                                        {
                                            item.sender
                                                ?.username ||
                                            "User"
                                        }
                                    </div>


                                    <div
                                        className="
                                            bg-gray-800/90

                                            border
                                            border-white/5

                                            rounded-2xl
                                            rounded-bl-md

                                            px-3
                                            py-2

                                            text-sm
                                            leading-relaxed

                                            break-words
                                            whitespace-pre-wrap

                                            shadow-sm
                                        "
                                    >
                                        {item.message}
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

                    <div
                        className="
                            flex
                            items-center
                            gap-2

                            text-[11px]
                            sm:text-xs

                            text-gray-500
                        "
                    >

                        <span
                            className="
                                flex
                                gap-0.5
                            "
                        >

                            <span
                                className="
                                    w-1.5
                                    h-1.5
                                    rounded-full
                                    bg-gray-500
                                    animate-bounce
                                "
                            />

                            <span
                                className="
                                    w-1.5
                                    h-1.5
                                    rounded-full
                                    bg-gray-500
                                    animate-bounce
                                    [animation-delay:120ms]
                                "
                            />

                            <span
                                className="
                                    w-1.5
                                    h-1.5
                                    rounded-full
                                    bg-gray-500
                                    animate-bounce
                                    [animation-delay:240ms]
                                "
                            />

                        </span>

                        <span className="truncate">
                            {typingUser.username} is typing...
                        </span>

                    </div>

                )}


                <div
                    ref={messagesEndRef}
                />

            </div>


            {/* =================================
                Encryption Status
            ================================= */}

            {!encryptionReady && (

                <div
                    className="
                        shrink-0

                        px-4
                        py-2

                        text-[10px]
                        sm:text-xs

                        text-yellow-400

                        bg-yellow-500/5

                        border-t
                        border-white/10
                    "
                >
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
                    shrink-0

                    p-2.5
                    sm:p-3

                    border-t
                    border-white/10

                    bg-gray-900/90
                    backdrop-blur-md

                    flex
                    items-center
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
                        min-w-0
                        flex-1

                        h-10
                        sm:h-11

                        bg-gray-800

                        border
                        border-white/10

                        text-white

                        text-sm

                        rounded-xl

                        px-3
                        sm:px-4

                        outline-none

                        placeholder:text-gray-500

                        focus:border-blue-500/60
                        focus:ring-2
                        focus:ring-blue-500/10

                        disabled:opacity-50

                        transition
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
                        shrink-0

                        w-10
                        h-10

                        sm:w-11
                        sm:h-11

                        rounded-xl

                        bg-blue-600

                        hover:bg-blue-700

                        active:scale-95

                        disabled:bg-gray-700
                        disabled:text-gray-500
                        disabled:cursor-not-allowed

                        flex
                        items-center
                        justify-center

                        transition
                    "

                    title="Send message"

                >

                    <Send
                        size={17}
                    />

                </button>

            </form>

        </div>

    );

};


export default ChatPanel;