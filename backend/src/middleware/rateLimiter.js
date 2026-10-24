const rateLimit = require('express-rate-limit');

// Rate limiting for owner authentication: 5 attempts per 15 minutes
const ownerLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many owner login attempts from this IP. Please wait 15 minutes before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for customer authentication: 15 attempts per 15 minutes
const customerAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many login/signup attempts. Please wait 15 minutes before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// General API rate limiter
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  ownerLoginLimiter,
  customerAuthLimiter,
  generalApiLimiter
};
