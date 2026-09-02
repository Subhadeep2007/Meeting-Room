import rateLimit from "express-rate-limit";


// ==========================================
// GENERAL API RATE LIMITER
// ==========================================

const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 200,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});


// ==========================================
// AUTH RATE LIMITER
// ==========================================

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 10,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many authentication attempts. Please try again later."
    }
});


export {
    apiRateLimiter,
    authRateLimiter
};