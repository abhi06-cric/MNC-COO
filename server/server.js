const path = require('path');
const dotenv = require('dotenv');

// Load environment configuration from .env
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// Internal Configurations and Modules
const connectDB = require('./config/db');
const { validateEnvironmentSecrets } = require('./config/secrets');
const { configureHelmet, configureCors, requireHttps, sanitizeInputs } = require('./middleware/security');
const { globalLimiter } = require('./middleware/rateLimiter');
const { csrfProtection } = require('./middleware/csrf');
const { auditLoggerMiddleware } = require('./middleware/auditLogger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Route Handlers
const companyRoutes = require('./routes/companyRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');

// Verify environment secrets and configuration before bootstrap
validateEnvironmentSecrets();

// Initialize MongoDB Connection
connectDB();

const app = express();

// Trust reverse proxies (needed for secure cookies, rate limiting, and client IP detection on Render/Heroku/AWS/Nginx)
app.set('trust proxy', 1);

// Phase 6 Production: Enforce HTTPS in production environments
app.use(requireHttps);

// Security Layer: Helmet (CSP, HSTS, X-Frame-Options, NoSniff)
app.use(configureHelmet());

// Security Layer: Whitelisted CORS with credentials support
app.use(configureCors());

// Security Layer: Cookie Parser for HttpOnly authentication cookies
app.use(cookieParser(process.env.COOKIE_SECRET || 'mnc_secure_cookie_vault_key_92834'));

// Input Validation: JSON payload limiting to prevent DoS attacks
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Security Layer: NoSQL Injection Sanitization
app.use(sanitizeInputs);

// Security Layer: Global Rate Limiting across all API routes
app.use('/api', globalLimiter);

// Security Layer: CSRF protection on state-changing operations
app.use(csrfProtection);

// Security Layer: Audit and Security Event Logger Attachment
app.use(auditLoggerMiddleware);

// Production Health & Observability Check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
  res.status(200).json({
    status: 'HEALTHY',
    service: 'MNC Corporate Portal API',
    environment: process.env.NODE_ENV || 'development',
    uptime: `${Math.floor(process.uptime())}s`,
    database: {
      status: dbStatus,
      host: mongoose.connection.host || 'unknown'
    },
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
    },
    timestamp: new Date().toISOString()
  });
});

// Root API Information Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MNC Corporate Portal Enterprise API is running',
    version: '2.0.0',
    security: 'Helmet, CORS, Rate-Limiting, HttpOnly Cookies, CSRF, Audit Logs Active',
    healthCheck: '/api/health'
  });
});

// Mount Application Routes
app.use('/api/companies', companyRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/admin', adminAuthRoutes);

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Centralized Enterprise Error Handler
app.use(errorHandler);

// Safely parse and sanitize PORT to prevent invalid strings or socket paths
const parsePort = (val, fallback = 5001) => {
  if (!val) return fallback;
  const num = Number(val);
  if (Number.isInteger(num) && num > 0 && num <= 65535) {
    return num;
  }
  console.warn(`[PORT CONFIG WARNING] Invalid PORT environment variable value "${val}". Falling back to default port ${fallback}.`);
  return fallback;
};

const PORT = parsePort(process.env.PORT, 5001);

// Start Server binding to 0.0.0.0 for containerized environments
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🛡️  MNC PORTAL ENTERPRISE API SERVER STARTED`);
  console.log(`🌐  URL: http://0.0.0.0:${PORT}`);
  console.log(`⚙️   ENVIRONMENT: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒  SECURITY: Helmet + CORS + RateLimit + HttpOnly Cookies + CSRF + Audit`);
  console.log(`======================================================\n`);
});

// Graceful process termination handling
const handleTermination = (signal) => {
  console.log(`\n[SHUTDOWN] Received ${signal}. Gracefully closing HTTP server...`);
  server.close(async () => {
    console.log('[SHUTDOWN] HTTP server closed.');
    try {
      await mongoose.connection.close(false);
      console.log('[SHUTDOWN] MongoDB connection closed.');
    } catch (err) {
      console.error('[SHUTDOWN ERROR] MongoDB close failure:', err.message);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleTermination('SIGTERM'));
process.on('SIGINT', () => handleTermination('SIGINT'));

module.exports = app;