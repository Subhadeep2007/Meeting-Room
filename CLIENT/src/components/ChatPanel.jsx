import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Send,
    MessageCircle,
    MoreVertical,
    Pencil,
    Trash2,
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

    const [
        currentUserId,
        setCurrentUserId,
    ] = useState("");

    const [
        openMenuId,
        setOpenMenuId,
    ] = useState(null);

    // ==========================================
    // Reply
    // ==========================================

    const [
        replyingTo,
        setReplyingTo,
    ] = useState(null);

    // ==========================================
    // Edit
    // ==========================================

    const [
        editingMessageId,
        setEditingMessageId,
    ] = useState(null);

    const [
        editingText,
        setEditingText,
    ] = useState("");

    const [
        editingSending,
        setEditingSending,
    ] = useState(false);

    // ==========================================
    // Refs
    // ==========================================

    const messagesEndRef =
        useRef(null);

    const typingTimeoutRef =
        useRef(null);


    // ==========================================
    // Encryption
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
    // GET CURRENT USER
    // ==========================================

    useEffect(() => {

        const getCurrentUser = async () => {

            try {

                const { data } =
                    await api.get(
                        "/auth/current-user"
                    );

                setCurrentUserId(
                    data.user?._id || ""
                );

            } catch (error) {

                console.error(
                    "Current User Error:",
                    error
                );

            }

        };


        getCurrentUser();

    }, []);


    // ==========================================
    // LOAD CHAT HISTORY
    // ==========================================

    useEffect(() => {

        if (!meetingId) {
            return;
        }


        let cancelled = false;


        const loadHistory = async () => {

            try {

                setLoadingHistory(true);


                // =================================
                // Get Meeting Key
                // =================================

                const meetingKey =
                    await getMeetingKey(
                        meetingCode
                    );


                if (!meetingKey) {

                    setLoadingHistory(false);

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

                    setLoadingHistory(false);

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
    // RECEIVE NEW MESSAGE
    // ==========================================

    useEffect(() => {

        const handleReceiveMessage =
            async (encryptedMessage) => {

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
                            encryptedMessage.encryptedMessage,
                            encryptedMessage.iv,
                            meetingKey
                        );


                    setMessages((prev) => {

                        const exists =
                            prev.some(
                                (item) =>
                                    item._id ===
                                    encryptedMessage._id
                            );


                        if (exists) {
                            return prev;
                        }


                        return [
                            ...prev,
                            {
                                ...encryptedMessage,
                                message,
                            },
                        ];

                    });


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
    // EDIT / DELETE EVENTS
    // ==========================================

    useEffect(() => {

        // ======================================
        // MESSAGE EDITED
        // ======================================

        const handleMessageEdited =
            async (updatedMessage) => {

                try {

                    const meetingKey =
                        await getMeetingKey(
                            meetingCode
                        );


                    if (!meetingKey) {
                        return;
                    }


                    const message =
                        await decryptMessage(
                            updatedMessage.encryptedMessage,
                            updatedMessage.iv,
                            meetingKey
                        );


                    setMessages((prev) =>
                        prev.map((item) =>
                            item._id ===
                            updatedMessage._id

                                ? {
                                    ...updatedMessage,
                                    message,
                                }

                                : item
                        )
                    );


                    setEditingMessageId(null);
                    setEditingText("");
                    setOpenMenuId(null);


                } catch (error) {

                    console.error(
                        "Edited Message Decryption Error:",
                        error
                    );

                }

            };


        // ======================================
        // DELETE FOR EVERYONE
        // ======================================

        const handleMessageDeletedForEveryone = ({
            messageId,
        }) => {

            setMessages((prev) =>
                prev.map((item) =>

                    item._id === messageId

                        ? {
                            ...item,
                            isDeletedForEveryone: true,
                            message:
                                "This message was deleted",
                        }

                        : item
                )
            );


            // If user was replying
            // to deleted message

            setReplyingTo((prev) => {

                if (
                    prev?._id === messageId
                ) {

                    return {
                        ...prev,
                        isDeletedForEveryone: true,
                        message:
                            "This message was deleted",
                    };

                }

                return prev;

            });


            setOpenMenuId(null);

        };


        socket.on(
            "message-edited",
            handleMessageEdited
        );


        socket.on(
            "message-deleted-for-everyone",
            handleMessageDeletedForEveryone
        );


        return () => {

            socket.off(
                "message-edited",
                handleMessageEdited
            );

            socket.off(
                "message-deleted-for-everyone",
                handleMessageDeletedForEveryone
            );

        };

    }, [meetingCode]);


    // ==========================================
    // TYPING
    // ==========================================

    useEffect(() => {

        const handleTyping = (user) => {

            setTypingUser(user);

        };


        const handleStopTyping = () => {

            setTypingUser(null);

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
    // AUTO SCROLL
    // ==========================================

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });

    }, [messages]);


    // ==========================================
    // EDIT MESSAGE
    // ==========================================

    const handleEditMessage = async () => {

        const text =
            editingText.trim();


        if (!text) {
            return;
        }


        try {

            setEditingSending(true);


            const meetingKey =
                await getMeetingKey(
                    meetingCode
                );


            if (!meetingKey) {
                return;
            }


            const encrypted =
                await encryptMessage(
                    text,
                    meetingKey
                );


            socket.emit(
                "edit-message",
                {
                    messageId:
                        editingMessageId,

                    encryptedMessage:
                        encrypted.encryptedMessage,

                    iv:
                        encrypted.iv,
                },
                (response) => {

                    if (!response?.success) {

                        console.error(
                            "Edit Message Failed:",
                            response?.message
                        );

                    }

                }
            );


        } catch (error) {

            console.error(
                "Edit Message Error:",
                error
            );

        } finally {

            setEditingSending(false);

        }

    };


    // ==========================================
    // DELETE FOR ME
    // ==========================================

    const handleDeleteForMe = (
        messageId
    ) => {

        socket.emit(
            "delete-message-for-me",
            {
                messageId,
            },
            (response) => {

                if (!response?.success) {

                    console.error(
                        "Delete For Me Failed:",
                        response?.message
                    );

                    return;

                }


                setMessages((prev) =>
                    prev.filter(
                        (item) =>
                            item._id !==
                            messageId
                    )
                );


                setReplyingTo((prev) =>
                    prev?._id === messageId
                        ? null
                        : prev
                );


                setOpenMenuId(null);

            }
        );

    };


    // ==========================================
    // DELETE FOR EVERYONE
    // ==========================================

    const handleDeleteForEveryone = (
        messageId
    ) => {

        socket.emit(
            "delete-message-for-everyone",
            {
                messageId,
            },
            (response) => {

                if (!response?.success) {

                    console.error(
                        "Delete For Everyone Failed:",
                        response?.message
                    );

                }

            }
        );

    };


    // ==========================================
    // START EDIT
    // ==========================================

    const startEditing = (
        item
    ) => {

        setEditingMessageId(
            item._id
        );

        setEditingText(
            item.message
        );

        setReplyingTo(null);

        setOpenMenuId(null);

    };


    // ==========================================
    // START REPLY
    // ==========================================

    const startReplying = (
        item
    ) => {

        if (
            item.isDeletedForEveryone
        ) {
            return;
        }


        setReplyingTo(item);

        setEditingMessageId(null);

        setEditingText("");

        setOpenMenuId(null);

    };


    // ==========================================
    // SEND MESSAGE
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

            setSending(true);


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

                    replyTo:
                        replyingTo?._id ||
                        null,
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

            setReplyingTo(null);


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

            setSending(false);

        }

    };


    // ==========================================
    // HANDLE TYPING
    // ==========================================

    const handleInputChange = (
        e
    ) => {

        const value =
            e.target.value;


        setInput(value);


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
    // RENDER
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
                HEADER
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
                MESSAGES
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
                        (item) => {

                            const isOwnMessage =
                                item.sender?._id ===
                                currentUserId;


                            const repliedMessage =
                                item.replyTo
                                    ? messages.find(
                                        (message) =>
                                            message._id ===
                                            item.replyTo?._id
                                    )
                                    : null;


                            return (

                                <div
                                    key={item._id}
                                    className={`
                                        flex
                                        items-end
                                        gap-2
                                        sm:gap-3
                                        ${
                                            isOwnMessage
                                                ? "justify-end"
                                                : "justify-start"
                                        }
                                    `}
                                >

                                    {/* =================================
                                        OTHER USER AVATAR
                                    ================================= */}

                                    {!isOwnMessage && (

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

                                    )}


                                    {/* =================================
                                        MESSAGE AREA
                                    ================================= */}

                                    <div
                                        className={`
                                            min-w-0
                                            ${
                                                isOwnMessage
                                                    ? "max-w-[84%] sm:max-w-[78%]"
                                                    : "max-w-[84%] sm:max-w-[78%]"
                                            }
                                        `}
                                    >

                                        {/* USERNAME */}

                                        <div
                                            className={`
                                                px-1
                                                mb-1
                                                text-[10px]
                                                sm:text-xs
                                                text-gray-500
                                                truncate
                                                ${
                                                    isOwnMessage
                                                        ? "text-right"
                                                        : "text-left"
                                                }
                                            `}
                                        >

                                            {
                                                isOwnMessage
                                                    ? "You"
                                                    : (
                                                        item.sender
                                                            ?.username ||
                                                        "User"
                                                    )
                                            }

                                        </div>


                                        {/* MESSAGE + ACTIONS */}

                                        <div className="relative">

                                            {/* =================================
                                                MESSAGE BUBBLE
                                            ================================= */}

                                            <div
                                                className={`
                                                    border
                                                    px-3
                                                    py-2.5
                                                    text-sm
                                                    leading-relaxed
                                                    break-words
                                                    whitespace-pre-wrap
                                                    shadow-sm
                                                    ${
                                                        isOwnMessage
                                                            ? `
                                                                bg-blue-600
                                                                border-blue-500
                                                                rounded-2xl
                                                                rounded-br-md
                                                              `
                                                            : `
                                                                bg-gray-800/90
                                                                border-white/5
                                                                rounded-2xl
                                                                rounded-bl-md
                                                              `
                                                    }
                                                `}
                                            >

                                                {/* =================================
                                                    REPLY PREVIEW
                                                ================================= */}

                                                {item.replyTo && (

                                                    <div
                                                        className={`
                                                            mb-2
                                                            px-3
                                                            py-2
                                                            rounded-lg
                                                            border-l-2
                                                            ${
                                                                isOwnMessage
                                                                    ? "bg-blue-700/60 border-blue-200"
                                                                    : "bg-black/20 border-blue-500"
                                                            }
                                                        `}
                                                    >

                                                        <div
                                                            className={`
                                                                text-[10px]
                                                                font-semibold
                                                                ${
                                                                    isOwnMessage
                                                                        ? "text-blue-100"
                                                                        : "text-blue-400"
                                                                }
                                                            `}
                                                        >

                                                            {
                                                                item.replyTo
                                                                    ?.sender
                                                                    ?.username ||
                                                                repliedMessage
                                                                    ?.sender
                                                                    ?.username ||
                                                                "User"
                                                            }

                                                        </div>


                                                        <div
                                                            className={`
                                                                mt-0.5
                                                                text-xs
                                                                line-clamp-2
                                                                ${
                                                                    isOwnMessage
                                                                        ? "text-blue-100/80"
                                                                        : "text-gray-400"
                                                                }
                                                            `}
                                                        >

                                                            {
                                                                item.replyTo
                                                                    ?.isDeletedForEveryone ||
                                                                repliedMessage
                                                                    ?.isDeletedForEveryone

                                                                    ? "This message was deleted"

                                                                    : (
                                                                        repliedMessage
                                                                            ?.message ||
                                                                        item.replyTo
                                                                            ?.message ||
                                                                        "Original message"
                                                                    )
                                                            }

                                                        </div>

                                                    </div>

                                                )}


                                                {/* =================================
                                                    DELETED MESSAGE
                                                ================================= */}

                                                {item.isDeletedForEveryone ? (

                                                    <span
                                                        className={`
                                                            italic
                                                            ${
                                                                isOwnMessage
                                                                    ? "text-blue-100/70"
                                                                    : "text-gray-500"
                                                            }
                                                        `}
                                                    >
                                                        This message was deleted
                                                    </span>

                                                ) : editingMessageId ===
                                                    item._id ? (

                                                    /* =================================
                                                        EDIT MODE
                                                    ================================= */

                                                    <div className="space-y-2">

                                                        <input
                                                            type="text"
                                                            value={
                                                                editingText
                                                            }
                                                            onChange={(e) =>
                                                                setEditingText(
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="
                                                                w-full
                                                                bg-gray-700
                                                                border
                                                                border-white/10
                                                                rounded-lg
                                                                px-2
                                                                py-1.5
                                                                text-white
                                                                outline-none
                                                            "
                                                            autoFocus
                                                        />


                                                        <div
                                                            className="
                                                                flex
                                                                gap-2
                                                            "
                                                        >

                                                            <button
                                                                type="button"
                                                                onClick={
                                                                    handleEditMessage
                                                                }
                                                                disabled={
                                                                    editingSending ||
                                                                    !editingText.trim()
                                                                }
                                                                className="
                                                                    px-3
                                                                    py-1
                                                                    rounded-lg
                                                                    bg-blue-500
                                                                    text-white
                                                                    text-xs
                                                                    disabled:opacity-50
                                                                "
                                                            >
                                                                Save
                                                            </button>


                                                            <button
                                                                type="button"
                                                                onClick={() => {

                                                                    setEditingMessageId(
                                                                        null
                                                                    );

                                                                    setEditingText(
                                                                        ""
                                                                    );

                                                                }}
                                                                className="
                                                                    px-3
                                                                    py-1
                                                                    rounded-lg
                                                                    bg-gray-700
                                                                    text-gray-300
                                                                    text-xs
                                                                "
                                                            >
                                                                Cancel
                                                            </button>

                                                        </div>

                                                    </div>

                                                ) : (

                                                    /* =================================
                                                        NORMAL MESSAGE
                                                    ================================= */

                                                    <>
                                                        <span>
                                                            {item.message}
                                                        </span>


                                                        {item.isEdited && (

                                                            <span
                                                                className={`
                                                                    ml-2
                                                                    text-[10px]
                                                                    ${
                                                                        isOwnMessage
                                                                            ? "text-blue-100/70"
                                                                            : "text-gray-500"
                                                                    }
                                                                `}
                                                            >
                                                                edited
                                                            </span>

                                                        )}

                                                    </>

                                                )}

                                            </div>


                                            {/* =================================
                                                MESSAGE MENU
                                            ================================= */}

                                            {!item.isDeletedForEveryone && (

                                                <div
                                                    className={`
                                                        absolute
                                                        ${
                                                            isOwnMessage
                                                                ? "-left-8"
                                                                : "-right-8"
                                                        }
                                                        top-1
                                                    `}
                                                >

                                                    {/* MORE BUTTON */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setOpenMenuId(
                                                                openMenuId ===
                                                                    item._id
                                                                    ? null
                                                                    : item._id
                                                            )
                                                        }
                                                        className="
                                                            w-7
                                                            h-7
                                                            rounded-full
                                                            flex
                                                            items-center
                                                            justify-center
                                                            text-gray-500
                                                            hover:text-white
                                                            hover:bg-white/10
                                                            active:bg-white/20
                                                            transition
                                                        "
                                                        title="Message options"
                                                    >

                                                        <MoreVertical
                                                            size={16}
                                                        />

                                                    </button>


                                                    {/* MENU */}

                                                    {openMenuId ===
                                                        item._id && (

                                                        <div
                                                            className={`
                                                                absolute
                                                                top-8
                                                                w-48
                                                                bg-gray-900
                                                                border
                                                                border-gray-700
                                                                rounded-xl
                                                                shadow-2xl
                                                                p-1
                                                                z-50
                                                                ${
                                                                    isOwnMessage
                                                                        ? "left-0"
                                                                        : "right-0"
                                                                }
                                                            `}
                                                        >

                                                            {/* =================================
                                                                REPLY
                                                            ================================= */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    startReplying(
                                                                        item
                                                                    )
                                                                }
                                                                className="
                                                                    w-full
                                                                    flex
                                                                    items-center
                                                                    gap-2
                                                                    px-3
                                                                    py-2.5
                                                                    rounded-lg
                                                                    text-sm
                                                                    text-gray-200
                                                                    hover:bg-white/10
                                                                    active:bg-white/15
                                                                    transition
                                                                "
                                                            >

                                                                <span
                                                                    className="
                                                                        text-base
                                                                        leading-none
                                                                    "
                                                                >
                                                                    ↩
                                                                </span>

                                                                Reply

                                                            </button>


                                                            {/* =================================
                                                                EDIT
                                                            ================================= */}

                                                            {item.sender?._id ===
                                                                currentUserId && (

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        startEditing(
                                                                            item
                                                                        )
                                                                    }
                                                                    className="
                                                                        w-full
                                                                        flex
                                                                        items-center
                                                                        gap-2
                                                                        px-3
                                                                        py-2.5
                                                                        rounded-lg
                                                                        text-sm
                                                                        text-gray-200
                                                                        hover:bg-white/10
                                                                        active:bg-white/15
                                                                        transition
                                                                    "
                                                                >

                                                                    <Pencil
                                                                        size={15}
                                                                    />

                                                                    Edit

                                                                </button>

                                                            )}


                                                            {/* =================================
                                                                DELETE FOR ME
                                                            ================================= */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteForMe(
                                                                        item._id
                                                                    )
                                                                }
                                                                className="
                                                                    w-full
                                                                    flex
                                                                    items-center
                                                                    gap-2
                                                                    px-3
                                                                    py-2.5
                                                                    rounded-lg
                                                                    text-sm
                                                                    text-gray-200
                                                                    hover:bg-white/10
                                                                    active:bg-white/15
                                                                    transition
                                                                "
                                                            >

                                                                <Trash2
                                                                    size={15}
                                                                />

                                                                Delete for me

                                                            </button>


                                                            {/* =================================
                                                                DELETE FOR EVERYONE
                                                            ================================= */}

                                                            {item.sender?._id ===
                                                                currentUserId && (

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDeleteForEveryone(
                                                                            item._id
                                                                        )
                                                                    }
                                                                    className="
                                                                        w-full
                                                                        flex
                                                                        items-center
                                                                        gap-2
                                                                        px-3
                                                                        py-2.5
                                                                        rounded-lg
                                                                        text-sm
                                                                        text-red-400
                                                                        hover:bg-red-500/10
                                                                        active:bg-red-500/15
                                                                        transition
                                                                    "
                                                                >

                                                                    <Trash2
                                                                        size={15}
                                                                    />

                                                                    Delete for everyone

                                                                </button>

                                                            )}

                                                        </div>

                                                    )}

                                                </div>

                                            )}

                                        </div>

                                    </div>


                                    {/* =================================
                                        OWN USER AVATAR
                                    ================================= */}

                                    {isOwnMessage && (

                                        <img
                                            src={
                                                item.sender
                                                    ?.profilePicture
                                                    ?.url ||
                                                "/default-avatar.png"
                                            }
                                            alt="You"
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

                                    )}

                                </div>

                            );

                        }

                    )

                )}


                {/* =================================
                    TYPING
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
                            px-1
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

                            {typingUser.username}
                            {" "}
                            is typing...

                        </span>

                    </div>

                )}


                <div
                    ref={messagesEndRef}
                />

            </div>


            {/* =================================
                ENCRYPTION STATUS
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
                MESSAGE COMPOSER
            ================================= */}

            <form
                onSubmit={handleSendMessage}
                className="
                    relative
                    shrink-0
                    p-2.5
                    sm:p-3
                    border-t
                    border-white/10
                    bg-gray-900/90
                    backdrop-blur-md
                "
            >

                {/* =================================
                    REPLYING TO
                ================================= */}

                {replyingTo && (

                    <div
                        className="
                            mb-2
                            flex
                            items-center
                            gap-3
                            px-3
                            py-2.5
                            rounded-xl
                            bg-gray-800
                            border
                            border-blue-500/30
                        "
                    >

                        {/* Blue line */}

                        <div
                            className="
                                w-1
                                self-stretch
                                bg-blue-500
                                rounded-full
                            "
                        />


                        <div
                            className="
                                flex-1
                                min-w-0
                            "
                        >

                            <div
                                className="
                                    text-xs
                                    text-blue-400
                                    font-semibold
                                "
                            >

                                Replying to{" "}
                                {replyingTo.sender?.username ||
                                    "User"}

                            </div>


                            <div
                                className="
                                    mt-0.5
                                    text-xs
                                    text-gray-400
                                    truncate
                                "
                            >

                                {replyingTo.isDeletedForEveryone
                                    ? "This message was deleted"
                                    : replyingTo.message}

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                setReplyingTo(null)
                            }
                            className="
                                shrink-0
                                w-7
                                h-7
                                rounded-full
                                flex
                                items-center
                                justify-center
                                text-gray-400
                                hover:text-white
                                hover:bg-white/10
                                active:bg-white/20
                                transition
                            "
                            title="Cancel reply"
                        >

                            ✕

                        </button>

                    </div>

                )}


                {/* =================================
                    INPUT ROW
                ================================= */}

                <div
                    className="
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

                </div>

            </form>

        </div>

    );

};


export default ChatPanel;