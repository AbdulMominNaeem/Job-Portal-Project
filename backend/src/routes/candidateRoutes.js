const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const { uploaders } = require('../middleware/upload');
const ctrl = require('../controllers/candidateController');

const router = express.Router();

router.use(authenticate, requireRole('CANDIDATE', 'ADMIN'));

router.get('/me', asyncHandler(ctrl.getMyProfile));
router.put('/me', asyncHandler(ctrl.updateMyProfile));

router.post('/me/resume', uploaders.resume.single('file'), asyncHandler(ctrl.uploadResume));
router.post('/me/avatar', uploaders.avatar.single('file'), asyncHandler(ctrl.uploadAvatar));

router.put('/me/skills', asyncHandler(ctrl.setSkills));

router.post('/me/education', asyncHandler(ctrl.addEducation));
router.delete('/me/education/:id', asyncHandler(ctrl.deleteEducation));

router.post('/me/experience', asyncHandler(ctrl.addExperience));
router.delete('/me/experience/:id', asyncHandler(ctrl.deleteExperience));

router.post('/me/certifications', asyncHandler(ctrl.addCertification));
router.delete('/me/certifications/:id', asyncHandler(ctrl.deleteCertification));

router.post('/me/saved-jobs/:jobId', asyncHandler(ctrl.saveJob));
router.delete('/me/saved-jobs/:jobId', asyncHandler(ctrl.unsaveJob));
router.get('/me/saved-jobs', asyncHandler(ctrl.listSavedJobs));

module.exports = router;
