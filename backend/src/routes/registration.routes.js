const express = require('express');
const router = express.Router();

const { registerVisitor, getRegistrationById } = require('../controllers/registration.controller');
const { registrationRules } = require('../middleware/validators');
const { registerLimiter } = require('../middleware/rateLimiter');

router.post('/', registerLimiter, registrationRules, registerVisitor);
router.get('/:registrationId', getRegistrationById);

module.exports = router;