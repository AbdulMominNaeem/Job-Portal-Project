const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/applicationController');

const router = express.Router();

// Candidate
router.post(
  '/jobs/:jobId/apply',
  authenticate,
  requireRole('CANDIDATE'),
  asyncHandler(ctrl.applyToJob),
);
router.get(
  '/me',
  authenticate,
  requireRole('CANDIDATE'),
  asyncHandler(ctrl.listMyApplications),
);
router.post(
  '/:id/withdraw',
  authenticate,
  requireRole('CANDIDATE'),
  asyncHandler(ctrl.withdrawApplication),
);

// Employer
router.get(
  '/jobs/:jobId',
  authenticate,
  requireRole('EMPLOYER', 'ADMIN'),
  asyncHandler(ctrl.listJobApplicants),
);
router.patch(
  '/:id/status',
  authenticate,
  requireRole('EMPLOYER', 'ADMIN'),
  asyncHandler(ctrl.updateApplicationStatus),
);

module.exports = router;
