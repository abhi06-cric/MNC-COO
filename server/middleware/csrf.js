const AuditLog = require('../models/AuditLog');

/**
 * CSRF Protection Middleware
 * Verifies Origin / Referer headers on mutating requests when cookies are active.
 */
const csrfProtection = (req, res, next) => {
  // Safe HTTP methods do not alter server state
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // If request uses cookie authentication, verify origin to prevent cross-site request forgery
  const hasAuthCookie = req.cookies && req.cookies.admin_token;
  if (!hasAuthCookie) {
    // If not using cookies (e.g. Bearer token in header), CSRF is naturally mitigated by browser SOP
    return next();
  }

  const origin = req.headers['origin'] || req.headers['referer'];
  const envOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
    ...envOrigins
  ].filter(Boolean);

  if (!origin) {
    // Missing origin on cookie-based mutation request
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    console.warn(`[SECURITY CSRF] Blocked request without Origin/Referer on ${req.method} ${req.originalUrl}`);

    AuditLog.record({
      action: 'CSRF_BLOCKED_NO_ORIGIN',
      status: 'BLOCKED',
      ip,
      userAgent: req.headers['user-agent'] || 'unknown',
      details: { path: req.originalUrl, method: req.method }
    }).catch(() => {});

    return res.status(403).json({
      success: false,
      message: 'CSRF security violation: Origin or Referer header required for state-changing operations.'
    });
  }

  const isOriginAllowed = allowedOrigins.some((allowed) => {
    return origin.startsWith(allowed) || origin.startsWith(allowed.replace(/\/$/, ''));
  });

  if (!isOriginAllowed) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    console.warn(`[SECURITY CSRF] Disallowed Origin/Referer '${origin}' for ${req.method} ${req.originalUrl}`);

    AuditLog.record({
      action: 'CSRF_BLOCKED_UNAUTHORIZED_ORIGIN',
      status: 'BLOCKED',
      ip,
      userAgent: req.headers['user-agent'] || 'unknown',
      details: { path: req.originalUrl, method: req.method, origin }
    }).catch(() => {});

    return res.status(403).json({
      success: false,
      message: 'CSRF verification failed: Cross-site request from untrusted origin blocked.'
    });
  }

  next();
};

module.exports = {
  csrfProtection
};
