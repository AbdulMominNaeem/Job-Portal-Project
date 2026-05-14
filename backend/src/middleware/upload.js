const path = require('path');
const fs = require('fs');
const multer = require('multer');
const env = require('../config/env');
const { badRequest } = require('../utils/httpError');

const uploadRoot = path.resolve(env.UPLOAD_DIR);
if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true });

const subdirs = ['resumes', 'avatars', 'logos'];
subdirs.forEach((d) => {
  const dir = path.join(uploadRoot, d);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const buildStorage = (subdir) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(uploadRoot, subdir)),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
      cb(null, safe);
    },
  });

const imageFilter = (_req, file, cb) => {
  if (/^image\/(png|jpe?g|gif|webp|svg\+xml)$/.test(file.mimetype)) cb(null, true);
  else cb(badRequest('Only image uploads are allowed'));
};

const resumeFilter = (_req, file, cb) => {
  const ok = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ].includes(file.mimetype);
  if (ok) cb(null, true);
  else cb(badRequest('Resume must be PDF or DOC/DOCX'));
};

const limits = { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 };

const uploaders = {
  resume: multer({ storage: buildStorage('resumes'), fileFilter: resumeFilter, limits }),
  avatar: multer({ storage: buildStorage('avatars'), fileFilter: imageFilter, limits }),
  logo: multer({ storage: buildStorage('logos'), fileFilter: imageFilter, limits }),
};

const fileToUrl = (req, file, subdir) => {
  if (!file) return null;
  return `${req.protocol}://${req.get('host')}/uploads/${subdir}/${file.filename}`;
};

module.exports = { uploaders, fileToUrl, uploadRoot };
