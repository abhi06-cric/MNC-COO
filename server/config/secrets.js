/**
 * Production Environment & Secrets Verification Module
 */

function validateEnvironmentSecrets() {
  const isProduction = process.env.NODE_ENV === 'production';
  const warnings = [];
  const errors = [];

  // 1. Database URI
  if (!process.env.MONGO_URI) {
    errors.push('MONGO_URI is missing. Server cannot function without database connection.');
  }

  // 2. JWT Secret
  if (!process.env.JWT_SECRET) {
    if (isProduction) {
      errors.push('JWT_SECRET is required in production environment.');
    } else {
      warnings.push('JWT_SECRET not defined in .env. Using fallback development secret.');
    }
  } else if (process.env.JWT_SECRET.length < 32 && isProduction) {
    warnings.push('JWT_SECRET length is under 32 characters. Consider using a 64+ character random string.');
  }

  // 3. SMTP / Email Credentials
  const emailUser = process.env.GOOGLE_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.GOOGLE_APP_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (!emailUser || !emailPass) {
    warnings.push('SMTP / Google App Password credentials not fully configured. Email OTP delivery will fall back to Ethereal/test mode.');
  }

  // Log warnings and errors
  if (warnings.length > 0) {
    console.warn('\n⚠️ [SECURITY CONFIGURATION NOTICES]');
    warnings.forEach((w) => console.warn(`   • ${w}`));
    console.warn('');
  }

  if (errors.length > 0) {
    console.error('\n❌ [CRITICAL ENVIRONMENT SECRETS MISSING]');
    errors.forEach((e) => console.error(`   • ${e}`));
    console.error('');
    if (isProduction) {
      process.exit(1);
    }
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors
  };
}

module.exports = {
  validateEnvironmentSecrets
};
