const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new candidate or employer
 */
router.post('/register', asyncHandler(ctrl.register));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 */
router.post('/login', asyncHandler(ctrl.login));

router.get('/me', authenticate, asyncHandler(ctrl.me));
router.post('/change-password', authenticate, asyncHandler(ctrl.changePassword));

module.exports = router;
