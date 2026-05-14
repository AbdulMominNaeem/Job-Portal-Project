const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const { uploaders } = require('../middleware/upload');
const ctrl = require('../controllers/employerController');

const router = express.Router();

router.use(authenticate, requireRole('EMPLOYER', 'ADMIN'));

router.get('/me', asyncHandler(ctrl.getMe));
router.put('/me', asyncHandler(ctrl.updateMe));

router.post('/me/company', asyncHandler(ctrl.createOrUpdateCompany));
router.put('/me/company', asyncHandler(ctrl.createOrUpdateCompany));
router.post('/me/company/logo', uploaders.logo.single('file'), asyncHandler(ctrl.uploadCompanyLogo));

router.get('/me/stats', asyncHandler(ctrl.getDashboardStats));

module.exports = router;
