export const validateSendMessage = (data) => {

    const {

        meetingId,

        message,

        attachments = [],

    } = data;

    if (!meetingId) {

        throw new Error("Meeting ID is required");

    }

    if (!message && attachments.length === 0) {

        throw new Error("Message or Attachment is required");

    }

};