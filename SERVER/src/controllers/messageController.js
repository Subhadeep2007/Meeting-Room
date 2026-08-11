import httpStatus from "http-status";

import {
    getMessageHistory,
} from "../services/messageService.js";


// ==========================================
// GET MESSAGE HISTORY
// ==========================================

export const getMessages = async(req, res) => {

    try {

        const { meetingId } = req.params;

        const { cursor } = req.query;


        // ==========================================
        // Validate Meeting ID
        // ==========================================

        if (!meetingId) {

            return res.status(
                httpStatus.BAD_REQUEST
            ).json({

                success: false,

                message: "Meeting ID is required",

            });

        }


        // ==========================================
        // Limit
        // ==========================================

        let limit =
            Number(req.query.limit) || 30;


        // Minimum Limit

        if (limit < 1) {

            limit = 30;

        }


        // Maximum Limit

        if (limit > 50) {

            limit = 50;

        }


        // ==========================================
        // Get Message History
        // ==========================================

        const result =
            await getMessageHistory({

                meetingId,

                userId: req.user._id,

                cursor,

                limit,

            });


        // ==========================================
        // Response
        // ==========================================

        return res.status(
            httpStatus.OK
        ).json({

            success: true,

            ...result,

        });


    } catch (error) {

        console.error(
            "Get Message History Error:",
            error
        );


        // ==========================================
        // Meeting Not Found
        // ==========================================

        if (
            error.message ===
            "Meeting not found"
        ) {

            return res.status(
                httpStatus.NOT_FOUND
            ).json({

                success: false,

                message: "Meeting not found",

            });

        }


        // ==========================================
        // Unauthorized Chat Access
        // ==========================================

        if (
            error.message ===
            "You are not authorized to view this chat"
        ) {

            return res.status(
                httpStatus.FORBIDDEN
            ).json({

                success: false,

                message: "You are not authorized to view this chat",

            });

        }


        // ==========================================
        // Invalid Meeting ID / Cursor
        // ==========================================

        if (
            error.message ===
            "Invalid meeting ID" ||

            error.message ===
            "Invalid cursor"
        ) {

            return res.status(
                httpStatus.BAD_REQUEST
            ).json({

                success: false,

                message: error.message,

            });

        }


        // ==========================================
        // Internal Error
        // ==========================================

        return res.status(
            httpStatus.INTERNAL_SERVER_ERROR
        ).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};