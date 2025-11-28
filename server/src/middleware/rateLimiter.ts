import rateLimit from 'express-rate-limit';

// Rate limiter for signup endpoints
// 5 signup attempts per IP per hour
export const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 requests per hour
    message: {
        success: false,
        message: 'Too many signup attempts. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for email verification resend
// 3 requests per email per hour
export const resendLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        success: false,
        message: 'Too many verification email requests. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
