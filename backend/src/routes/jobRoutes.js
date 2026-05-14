const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/jobController');

const router = express.Router();

router.get('/', asyncHandler(ctrl.listJobs));
router.get('/mine', authenticate, requireRole('EMPLOYER', 'ADMIN'), asyncHandler(ctrl.listMyPostedJobs));
router.get('/:id', asyncHandler(ctrl.getJob));
router.post('/', authenticate, requireRole('EMPLOYER', 'ADMIN'), asyncHandler(ctrl.createJob));
router.put('/:id', authenticate, requireRole('EMPLOYER', 'ADMIN'), asyncHandler(ctrl.updateJob));
router.delete('/:id', authenticate, requireRole('EMPLOYER', 'ADMIN'), asyncHandler(ctrl.deleteJob));

module.exports = router;
