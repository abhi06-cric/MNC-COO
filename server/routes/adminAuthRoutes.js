const express = require('express');
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  resendOtp,
  logout,
  getAuditLogs,
  getPasswordPolicy
} = require('../controllers/adminAuthController');

const {
  authOtpLimiter,
  authVerifyLimiter,
  authResendLimiter
} = require('../middleware/rateLimiter');

const {
  validateSendOtp,
  validateVerifyOtp
} = require('../middleware/validator');

const { verifyAdmin } = require('../middleware/auth');

// Step 1: Send OTP to admin email via SMTP protocol (strictly rate-limited and validated)
router.post('/send-otp', authOtpLimiter, validateSendOtp, sendOtp);

// Step 2: Verify OTP and authenticate admin (brute-force protected, issues JWT & Secure Cookie)
router.post('/verify-otp', authVerifyLimiter, validateVerifyOtp, verifyOtp);

// Resend OTP via SMTP protocol (rate-limited)
router.post('/resend-otp', authResendLimiter, resendOtp);

// Admin Logout: clears HttpOnly cookie & terminates session
router.post('/logout', logout);

// Protected: Get security audit logs (requires verified admin)
router.get('/audit-logs', verifyAdmin, getAuditLogs);

// Query password requirements
router.get('/password-policy', getPasswordPolicy);

module.exports = router;
