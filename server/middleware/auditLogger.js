const AuditLog = require('../models/AuditLog');

/**
 * Structured Security & Audit Logger
 */
const logSecurityEvent = async (req, { action, status = 'SUCCESS', details = {}, actor = null }) => {
  const ip = req?.ip || req?.connection?.remoteAddress || '127.0.0.1';
  const userAgent = req?.headers ? req.headers['user-agent'] : 'system';

  const actorData = actor || {
    email: req?.admin?.email || req?.body?.email || 'anonymous',
    id: req?.admin?._id || null,
    role: req?.admin?.role || 'guest'
  };

  const timestamp = new Date().toISOString();
  console.log(`[SECURITY AUDIT] ${timestamp} | ${status} | ${action} | ${actorData.email} | IP: ${ip}`);

  try {
    return await AuditLog.record({
      action,
      status,
      actor: actorData,
      ip,
      userAgent,
      details
    });
  } catch (err) {
    console.error('[SECURITY AUDIT FAILURE] Could not persist audit entry:', err.message);
    return null;
  }
};

/**
 * Middleware that attaches logger to request object
 */
const auditLoggerMiddleware = (req, res, next) => {
  req.logSecurityEvent = (opts) => logSecurityEvent(req, opts);
  next();
};

module.exports = {
  logSecurityEvent,
  auditLoggerMiddleware
};
