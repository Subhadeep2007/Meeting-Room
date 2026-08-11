// ==========================================
// CLIENT SIDE ENCRYPTION
// Web Crypto API
// ==========================================


// ==========================================
// Constants
// ==========================================

const AES_ALGORITHM = "AES-GCM";

const AES_KEY_LENGTH = 256;

const IV_LENGTH = 12;

const RSA_ALGORITHM = "RSA-OAEP";

const RSA_HASH = "SHA-256";

const RSA_MODULUS_LENGTH = 2048;


// ==========================================
// Generate Meeting Encryption Key
// ==========================================

export const generateMeetingKey = async () => {

    const key =
        await crypto.subtle.generateKey(

            {
                name: AES_ALGORITHM,

                length: AES_KEY_LENGTH,
            },

            true,

            [
                "encrypt",
                "decrypt",
            ]

        );

    return key;
};


// ==========================================
// Export AES Key
// ==========================================

export const exportMeetingKey = async (
    key
) => {

    const rawKey =
        await crypto.subtle.exportKey(
            "raw",
            key
        );


    return arrayBufferToBase64(
        rawKey
    );
};


// ==========================================
// Import AES Key
// ==========================================

export const importMeetingKey = async (
    base64Key
) => {

    const rawKey =
        base64ToArrayBuffer(
            base64Key
        );


    return crypto.subtle.importKey(

        "raw",

        rawKey,

        {
            name: AES_ALGORITHM,
        },

        true,

        [
            "encrypt",
            "decrypt",
        ]

    );
};


// ==========================================
// Encrypt Message
// ==========================================

export const encryptMessage = async (
    message,
    meetingKey
) => {

    if (!message) {

        throw new Error(
            "Message is required"
        );

    }


    if (!meetingKey) {

        throw new Error(
            "Meeting encryption key is required"
        );

    }


    // ==========================================
    // Random IV
    // ==========================================

    const iv =
        crypto.getRandomValues(
            new Uint8Array(
                IV_LENGTH
            )
        );


    // ==========================================
    // Convert Message To Bytes
    // ==========================================

    const encodedMessage =
        new TextEncoder().encode(
            message
        );


    // ==========================================
    // Encrypt Message
    // ==========================================

    const encryptedBuffer =
        await crypto.subtle.encrypt(

            {
                name: AES_ALGORITHM,

                iv,
            },

            meetingKey,

            encodedMessage

        );


    // ==========================================
    // AES-GCM Authentication Tag
    //
    // Web Crypto API automatically includes
    // authentication tag inside ciphertext.
    //
    // Therefore we DO NOT return authTag
    // separately.
    // ==========================================

    return {

        encryptedMessage:
            arrayBufferToBase64(
                encryptedBuffer
            ),

        iv:
            arrayBufferToBase64(
                iv
            ),

    };
};


// ==========================================
// Decrypt Message
// ==========================================

export const decryptMessage = async (
    encryptedMessage,
    iv,
    meetingKey
) => {

    if (
        !encryptedMessage ||
        !iv ||
        !meetingKey
    ) {

        throw new Error(
            "Invalid encrypted message data"
        );

    }


    // ==========================================
    // Convert Encrypted Message
    // ==========================================

    const encryptedBuffer =
        base64ToArrayBuffer(
            encryptedMessage
        );


    // ==========================================
    // Convert IV
    // ==========================================

    const ivBuffer =
        base64ToArrayBuffer(
            iv
        );


    // ==========================================
    // Decrypt
    // ==========================================

    const decryptedBuffer =
        await crypto.subtle.decrypt(

            {
                name: AES_ALGORITHM,

                iv:
                    new Uint8Array(
                        ivBuffer
                    ),
            },

            meetingKey,

            encryptedBuffer

        );


    // ==========================================
    // Convert Bytes To Text
    // ==========================================

    return new TextDecoder().decode(
        decryptedBuffer
    );
};


// ==========================================
// Generate User RSA Key Pair
// ==========================================

export const generateUserKeyPair = async () => {

    const keyPair =
        await crypto.subtle.generateKey(

            {
                name: RSA_ALGORITHM,

                modulusLength:
                    RSA_MODULUS_LENGTH,

                publicExponent:
                    new Uint8Array([
                        1,
                        0,
                        1,
                    ]),

                hash:
                    RSA_HASH,
            },

            true,

            [
                "encrypt",
                "decrypt",
            ]

        );


    return keyPair;
};


// ==========================================
// Export Public Key
// ==========================================

export const exportPublicKey = async (
    publicKey
) => {

    const exportedKey =
        await crypto.subtle.exportKey(
            "spki",
            publicKey
        );


    return arrayBufferToBase64(
        exportedKey
    );
};


// ==========================================
// Import Public Key
// ==========================================

export const importPublicKey = async (
    base64PublicKey
) => {

    const keyData =
        base64ToArrayBuffer(
            base64PublicKey
        );


    return crypto.subtle.importKey(

        "spki",

        keyData,

        {
            name: RSA_ALGORITHM,

            hash: RSA_HASH,
        },

        true,

        [
            "encrypt",
        ]

    );
};


// ==========================================
// Encrypt Meeting Key For Another User
// ==========================================

export const encryptMeetingKeyForUser = async (
    meetingKey,
    publicKey
) => {

    if (!meetingKey) {

        throw new Error(
            "Meeting encryption key is required"
        );

    }


    if (!publicKey) {

        throw new Error(
            "Public key is required"
        );

    }


    // ==========================================
    // Export AES Meeting Key
    // ==========================================

    const rawMeetingKey =
        await crypto.subtle.exportKey(
            "raw",
            meetingKey
        );


    // ==========================================
    // Encrypt AES Key Using RSA Public Key
    // ==========================================

    const encryptedKey =
        await crypto.subtle.encrypt(

            {
                name: RSA_ALGORITHM,
            },

            publicKey,

            rawMeetingKey

        );


    return arrayBufferToBase64(
        encryptedKey
    );
};


// ==========================================
// Decrypt Meeting Key
// ==========================================

export const decryptMeetingKey = async (
    encryptedMeetingKey,
    privateKey
) => {

    if (
        !encryptedMeetingKey ||
        !privateKey
    ) {

        throw new Error(
            "Invalid encrypted meeting key data"
        );

    }


    // ==========================================
    // Convert Encrypted Key
    // ==========================================

    const encryptedKey =
        base64ToArrayBuffer(
            encryptedMeetingKey
        );


    // ==========================================
    // RSA Decryption
    // ==========================================

    const rawMeetingKey =
        await crypto.subtle.decrypt(

            {
                name: RSA_ALGORITHM,
            },

            privateKey,

            encryptedKey

        );


    // ==========================================
    // Import Back As AES-GCM Key
    // ==========================================

    return crypto.subtle.importKey(

        "raw",

        rawMeetingKey,

        {
            name: AES_ALGORITHM,
        },

        true,

        [
            "encrypt",
            "decrypt",
        ]

    );
};


// ==========================================
// Utility
// ArrayBuffer → Base64
// ==========================================

const arrayBufferToBase64 = (
    buffer
) => {

    const bytes =
        new Uint8Array(
            buffer
        );


    let binary = "";


    bytes.forEach(
        (byte) => {

            binary += String.fromCharCode(
                byte
            );

        }
    );


    return btoa(
        binary
    );
};


// ==========================================
// Utility
// Base64 → ArrayBuffer
// ==========================================

const base64ToArrayBuffer = (
    base64
) => {

    const binary =
        atob(
            base64
        );


    const bytes =
        new Uint8Array(
            binary.length
        );


    for (
        let i = 0;
        i < binary.length;
        i++
    ) {

        bytes[i] =
            binary.charCodeAt(i);

    }


    return bytes.buffer;
};