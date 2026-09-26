const crypto = require('crypto');
const Admin = require('../models/Admin');
const AdminOtp = require('../models/AdminOtp');
const AuditLog = require('../models/AuditLog');
const { sendOtpEmail } = require('../config/email');
const { generateAuthToken, setAuthCookie, clearAuthCookie } = require('../middleware/auth');

/**
 * Validates password according to security requirements:
 * - At least one uppercase letter [A-Z]
 * - At least one lowercase letter [a-z]
 * - At least one special character such as @, #, $, &
 * - At least 8 characters long
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      message: 'Password is required.',
      errors: ['Password is required.']
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSpecialChar = /[@#$&!%*?~^_\-+=\[\]{}|:;\"'<>,./\\]/.test(password);
  const hasMinLength = password.length >= 8;

  const errors = [];
  if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter (A-Z).');
  if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter (a-z).');
  if (!hasSpecialChar) errors.push('Password must contain at least one special character such as @, #, $, &.');
  if (!hasMinLength) errors.push('Password must be at least 8 characters long.');

  return {
    isValid: errors.length === 0,
    errors,
    checks: {
      hasUpperCase,
      hasLowerCase,
      hasSpecialChar,
      hasMinLength
    }
  };
}

/**
 * Validates standard email address format
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * POST /api/admin/send-otp
 * Step 1: Admin enters email and password.
 * Validates password rules, verifies existing admin credentials (or stages new admin),
 * generates a 6-digit OTP, records audit log, and dispatches it via SMTP protocol.
 */
exports.sendOtp = async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  try {
    const { email, password } = req.body;

    if (!email || !isValidEmail(email)) {
      await AuditLog.record({
        action: 'AUTH_INVALID_EMAIL_ATTEMPT',
        status: 'WARNING',
        ip,
        userAgent,
        details: { email }
      });

      return res.status(400).json({
        success: false,
        message: 'A valid admin email address is required.'
      });
    }

    // Validate password complexity
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      await AuditLog.record({
        action: 'AUTH_WEAK_PASSWORD_REJECTED',
        status: 'WARNING',
        ip,
        userAgent,
        actor: { email: email.trim().toLowerCase(), role: 'guest' },
        details: { errors: passwordValidation.errors }
      });

      return res.status(400).json({
        success: false,
        message: passwordValidation.errors[0],
        errors: passwordValidation.errors,
        checks: passwordValidation.checks
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if admin already exists
    let existingAdmin = await Admin.findOne({ email: normalizedEmail });
    let tempHashData = null;

    if (existingAdmin) {
      // Admin exists: verify password
      const isMatch = existingAdmin.verifyPassword(password);
      if (!isMatch) {
        await AuditLog.record({
          action: 'AUTH_LOGIN_CREDENTIALS_MISMATCH',
          status: 'WARNING',
          ip,
          userAgent,
          actor: { email: normalizedEmail, id: existingAdmin._id, role: existingAdmin.role },
          details: { reason: 'Incorrect password entered' }
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please verify your credentials.'
        });
      }
    } else {
      // First time admin login: prepare secure hash for creation upon OTP verification
      tempHashData = Admin.hashPassword(password);
    }

    // Generate cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresInMinutes = 10;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    // Delete any pending OTPs for this email to avoid duplicates
    await AdminOtp.deleteMany({ email: normalizedEmail });

    // Store OTP in database
    await AdminOtp.create({
      email: normalizedEmail,
      otp: otp,
      tempPasswordHash: tempHashData ? tempHashData.hash : undefined,
      tempSalt: tempHashData ? tempHashData.salt : undefined,
      expiresAt: expiresAt,
      attempts: 0
    });

    // Send OTP via SMTP protocol
    try {
      await sendOtpEmail({
        toEmail: normalizedEmail,
        otp: otp,
        expiresInMinutes: expiresInMinutes
      });
    } catch (smtpError) {
      console.error('[SMTP Error] Failed to send email via SMTP:', smtpError);
      
      await AuditLog.record({
        action: 'AUTH_SMTP_DELIVERY_FAILED',
        status: 'FAILURE',
        ip,
        userAgent,
        actor: { email: normalizedEmail, role: 'admin' },
        details: { error: smtpError.message }
      });

      return res.status(500).json({
        success: false,
        message: `Failed to send verification email: ${smtpError.message}. Please verify your email configuration.`
      });
    }

    // Record successful OTP dispatch
    await AuditLog.record({
      action: 'AUTH_OTP_DISPATCHED',
      status: 'SUCCESS',
      ip,
      userAgent,
      actor: { email: normalizedEmail, role: 'admin' },
      details: { expiresInMinutes }
    });

    console.log(`[AUTH] Successfully dispatched OTP to ${normalizedEmail}`);

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${normalizedEmail}`,
      email: normalizedEmail,
      expiresInMinutes: expiresInMinutes
    });
  } catch (error) {
    console.error('Error in sendOtp controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while processing login request: ' + error.message
    });
  }
};

/**
 * POST /api/admin/verify-otp
 * Step 2: Admin enters the 6-digit OTP received via SMTP.
 * Validates OTP, issues signed JWT, sets HttpOnly secure cookie, and records audit trail.
 */
exports.verifyOtp = async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Both email and the 6-digit OTP are required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    // Find the active OTP record
    const otpRecord = await AdminOtp.findOne({
      email: normalizedEmail,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      await AuditLog.record({
        action: 'AUTH_VERIFY_EXPIRED_OR_ABSENT',
        status: 'WARNING',
        ip,
        userAgent,
        actor: { email: normalizedEmail, role: 'guest' },
        details: { attemptedOtp: cleanOtp }
      });

      return res.status(400).json({
        success: false,
        message: 'OTP has expired or does not exist. Please request a new code.'
      });
    }

    // Rate-limiting on incorrect attempts: max 5 failed attempts
    if (otpRecord.attempts >= 5) {
      await AdminOtp.deleteOne({ _id: otpRecord._id });

      await AuditLog.record({
        action: 'AUTH_OTP_MAX_ATTEMPTS_EXCEEDED',
        status: 'BLOCKED',
        ip,
        userAgent,
        actor: { email: normalizedEmail, role: 'guest' },
        details: { attempts: otpRecord.attempts }
      });

      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. For security, please request a new OTP.'
      });
    }

    // Validate the OTP
    if (otpRecord.otp !== cleanOtp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = 5 - otpRecord.attempts;

      await AuditLog.record({
        action: 'AUTH_OTP_INCORRECT_ATTEMPT',
        status: 'WARNING',
        ip,
        userAgent,
        actor: { email: normalizedEmail, role: 'guest' },
        details: { attempts: otpRecord.attempts, remaining }
      });

      return res.status(400).json({
        success: false,
        message: `Invalid OTP code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Code invalidated.'}`
      });
    }

    // OTP is valid! Find or create the Admin user
    let admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      if (!otpRecord.tempPasswordHash || !otpRecord.tempSalt) {
        return res.status(400).json({
          success: false,
          message: 'Session state expired. Please re-enter your credentials to sign in.'
        });
      }

      admin = await Admin.create({
        email: normalizedEmail,
        passwordHash: otpRecord.tempPasswordHash,
        salt: otpRecord.tempSalt,
        name: 'System Administrator',
        role: 'superadmin',
        lastLogin: new Date()
      });
    } else {
      admin.lastLogin = new Date();
      await admin.save();
    }

    // Delete used OTP
    await AdminOtp.deleteOne({ _id: otpRecord._id });

    // Generate tamper-proof signed JWT
    const token = generateAuthToken(admin);

    // Set secure HttpOnly cookie for anti-XSS and automatic CSRF-guarded session management
    setAuthCookie(res, token);

    // Record audit event
    await AuditLog.record({
      action: 'AUTH_LOGIN_SUCCESS',
      status: 'SUCCESS',
      ip,
      userAgent,
      actor: { email: admin.email, id: admin._id, role: admin.role },
      details: { method: 'SMTP_2FA_OTP', lastLogin: admin.lastLogin }
    });

    return res.status(200).json({
      success: true,
      message: 'Authentication successful. Access granted.',
      token: token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    console.error('Error in verifyOtp controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error verifying OTP: ' + error.message
    });
  }
};

/**
 * POST /api/admin/resend-otp
 * Resends a fresh OTP via SMTP for the given email with audit logging
 */
exports.resendOtp = async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'A valid email is required to resend OTP.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingRecord = await AdminOtp.findOne({ email: normalizedEmail });

    if (!existingRecord) {
      return res.status(400).json({
        success: false,
        message: 'No active authentication session found. Please enter your credentials again.'
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresInMinutes = 10;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    existingRecord.otp = otp;
    existingRecord.attempts = 0;
    existingRecord.expiresAt = expiresAt;
    await existingRecord.save();

    try {
      await sendOtpEmail({
        toEmail: normalizedEmail,
        otp: otp,
        expiresInMinutes: expiresInMinutes
      });
    } catch (smtpError) {
      return res.status(500).json({
        success: false,
        message: `SMTP Protocol failed to send verification email: ${smtpError.message}`
      });
    }

    await AuditLog.record({
      action: 'AUTH_OTP_RESENT',
      status: 'SUCCESS',
      ip,
      userAgent,
      actor: { email: normalizedEmail, role: 'admin' },
      details: { expiresInMinutes }
    });

    console.log(`[AUTH] Resent fresh OTP to ${normalizedEmail}`);

    return res.status(200).json({
      success: true,
      message: `A fresh 6-digit OTP code has been sent to ${normalizedEmail}`,
      email: normalizedEmail
    });
  } catch (error) {
    console.error('Error in resendOtp controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend OTP: ' + error.message
    });
  }
};

/**
 * POST /api/admin/logout
 * Clears secure authentication cookie and writes audit log
 */
exports.logout = async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  try {
    clearAuthCookie(res);

    if (req.admin) {
      await AuditLog.record({
        action: 'AUTH_LOGOUT',
        status: 'SUCCESS',
        ip,
        userAgent,
        actor: { email: req.admin.email, id: req.admin._id, role: req.admin.role },
        details: { message: 'Admin logged out' }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully logged out and session terminated.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Logout error: ' + err.message
    });
  }
};

/**
 * GET /api/admin/audit-logs
 * Protected endpoint to inspect security audit trail
 */
exports.getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status.toUpperCase();
    if (req.query.action) query.action = req.query.action.toUpperCase();

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      logs
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit logs: ' + err.message
    });
  }
};

/**
 * GET /api/admin/validate-password-policy
 * Utility endpoint allowing frontend to query server-side password criteria
 */
exports.getPasswordPolicy = (req, res) => {
  res.json({
    rules: [
      { id: 'uppercase', text: 'At least one uppercase letter (A-Z)' },
      { id: 'lowercase', text: 'At least one lowercase letter (a-z)' },
      { id: 'special', text: 'At least one special character (@, #, $, &)' },
      { id: 'length', text: 'At least 8 characters long' }
    ]
  });
};
