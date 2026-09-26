const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

/**
 * Configure Helmet with secure HTTP headers
 */
const configureHelmet = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "http://localhost:5001", "http://localhost:5173", "http://localhost:5174", "https:"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" }, // Anti-clickjacking
    hidePoweredBy: true, // Conceal express technology footprint
    hsts: {
      maxAge: 31536000, // 1 year HSTS
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true, // X-Content-Type-Options: nosniff
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  });
};

/**
 * Strict Origin-Restricted CORS with Credentials
 */
const configureCors = () => {
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

  return cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. server-to-server, curl, Postman, health check)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((allowed) => {
        return allowed === origin || allowed === origin.replace(/\/$/, '');
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`[SECURITY CORS BLOCKED] Origin ${origin} is not allowed by CORS policy.`);
        callback(new Error(`CORS policy violation: Origin '${origin}' is not permitted.`));
      }
    },
    credentials: true, // Allows secure HttpOnly cookies across origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-csrf-token',
      'X-Requested-With',
      'Accept'
    ],
    exposedHeaders: ['set-cookie', 'x-csrf-token'],
    maxAge: 86400 // Cache preflight requests for 24h
  });
};

/**
 * Production HTTPS Redirection Middleware
 */
const requireHttps = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // Exclude internal health checks, root probe, and loopback calls from HTTPS redirect
    if (
      req.path === '/api/health' ||
      req.path === '/' ||
      req.hostname === 'localhost' ||
      req.hostname === '127.0.0.1' ||
      req.hostname === '0.0.0.0'
    ) {
      return next();
    }
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    if (!isHttps) {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
  }
  next();
};

/**
 * NoSQL Injection Sanitizer
 */
const sanitizeInputs = mongoSanitize({
  replaceWith: '_'
});

module.exports = {
  configureHelmet,
  configureCors,
  requireHttps,
  sanitizeInputs
};
