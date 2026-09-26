/**
 * Input Validation & Sanitization Middleware
 */

// Strip HTML tags / script injections from input strings
const stripTags = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>?/gm, '').trim();
};

const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validate Step 1 Send OTP inputs
 */
const validateSendOtp = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required.'
    });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Password is required.'
    });
  }

  // Sanitize email in place
  req.body.email = email.trim().toLowerCase();
  next();
};

/**
 * Validate Step 2 Verify OTP inputs
 */
const validateVerifyOtp = (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required.'
    });
  }

  if (!otp || typeof otp !== 'string' && typeof otp !== 'number') {
    return res.status(400).json({
      success: false,
      message: 'A 6-digit OTP code is required.'
    });
  }

  const cleanOtp = String(otp).trim();
  if (!/^\d{6}$/.test(cleanOtp)) {
    return res.status(400).json({
      success: false,
      message: 'OTP verification code must be exactly 6 digits.'
    });
  }

  req.body.email = email.trim().toLowerCase();
  req.body.otp = cleanOtp;
  next();
};

/**
 * Validate Company Creation Input
 */
const validateCompanyInput = (req, res, next) => {
  let { name, industry, location, website, description } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Enterprise name is required and must be at least 2 characters.'
    });
  }

  if (name.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Enterprise name cannot exceed 100 characters.'
    });
  }

  if (website && typeof website === 'string' && website.trim() !== '') {
    if (!isValidUrl(website.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid website URL format.'
      });
    }
  }

  // Clean strings
  req.body.name = stripTags(name);
  req.body.industry = industry ? stripTags(industry).slice(0, 100) : 'Multinational Enterprise';
  req.body.location = location ? stripTags(location).slice(0, 100) : 'Global';
  req.body.website = website ? stripTags(website).slice(0, 255) : '';
  req.body.description = description ? stripTags(description).slice(0, 1000) : '';

  next();
};

/**
 * Validate Candidate Creation Input
 */
const validateCandidateInput = (req, res, next) => {
  let { name, role, email, skills, bio } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Candidate name is required and must be at least 2 characters.'
    });
  }

  if (!role || typeof role !== 'string' || role.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Candidate role is required.'
    });
  }

  if (email && !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Candidate email must be a valid email address.'
    });
  }

  req.body.name = stripTags(name);
  req.body.role = stripTags(role);
  if (email) req.body.email = email.trim().toLowerCase();
  if (bio) req.body.bio = stripTags(bio).slice(0, 1000);
  if (Array.isArray(skills)) {
    req.body.skills = skills.map((s) => stripTags(String(s))).filter(Boolean).slice(0, 20);
  }

  next();
};

module.exports = {
  validateSendOtp,
  validateVerifyOtp,
  validateCompanyInput,
  validateCandidateInput,
  stripTags,
  isValidEmail,
  isValidUrl
};
