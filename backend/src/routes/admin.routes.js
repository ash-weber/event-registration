const express = require('express');
const router = express.Router();

const {
  loginAdmin,
  getProfile,
  listVisitors,
  getVisitorDetail,
  exportVisitors,
  downloadImportTemplate,
  importVisitors,
  checkInVisitor,
} = require('../controllers/admin.controller');

const {
  getDashboardStats,
  getRegistrationsOverTime,
  getRecentRegistrations,
} = require('../controllers/dashboard.controller');

const { protectAdmin } = require('../middleware/auth');
const { adminLoginRules, visitorQueryRules } = require('../middleware/validators');
const { loginLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');

router.post('/login', loginLimiter, adminLoginRules, loginAdmin);

router.get('/me', protectAdmin, getProfile);
router.get('/visitors', protectAdmin, visitorQueryRules, listVisitors);

router.get('/visitors/export', protectAdmin, exportVisitors);
router.get('/visitors/import/template', protectAdmin, downloadImportTemplate);
router.post('/visitors/import', protectAdmin, upload.single('file'), importVisitors);

router.get('/visitors/:id', protectAdmin, getVisitorDetail);
router.post('/checkin', protectAdmin, checkInVisitor);

router.get('/dashboard/stats', protectAdmin, getDashboardStats);
router.get('/dashboard/registrations-over-time', protectAdmin, getRegistrationsOverTime);
router.get('/dashboard/recent', protectAdmin, getRecentRegistrations);

module.exports = router;