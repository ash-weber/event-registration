const rateLimit = require('express-rate-limit');

const windowMs = (Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000;

const apiLimiter = rateLimit({
  windowMs,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const registerLimiter = rateLimit({
  windowMs,
  max: Number(process.env.REGISTER_RATE_LIMIT_MAX) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many registration attempts from this device. Please try again later.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in a while.' },
});

module.exports = { apiLimiter, registerLimiter, loginLimiter };