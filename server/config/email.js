const path = require('path');
const dotenv = require('dotenv');

// Ensure environment variables are loaded
dotenv.config({ path: path.join(__dirname, '../.env') });

const nodemailer = require('nodemailer');
const dns = require('dns');

// Prioritize IPv4 to avoid IPv6 resolution timeouts on Gmail SMTP
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

/**
 * Creates a fresh, high-reliability Nodemailer transporter.
 * Uses direct connections (no stale socket pooling) with strict timeouts and port fallback.
 */
function createTransporter(options = {}) {
  const user = process.env.GOOGLE_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USER;
  const rawPass = process.env.GOOGLE_APP_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const pass = rawPass ? rawPass.trim().replace(/\s+/g, '') : '';

  const host = options.host || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = options.port || parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = options.secure !== undefined ? options.secure : port === 465;

  if (user && pass) {
    return nodemailer.createTransport({
      host: host,
      port: port,
      secure: secure,
      pool: false, // DO NOT pool: prevents stale idle socket timeouts
      connectionTimeout: 12000, // 12s connection timeout
      greetingTimeout: 12000,
      socketTimeout: 15000,
      auth: {
        user: user.trim(),
        pass: pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  return null;
}

/**
 * Sends a 6-digit OTP code to the specified email.
 * Supports:
 * 1. HTTPS REST API (Resend) if RESEND_API_KEY is configured (ideal for Render/Railway where SMTP ports are blocked).
 * 2. Google Gmail SMTP via Port 465 (SSL) with automatic fallback to Port 587 (STARTTLS).
 * 3. Graceful fallback logging to server console so the admin is NEVER locked out by cloud firewall restrictions.
 */
async function sendOtpEmail({ toEmail, otp, expiresInMinutes = 10 }) {
  const user = process.env.GOOGLE_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USER;
  const fromEmail = user || 'no-reply@mncportal.com';

  // Always log the OTP to server logs so the admin can always view it in Render/Terminal
  console.log(`\n======================================================`);
  console.log(`🔑 [MNC ADMIN 2FA OTP DISPATCHED]`);
  console.log(`📧 Target Email: ${toEmail}`);
  console.log(`🔢 VERIFICATION CODE: ${otp}`);
  console.log(`⏱️  Expires In: ${expiresInMinutes} minutes`);
  console.log(`======================================================\n`);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>MNC Admin Authentication Code</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c192c; margin: 0; padding: 30px; color: #334155; }
        .email-container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.25); border: 1px solid #e2e8f0; }
        .email-header { background: #0c192c; padding: 32px 30px; text-align: center; border-bottom: 3px solid #c59b27; }
        .logo-badge { display: inline-block; width: 44px; height: 44px; line-height: 44px; background: linear-gradient(135deg, #c59b27, #8f6f14); color: #fff; font-size: 22px; font-weight: bold; border-radius: 10px; margin-bottom: 12px; }
        .email-header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
        .email-header p { color: #c59b27; margin: 5px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
        .email-body { padding: 36px 32px; background: #ffffff; }
        .welcome-text { font-size: 16px; color: #1e293b; line-height: 1.6; margin-bottom: 24px; }
        .otp-box { background: #fdf8eb; border: 2px dashed #c59b27; border-radius: 12px; padding: 22px; text-align: center; margin: 28px 0; }
        .otp-label { font-size: 12px; text-transform: uppercase; color: #8f6f14; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 8px; }
        .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #0c192c; font-family: 'Courier New', Courier, monospace; }
        .expiry-note { font-size: 13px; color: #64748b; margin-top: 10px; }
        .warning-box { background: #f8fafc; border-left: 4px solid #94a3b8; padding: 14px 18px; border-radius: 4px; font-size: 13px; color: #475569; line-height: 1.5; margin-top: 24px; }
        .email-footer { background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <div class="logo-badge">M</div>
          <h1>MNC Executive Admin Console</h1>
          <p>SMTP Two-Factor Authentication</p>
        </div>
        <div class="email-body">
          <p class="welcome-text">Hello Admin,</p>
          <p class="welcome-text">A request was made to authenticate into the <strong>MNC Admin Executive Console</strong>. Use the following one-time password (OTP) to complete your secure login:</p>
          
          <div class="otp-box">
            <div class="otp-label">Your Security Verification Code</div>
            <div class="otp-code">${otp}</div>
            <div class="expiry-note">Valid for <strong>${expiresInMinutes} minutes</strong>. Dispatched via Google SMTP Protocol.</div>
          </div>

          <div class="warning-box">
            <strong>Security Notice:</strong> If you did not initiate this login request, please disregard this email. Never share this code with anyone.
          </div>
        </div>
        <div class="email-footer">
          &copy; ${new Date().getFullYear()} MNC Executive Portal. All rights reserved. &bull; Automated Security Dispatcher
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"MNC Executive Admin" <${fromEmail}>`,
    to: toEmail,
    subject: `🔐 ${otp} - MNC Admin Console Verification Code`,
    text: `MNC Executive Admin Console - Two-Factor Authentication Code\n\nYour security OTP is: ${otp}\nValid for ${expiresInMinutes} minutes.\n\nIf you did not request this login, please ignore this email.`,
    html: htmlContent
  };

  // 1. Try HTTPS API delivery if RESEND_API_KEY is configured (never blocked by cloud firewalls)
  if (process.env.RESEND_API_KEY) {
    try {
      console.log('[Email Dispatch] Attempting delivery via Resend HTTPS API (Port 443)...');
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'MNC Admin <onboarding@resend.dev>',
          to: [toEmail],
          subject: mailOptions.subject,
          html: mailOptions.html
        })
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`[Email Dispatch] ✓ Delivered via Resend API! ID: ${data.id}`);
        return {
          success: true,
          messageId: data.id,
          deliveredVia: 'resend_https_api',
          toEmail
        };
      } else {
        const errText = await res.text();
        console.warn(`[Email Dispatch] Resend API returned ${res.status}: ${errText}`);
      }
    } catch (resendErr) {
      console.warn(`[Email Dispatch] Resend API error: ${resendErr.message}`);
    }
  }

  // 2. Attempt: Direct SSL on Port 465
  let primaryTransporter = createTransporter({ host: 'smtp.gmail.com', port: 465, secure: true });
  if (primaryTransporter) {
    try {
      console.log('[SMTP] Attempting delivery via smtp.gmail.com:465 (SSL)...');
      const info = await primaryTransporter.sendMail(mailOptions);
      console.log(`[SMTP] ✓ Delivered successfully via Port 465! MessageID: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
        deliveredVia: 'smtp:465',
        toEmail
      };
    } catch (err465) {
      console.warn(`[SMTP Warning] Port 465 attempt failed (${err465.message}). Retrying on Port 587 (STARTTLS)...`);
    }
  }

  // 3. Attempt: Alternative STARTTLS on Port 587
  let fallbackTransporter = createTransporter({ host: 'smtp.gmail.com', port: 587, secure: false });
  if (fallbackTransporter) {
    try {
      console.log('[SMTP] Attempting delivery via smtp.gmail.com:587 (STARTTLS)...');
      const info = await fallbackTransporter.sendMail(mailOptions);
      console.log(`[SMTP] ✓ Delivered successfully via Port 587! MessageID: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
        deliveredVia: 'smtp:587',
        toEmail
      };
    } catch (err587) {
      console.warn(`[SMTP Warning] Port 587 attempt failed (${err587.message}).`);
    }
  }

  // 4. Graceful Fallback: Cloud hosting (e.g. Render Free Tier) blocked outbound SMTP
  console.warn(`\n[SMTP NOTICE] Cloud hosting environment appears to block outbound SMTP ports (465/587).`);
  console.warn(`🔑 [ACTIONABLE] Use the verification code printed above to complete your login in the admin console.\n`);

  return {
    success: false,
    deliveredVia: 'server_logs',
    warning: 'Cloud host blocked outbound SMTP ports. OTP code is available in server console logs.',
    toEmail
  };
}

module.exports = {
  sendOtpEmail,
  createTransporter
};
