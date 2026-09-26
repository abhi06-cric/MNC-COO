const rateLimit = require('express-rate-limit');
const AuditLog = require('../models/AuditLog');

/**
 * Helper to record audit log on rate limit breach
 */
const handleRateLimitBreach = (actionName) => (req, res, next, options) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  console.warn(`[SECURITY RATE LIMIT] IP ${ip} exceeded limit on ${actionName} (${req.originalUrl})`);

  AuditLog.record({
    action: 'SECURITY_RATE_LIMIT_EXCEEDED',
    status: 'BLOCKED',
    actor: { email: req.body?.email || 'anonymous', role: 'guest' },
    ip,
    userAgent,
    details: {
      endpoint: req.originalUrl,
      method: req.method,
      limitType: actionName
    }
  }).catch(() => {});

  res.status(options.statusCode).json({
    success: false,
    message: options.message,
    retryAfterMinutes: Math.ceil(options.windowMs / 60000)
  });
};

/**
 * Global API Rate Limiter
 * 300 requests per 15 minutes per IP
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP. Please try again in 15 minutes.',
  handler: handleRateLimitBreach('GLOBAL_API')
});

/**
 * Strict Rate Limiter for OTP Generation (Step 1)
 * 5 requests per 15 minutes per IP to prevent email spamming
 */
const authOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts from this IP. Please wait 15 minutes before requesting a new OTP.',
  handler: handleRateLimitBreach('AUTH_SEND_OTP')
});

/**
 * Strict Rate Limiter for OTP Verification (Step 2)
 * 10 verification attempts per 15 minutes per IP to prevent brute-forcing
 */
const authVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many incorrect verification attempts. For security reasons, please wait 15 minutes.',
  handler: handleRateLimitBreach('AUTH_VERIFY_OTP')
});

/**
 * Resend OTP Rate Limiter
 * 3 requests per 15 minutes per IP
 */
const authResendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many resend attempts. Please wait a few minutes before asking for another code.',
  handler: handleRateLimitBreach('AUTH_RESEND_OTP')
});

/**
 * Mutation Limiter for Company/Candidate Admin operations
 * 60 requests per 15 minutes
 */
const apiMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many administrative modifications from this IP. Please slow down.',
  handler: handleRateLimitBreach('ADMIN_MUTATION')
});

module.exports = {
  globalLimiter,
  authOtpLimiter,
  authVerifyLimiter,
  authResendLimiter,
  apiMutationLimiter
};
