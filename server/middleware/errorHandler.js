const AuditLog = require('../models/AuditLog');

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
};

/**
 * Centralized Enterprise Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode) || 500;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  // Security logging for internal errors
  console.error(`[ERROR] ${new Date().toISOString()} | ${req.method} ${req.originalUrl} | Status: ${statusCode}`);
  console.error(err.stack || err.message);

  if (statusCode >= 500) {
    AuditLog.record({
      action: 'SERVER_INTERNAL_ERROR',
      status: 'FAILURE',
      ip,
      userAgent: req.headers['user-agent'] || 'unknown',
      details: {
        path: req.originalUrl,
        method: req.method,
        errorMessage: err.message,
        statusCode
      }
    }).catch(() => {});
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error: ' + messages.join(', '),
      errors: messages
    });
  }

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid identifier format for field: ${err.path}`
    });
  }

  // Handle Mongoose Duplicate Key (Code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with that ${field} already exists.`
    });
  }

  // Handle JWT token errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed: ' + (err.name === 'TokenExpiredError' ? 'Session expired.' : 'Invalid token signature.')
    });
  }

  // Generic response (strip internal stack in production)
  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode === 500 
      ? 'An unexpected internal server error occurred. Please contact the security team.' 
      : err.message || 'Server error',
    ...(isProduction ? {} : { stack: err.stack })
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
