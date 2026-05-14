const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

const router = express.Router();
router.use(authenticate, requireRole('ADMIN'));

router.get('/stats', asyncHandler(ctrl.stats));

router.get('/users', asyncHandler(ctrl.listUsers));
router.patch('/users/:id/active', asyncHandler(ctrl.setUserActive));
router.delete('/users/:id', asyncHandler(ctrl.softDeleteUser));

router.get('/jobs', asyncHandler(ctrl.listAllJobs));
router.post('/jobs/:id/moderate', asyncHandler(ctrl.moderateJob));

module.exports = router;
