const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const ctrl = require('../controllers/skillController');

const router = express.Router();

router.get('/skills', asyncHandler(ctrl.listSkills));
router.get('/companies', asyncHandler(ctrl.listCompanies));
router.get('/companies/:id', asyncHandler(ctrl.getCompany));

module.exports = router;
