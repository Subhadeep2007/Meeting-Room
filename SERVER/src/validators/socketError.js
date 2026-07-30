export const socketError = (callback, error) => {

    if (callback) {
        callback({
            success: false,
            message: error.message,
        });
    }

};