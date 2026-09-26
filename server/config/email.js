const nodemailer = require('nodemailer');
const dns = require('dns');

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

let transporter = null;
let etherealAccount = null;

/**
 * Initializes and returns the Nodemailer SMTP transporter.
 * Supports environment variables:
 * - SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM
 * Falls back to an automatic Ethereal SMTP test account or local SMTP simulation.
 */
async function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const user = process.env.GOOGLE_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USER;
  const rawPass = process.env.GOOGLE_APP_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const pass = rawPass ? rawPass.trim().replace(/\s+/g, '') : '';
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  // 1. If Google credentials or SMTP credentials are provided in .env
  if (user && pass) {
    const isGmail = (user && user.toLowerCase().includes('@gmail.com')) || 
                    !!process.env.GOOGLE_APP_PASSWORD || 
                    (host && host.includes('gmail.com'));

    if (isGmail) {
      console.log(`[Google Auth] Initializing Google SMTP with Gmail service for: ${user}`);
      transporter = nodemailer.createTransport({
        service: 'gmail',
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: {
          user: user.trim(),
          pass: pass
        }
      });
    } else {
      console.log(`[SMTP] Initializing SMTP transporter with host: ${host || 'smtp.gmail.com'}:${port}`);
      transporter = nodemailer.createTransport({
        host: host || 'smtp.gmail.com',
        port: port,
        secure: secure,
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: {
          user: user.trim(),
          pass: pass
        },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
      });
    }

    try {
      await transporter.verify();
      console.log('[Email Auth] Transporter verified and connected successfully.');
      return transporter;
    } catch (err) {
      console.warn(`[Email Auth] Verification note: ${err.message}. Will attempt delivery upon request.`);
      return transporter;
    }
  }

  // 2. Fallback to Ethereal SMTP test account for development/testing
  try {
    console.log('[SMTP] No production SMTP configured. Creating Ethereal SMTP test account...');
    etherealAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: etherealAccount.smtp.host,
      port: etherealAccount.smtp.port,
      secure: etherealAccount.smtp.secure,
      auth: {
        user: etherealAccount.user,
        pass: etherealAccount.pass
      }
    });
    console.log(`[SMTP] Ethereal SMTP test account active: ${etherealAccount.user}`);
    return transporter;
  } catch (etherealErr) {
    console.warn(`[SMTP] Ethereal creation failed (${etherealErr.message}). Creating jsonTransport fallback.`);
    // 3. Fallback transporter that logs message to console
    transporter = nodemailer.createTransport({
      jsonTransport: true
    });
    return transporter;
  }
}

/**
 * Sends a 6-digit OTP code to the specified email using the SMTP protocol.
 * @param {Object} options
 * @param {string} options.toEmail
 * @param {string} options.otp
 * @param {number} options.expiresInMinutes
 */
async function sendOtpEmail({ toEmail, otp, expiresInMinutes = 10 }) {
  const mailTransporter = await getTransporter();
  const user = process.env.GOOGLE_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USER;
  const fromEmail = user || process.env.SMTP_FROM || (etherealAccount ? etherealAccount.user : 'no-reply@mncportal.com');

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
            <div class="expiry-note">Valid for <strong>${expiresInMinutes} minutes</strong>. Dispatched via SMTP Protocol.</div>
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

  const textContent = `MNC Executive Admin Console - Two-Factor Authentication Code\n\nYour security OTP is: ${otp}\nThis code is valid for ${expiresInMinutes} minutes.\n\nIf you did not request this login, please ignore this email.`;

  const mailOptions = {
    from: `"MNC Executive Admin" <${fromEmail}>`,
    to: toEmail,
    subject: `🔐 ${otp} - MNC Admin Console Verification Code`,
    text: textContent,
    html: htmlContent
  };

  const info = await mailTransporter.sendMail(mailOptions);
  console.log(`[SMTP] OTP email dispatched to ${toEmail}. MessageID: ${info.messageId}`);

  let previewUrl = null;
  if (etherealAccount && typeof nodemailer.getTestMessageUrl === 'function') {
    previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[SMTP] Ethereal preview link: ${previewUrl}`);
    }
  }

  return {
    messageId: info.messageId,
    previewUrl: previewUrl,
    toEmail: toEmail
  };
}

module.exports = {
  sendOtpEmail,
  getTransporter
};
