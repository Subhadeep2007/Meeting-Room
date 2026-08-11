import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({

        // ==========================================
        // Meeting
        // ==========================================

        meeting: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "Meeting",

            required: true,

            index: true,

        },


        // ==========================================
        // Sender
        // ==========================================

        sender: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true,

        },


        // ==========================================
        // Encrypted Message
        // ==========================================

        encryptedMessage: {

            type: String,

            required: true,

        },


        // ==========================================
        // Initialization Vector
        // ==========================================

        iv: {

            type: String,

            required: true,

        },





        // ==========================================
        // Message Type
        // ==========================================

        messageType: {

            type: String,

            enum: ["text"],

            default: "text",

        },

    },

    {

        timestamps: true,

    }
);


// ==========================================
// Chat History Index
// ==========================================

messageSchema.index({

    meeting: 1,

    createdAt: -1,

});


const Message = mongoose.model(

    "Message",

    messageSchema

);


export default Message;