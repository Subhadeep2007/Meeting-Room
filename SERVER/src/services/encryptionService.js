import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";

// ===============================
// Constants
// ===============================

const ALGORITHM = "aes-256-gcm";

if (!process.env.ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY missing in .env");
}


// 32 Byte Secret Key
const SECRET_KEY =
    Buffer.from(process.env.ENCRYPTION_KEY, "hex");

// ===============================
// Encrypt Message
// ===============================

export const encryptMessage = (message) => {

    try {

        if (!message) {
            throw new Error("Message is required");
        }

        // Random IV (12 bytes for GCM)
        const iv = crypto.randomBytes(12);

        // Create Cipher
        const cipher = crypto.createCipheriv(
            ALGORITHM,
            SECRET_KEY,
            iv
        );

        // Encrypt
        let encrypted = cipher.update(
            message,
            "utf8",
            "hex"
        );

        encrypted += cipher.final("hex");

        // Authentication Tag
        const authTag = cipher.getAuthTag();

        return {

            encryptedMessage: encrypted,

            iv: iv.toString("hex"),

            authTag: authTag.toString("hex"),

        };

    } catch (error) {

        throw error;

    }

};


// ===============================
// Decrypt Message
// ===============================

export const decryptMessage = ({
    encryptedMessage,
    iv,
    authTag,
}) => {

    try {

        if (!encryptedMessage ||
            !iv ||
            !authTag
        ) {
            throw new Error("Invalid encrypted data");
        }

        // Create Decipher
        const decipher = crypto.createDecipheriv(

            ALGORITHM,

            SECRET_KEY,

            Buffer.from(iv, "hex")

        );

        // Verify Authentication Tag
        decipher.setAuthTag(
            Buffer.from(authTag, "hex")
        );

        // Decrypt
        let decrypted = decipher.update(

            encryptedMessage,

            "hex",

            "utf8"

        );

        decrypted += decipher.final("utf8");

        return decrypted;

    } catch (error) {

        throw new Error(
            "Unable to decrypt message"
        );

    }

};