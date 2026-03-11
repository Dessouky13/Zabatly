import { rateLimit } from 'express-rate-limit';

/**
 * Strict rate limiter for auth endpoints.
 * Prevents brute-force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 5,
  message: { error: 'Too many authentication attempts. Please wait 1 minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for payment upload endpoint.
 * Max 3 payment attempts per user per 24 hours.
 */
export const paymentLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: Number(process.env.PAYMENT_RATE_LIMIT_MAX) || 3,
  keyGenerator: (req) => req.user?.id || req.ip || 'anonymous',
  message: { error: 'Maximum payment attempts reached for today. Please try again tomorrow.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for AI generation endpoints.
 * Prevents API cost abuse.
 */
export const generationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  keyGenerator: (req) => req.user?.id || req.ip || 'anonymous',
  message: { error: 'Generation rate limit exceeded. Please wait before generating again.' },
  standardHeaders: true,
  legacyHeaders: false,
});
