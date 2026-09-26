const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const AuditLog = require('../models/AuditLog');

const JWT_SECRET = process.env.JWT_SECRET || 'mnc_executive_jwt_super_secret_key_8492049182390481239';
const TOKEN_EXPIRY = '8h';

/**
 * Generates a signed, tamper-proof JSON Web Token for the Admin user
 */
const generateAuthToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      email: admin.email,
      role: admin.role || 'superadmin'
    },
    JWT_SECRET,
    {
      expiresIn: TOKEN_EXPIRY,
      issuer: 'mnc-portal-auth',
      audience: 'mnc-admin-console'
    }
  );
};

/**
 * Sets an HttpOnly, Secure, SameSite Cookie on the response
 */
const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('admin_token', token, {
    httpOnly: true, // Prevents JavaScript document.cookie access (anti-XSS)
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? 'strict' : 'lax', // CSRF mitigation
    maxAge: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
    path: '/'
  });
};

/**
 * Clears the authentication cookie on logout
 */
const clearAuthCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/'
  });
};

/**
 * Protects administrative routes by verifying token from Secure Cookie or Authorization Bearer header
 */
const verifyAdmin = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HttpOnly cookie
    if (req.cookies && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    }

    // 2. Check Authorization Bearer header fallback
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    if (!token) {
      AuditLog.record({
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        status: 'WARNING',
        ip,
        userAgent,
        details: { path: req.originalUrl, method: req.method, reason: 'Missing auth token' }
      }).catch(() => {});

      return res.status(401).json({
        success: false,
        message: 'Authentication required. No session token provided.'
      });
    }

    // Verify JWT signature and expiration
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'mnc-portal-auth',
        audience: 'mnc-admin-console'
      });
    } catch (err) {
      AuditLog.record({
        action: 'INVALID_TOKEN_ATTEMPT',
        status: 'WARNING',
        ip,
        userAgent,
        details: { path: req.originalUrl, method: req.method, error: err.message }
      }).catch(() => {});

      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token. Please sign in again.'
      });
    }

    // Verify admin existence in database
    const admin = await Admin.findById(decoded.id).select('-passwordHash -salt');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin account not found or has been revoked.'
      });
    }

    // Attach admin to request object
    req.admin = admin;
    req.token = token;
    next();
  } catch (err) {
    console.error('[AUTH MIDDLEWARE ERROR]', err);
    return res.status(500).json({
      success: false,
      message: 'Authentication verification failure.'
    });
  }
};

module.exports = {
  verifyAdmin,
  generateAuthToken,
  setAuthCookie,
  clearAuthCookie
};
