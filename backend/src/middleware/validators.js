const { body, query, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    throw new ApiError(422, 'Validation failed', formatted);
  }
  next();
}

const registrationRules = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 120 }).withMessage('Full name must be 2-120 characters')
    .matches(/^[a-zA-Z\s.'-]+$/).withMessage('Full name contains invalid characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail()
    .isLength({ max: 160 }),

  body('mobileNumber')
    .trim()
    .notEmpty().withMessage('Mobile number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit mobile number'),

  body('company')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 160 }).withMessage('Company name is too long'),

  body('designation')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 120 }).withMessage('Designation is too long'),

  body('city')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('City is too long'),

  body('numberOfAttendees')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 50 }).withMessage('Number of attendees must be between 1 and 50')
    .toInt(),

  handleValidation,
];

const adminLoginRules = [
  body('email').trim().notEmpty().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const visitorQueryRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().trim().isLength({ max: 160 }),
  handleValidation,
];

module.exports = { registrationRules, adminLoginRules, visitorQueryRules, handleValidation };