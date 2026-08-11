import {
    generateUserKeyPair,
    exportPublicKey,
    generateMeetingKey,
    exportMeetingKey,
    importMeetingKey,
    encryptMeetingKeyForUser,
    decryptMeetingKey,
} from "./clientEncryption.jsx";


// ==========================================
// Browser Encryption State
// ==========================================

let userKeyPair = null;

const meetingKeys = new Map();


// ==========================================
// Session Storage Prefix
// ==========================================

const MEETING_KEY_PREFIX =
    "meeting-encryption-key:";


// ==========================================
// CryptoKey Validation
// ==========================================

const isCryptoKey = (key) => {

    return (
        key instanceof CryptoKey
    );

};


// ==========================================
// Initialize User Key Pair
// ==========================================

export const initializeUserEncryption = async () => {

    if (userKeyPair) {

        return userKeyPair;

    }


    userKeyPair =
        await generateUserKeyPair();


    return userKeyPair;

};


// ==========================================
// Get Public Key
// ==========================================

export const getPublicKey = async () => {

    if (!userKeyPair) {

        await initializeUserEncryption();

    }


    return exportPublicKey(
        userKeyPair.publicKey
    );

};


// ==========================================
// Create Meeting Encryption Key
// ==========================================

export const createMeetingEncryptionKey = async (
    meetingCode
) => {

    if (!meetingCode) {

        throw new Error(
            "Meeting code is required"
        );

    }


    // ==========================================
    // Generate AES-256-GCM CryptoKey
    // ==========================================

    const meetingKey =
        await generateMeetingKey();


    // ==========================================
    // Validate Generated Key
    // ==========================================

    if (!isCryptoKey(meetingKey)) {

        throw new Error(
            "Generated meeting key is invalid"
        );

    }


    // ==========================================
    // Store In Memory
    // ==========================================

    meetingKeys.set(

        meetingCode,

        meetingKey

    );


    // ==========================================
    // Export For Session Storage
    // ==========================================

    const exportedKey =
        await exportMeetingKey(
            meetingKey
        );


    // ==========================================
    // Store In Session
    // ==========================================

    sessionStorage.setItem(

        MEETING_KEY_PREFIX +
            meetingCode,

        exportedKey

    );


    return meetingKey;

};


// ==========================================
// Store Meeting Key
// ==========================================

export const storeMeetingKey = async (
    meetingCode,
    meetingKey
) => {

    if (!meetingCode) {

        throw new Error(
            "Meeting code is required"
        );

    }


    if (!meetingKey) {

        throw new Error(
            "Meeting key is required"
        );

    }


    // ==========================================
    // IMPORTANT
    // Key MUST be CryptoKey
    // ==========================================

    if (!isCryptoKey(meetingKey)) {

        throw new Error(
            "Meeting key must be a CryptoKey"
        );

    }


    // ==========================================
    // Store In Memory
    // ==========================================

    meetingKeys.set(

        meetingCode,

        meetingKey

    );


    // ==========================================
    // Export Key
    // ==========================================

    const exportedKey =
        await exportMeetingKey(
            meetingKey
        );


    // ==========================================
    // Store Session
    // ==========================================

    sessionStorage.setItem(

        MEETING_KEY_PREFIX +
            meetingCode,

        exportedKey

    );

};


// ==========================================
// Get Meeting Key
// ==========================================

export const getMeetingKey = async (
    meetingCode
) => {

    if (!meetingCode) {

        return null;

    }


    // ==========================================
    // Check Memory
    // ==========================================

    const memoryKey =
        meetingKeys.get(
            meetingCode
        );


    // ==========================================
    // Memory Key Is Valid CryptoKey
    // ==========================================

    if (
        memoryKey &&
        isCryptoKey(memoryKey)
    ) {

        return memoryKey;

    }


    // ==========================================
    // Remove Invalid Memory Value
    // ==========================================

    if (memoryKey) {

        meetingKeys.delete(
            meetingCode
        );

    }


    // ==========================================
    // Get Session Storage Key
    // ==========================================

    const storedKey =
        sessionStorage.getItem(

            MEETING_KEY_PREFIX +
                meetingCode

        );


    if (!storedKey) {

        return null;

    }


    try {

        // ==========================================
        // Import Stored AES Key
        // ==========================================

        const meetingKey =
            await importMeetingKey(
                storedKey
            );


        // ==========================================
        // Validate Imported Key
        // ==========================================

        if (!isCryptoKey(meetingKey)) {

            throw new Error(
                "Imported meeting key is invalid"
            );

        }


        // ==========================================
        // Restore In Memory
        // ==========================================

        meetingKeys.set(

            meetingCode,

            meetingKey

        );


        return meetingKey;

    } catch {

        // ==========================================
        // Remove Invalid Session Key
        // ==========================================

        sessionStorage.removeItem(

            MEETING_KEY_PREFIX +
                meetingCode

        );


        meetingKeys.delete(
            meetingCode
        );


        return null;

    }

};


// ==========================================
// Export Meeting Key
// ==========================================

export const getExportedMeetingKey = async (
    meetingCode
) => {

    const meetingKey =
        await getMeetingKey(
            meetingCode
        );


    if (!meetingKey) {

        throw new Error(
            "Meeting encryption key not found"
        );

    }


    return exportMeetingKey(
        meetingKey
    );

};


// ==========================================
// Encrypt Meeting Key For User
// ==========================================

export const createEncryptedMeetingKeyForUser =
async (
    meetingCode,
    publicKey
) => {

    const meetingKey =
        await getMeetingKey(
            meetingCode
        );


    if (!meetingKey) {

        throw new Error(
            "Meeting encryption key not found"
        );

    }


    if (!isCryptoKey(meetingKey)) {

        throw new Error(
            "Meeting key is not a valid CryptoKey"
        );

    }


    return encryptMeetingKeyForUser(

        meetingKey,

        publicKey

    );

};


// ==========================================
// Receive Encrypted Meeting Key
// ==========================================

export const receiveEncryptedMeetingKey =
async (
    meetingCode,
    encryptedMeetingKey
) => {

    if (!meetingCode) {

        throw new Error(
            "Meeting code is required"
        );

    }


    if (!encryptedMeetingKey) {

        throw new Error(
            "Encrypted meeting key is required"
        );

    }


    // ==========================================
    // Initialize User Key Pair
    // ==========================================

    if (!userKeyPair) {

        await initializeUserEncryption();

    }


    // ==========================================
    // Decrypt AES Meeting Key
    // ==========================================

    const meetingKey =
        await decryptMeetingKey(

            encryptedMeetingKey,

            userKeyPair.privateKey

        );


    // ==========================================
    // Validate Decrypted Key
    // ==========================================

    if (!isCryptoKey(meetingKey)) {

        throw new Error(
            "Decrypted meeting key is invalid"
        );

    }


    // ==========================================
    // Store Meeting Key
    // ==========================================

    await storeMeetingKey(

        meetingCode,

        meetingKey

    );


    return meetingKey;

};


// ==========================================
// Remove Meeting Key
// ==========================================

export const removeMeetingKey = (
    meetingCode
) => {

    if (!meetingCode) {

        return;

    }


    // ==========================================
    // Remove Memory
    // ==========================================

    meetingKeys.delete(
        meetingCode
    );


    // ==========================================
    // Remove Session Storage
    // ==========================================

    sessionStorage.removeItem(

        MEETING_KEY_PREFIX +
            meetingCode

    );

};


// ==========================================
// Clear All Meeting Keys
// ==========================================

export const clearAllMeetingKeys = () => {

    // ==========================================
    // Clear Memory
    // ==========================================

    meetingKeys.clear();


    // ==========================================
    // Clear Session Storage
    // ==========================================

    Object.keys(
        sessionStorage
    ).forEach(
        (key) => {

            if (
                key.startsWith(
                    MEETING_KEY_PREFIX
                )
            ) {

                sessionStorage.removeItem(
                    key
                );

            }

        }
    );

};