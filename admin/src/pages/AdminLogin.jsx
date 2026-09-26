import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Form states
  const [step, setStep] = useState(1); // 1 = Email & Password, 2 = OTP Verification
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP segmented inputs (6 digits)
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  // UI status states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [previewCode, setPreviewCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds

  // Password validation checks
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  // Specifically supports special characters such as @, #, $, & and other common symbols
  const hasSpecialChar = /[@#$&!%*?~^_\-+=\[\]{}|:;\"'<>,./\\]/.test(password);
  const hasMinLength = password.length >= 8;
  const isPasswordValid = hasUpperCase && hasLowerCase && hasSpecialChar && hasMinLength;

  // Timer countdown effect for OTP expiration
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Resend cooldown timer effect
  useEffect(() => {
    let resendTimer;
    if (resendCooldown > 0) {
      resendTimer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(resendTimer);
  }, [resendCooldown]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Step 1: Send OTP
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid administrator email address.");
      return;
    }

    if (!isPasswordValid) {
      setErrorMsg("Password does not meet all the required security criteria.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to initiate login request.");
      }

      setStep(2);
      if (data.previewOtp) {
        setPreviewCode(data.previewOtp);
      }
      setCountdown(data.expiresInMinutes ? data.expiresInMinutes * 60 : 600);
      setResendCooldown(30);
      setSuccessMsg(data.message || "A 6-digit verification code has been dispatched to your email.");

      // Auto-focus the first OTP input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      console.error("Credentials error:", err);
      if (err.message.includes("Failed to fetch") || err.name === "TypeError") {
        setErrorMsg(`Backend server is currently offline or unreachable at ${API_BASE_URL}.`);
      } else {
        setErrorMsg(err.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle segmented OTP input changes
  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9]/g, "");

    // Handle full paste into a single box
    if (cleanVal.length > 1) {
      const digits = cleanVal.slice(0, 6).split("");
      const newOtp = [...otpDigits];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtpDigits(newOtp);
      const focusIndex = Math.min(digits.length, 5);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    const newOtp = [...otpDigits];
    newOtp[index] = cleanVal ? cleanVal[0] : "";
    setOtpDigits(newOtp);

    // Auto-advance to next input if filled
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleAutoFill = (code) => {
    if (!code) return;
    const digits = String(code).trim().split("").slice(0, 6);
    setOtpDigits(digits);
    setTimeout(() => {
      inputRefs.current[5]?.focus();
    }, 50);
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), otp: fullOtp })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify OTP.");
      }

      // Save auth session in context
      login({
        token: data.token,
        email: data.admin.email,
        name: data.admin.name,
        role: data.admin.role
      });

      // Redirect to origin or dashboard
      const origin = location.state?.from?.pathname || "/";
      navigate(origin, { replace: true });
    } catch (err) {
      console.error("OTP verification error:", err);
      setErrorMsg(err.message || "Verification failed. Please check the code.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend code.");
      }

      if (data.previewOtp) {
        setPreviewCode(data.previewOtp);
      }
      setSuccessMsg(data.message || "A fresh verification code was sent to your email.");
      setResendCooldown(45);
      setCountdown(600);
      setOtpDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setErrorMsg(err.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-glow-1"></div>
      <div className="admin-login-glow-2"></div>

      <div className="admin-login-card">
        {/* Brand Header */}
        <div className="login-header">
          <div className="login-brand-icon">M</div>
          <h2>MNC Executive Console</h2>
          <p className="login-subtext">Two-Factor Authentication</p>
        </div>

        {/* Progress indicator */}
        <div className="login-steps-bar">
          <div className={`step-item ${step === 1 ? "active" : "completed"}`}>
            <span className="step-num">{step > 1 ? "✓" : "1"}</span>
            <span className="step-title">Credentials</span>
          </div>
          <div className="step-line"></div>
          <div className={`step-item ${step === 2 ? "active" : ""}`}>
            <span className="step-num">2</span>
            <span className="step-title">Verification Code</span>
          </div>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="login-alert login-alert-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="login-alert login-alert-success">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Email & Password Form */}
        {step === 1 && (
          <form onSubmit={handleCredentialsSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="adminEmail">
                Admin Email Address <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  id="adminEmail"
                  type="email"
                  placeholder="admin@mnc.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="adminPassword">
                Master Password <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  id="adminPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Password Security Rules Interactive Checklist */}
            <div className="password-criteria-card">
              <div className="criteria-header">
                <span>Password Requirements</span>
                <span className={`criteria-status ${isPasswordValid ? "valid" : ""}`}>
                  {isPasswordValid ? "Criteria Met" : "Requirements Pending"}
                </span>
              </div>
              <ul className="criteria-list">
                <li className={hasUpperCase ? "met" : ""}>
                  <span className="bullet-icon">{hasUpperCase ? "✓" : "○"}</span>
                  <span>At least one <strong>uppercase letter</strong> (A-Z)</span>
                </li>
                <li className={hasLowerCase ? "met" : ""}>
                  <span className="bullet-icon">{hasLowerCase ? "✓" : "○"}</span>
                  <span>At least one <strong>lowercase letter</strong> (a-z)</span>
                </li>
                <li className={hasSpecialChar ? "met" : ""}>
                  <span className="bullet-icon">{hasSpecialChar ? "✓" : "○"}</span>
                  <span>At least one <strong>special character</strong> (@, #, $, &amp;)</span>
                </li>
                <li className={hasMinLength ? "met" : ""}>
                  <span className="bullet-icon">{hasMinLength ? "✓" : "○"}</span>
                  <span>At least <strong>8 characters</strong></span>
                </li>
              </ul>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading || !email || !isPasswordValid}
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  <span>Dispatching OTP...</span>
                </>
              ) : (
                <>
                  <span>Continue with OTP</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>

            <div className="login-security-notice">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>Protected by End-to-End Two-Factor Authentication</span>
            </div>
          </form>
        )}

        {/* STEP 2: OTP Verification Form */}
        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="login-form">
            <div className="otp-instructions">
              <div className="smtp-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>Two-Factor Security Code</span>
              </div>
              <p>
                We have generated a 6-digit one-time passcode and sent it to:
              </p>
              <div className="target-email-display">
                <strong>{email}</strong>
                <button
                  type="button"
                  className="change-email-link"
                  onClick={() => {
                    setStep(1);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                >
                  Change
                </button>
              </div>
            </div>

            {/* Instant Verification Code Card with 1-Click Auto-fill */}
            {previewCode && (
              <div style={{
                background: "#f0fdf4",
                border: "1px solid #86efac",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                color: "#166534"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontWeight: 600, fontSize: "13px" }}>🔑 Verification Code:</span>
                  <span style={{
                    fontSize: "20px",
                    fontWeight: "800",
                    letterSpacing: "4px",
                    fontFamily: "monospace",
                    background: "#dcfce7",
                    padding: "3px 10px",
                    borderRadius: "6px",
                    color: "#14532d"
                  }}>
                    {previewCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAutoFill(previewCode)}
                  style={{
                    background: "#16a34a",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "7px 14px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(22,163,74,0.2)"
                  }}
                >
                  Auto-fill
                </button>
              </div>
            )}

            {/* Segmented 6-digit OTP Inputs */}
            <div className="otp-inputs-grid">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  className={`otp-digit-box ${digit ? "filled" : ""}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {/* Expiration Timer & Resend Controls */}
            <div className="otp-timer-row">
              <div className="timer-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Code expires in: <strong>{formatTime(countdown)}</strong></span>
              </div>

              <button
                type="button"
                className="resend-otp-btn"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || loading}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
              </button>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading || otpDigits.join("").length !== 6 || countdown === 0}
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify OTP &amp; Access Console</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </>
              )}
            </button>

            <button
              type="button"
              className="back-step-btn"
              onClick={() => {
                setStep(1);
                setErrorMsg("");
                setSuccessMsg("");
              }}
            >
              ← Back to credentials entry
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
