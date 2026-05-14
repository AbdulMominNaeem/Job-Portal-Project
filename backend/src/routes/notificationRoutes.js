const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

const router = express.Router();
router.use(authenticate);

router.get('/', asyncHandler(ctrl.list));
router.get('/unread-count', asyncHandler(ctrl.unreadCount));
router.post('/:id/read', asyncHandler(ctrl.markRead));
router.post('/read-all', asyncHandler(ctrl.markAllRead));

module.exports = router;
