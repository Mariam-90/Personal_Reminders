const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { maxUploadBytes } = require('../config');
const { httpError } = require('../lib/errors');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const audioOnly = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('audio/')) return cb(null, true);
  return cb(httpError(400, 'audioOnly'));
};

const EXTENSIONS = {
  'audio/webm': '.webm',
  'audio/ogg': '.ogg',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/mpeg': '.mp3',
  'audio/mp4': '.m4a',
};

// Recordings go to disk with an unguessable name, since /uploads is served statically.
const diskUpload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const ext = EXTENSIONS[file.mimetype.split(';')[0]] || '.webm';
      cb(null, `${crypto.randomBytes(16).toString('hex')}${ext}`);
    },
  }),
  limits: { fileSize: maxUploadBytes },
  fileFilter: audioOnly,
});

// Custom reminder sounds are stored on the user document.
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxUploadBytes },
  fileFilter: audioOnly,
});

function removeUpload(fileName) {
  if (!fileName) return;
  const filePath = path.join(uploadDir, path.basename(fileName));
  fs.promises.unlink(filePath).catch(() => {});
}

module.exports = { uploadDir, diskUpload, memoryUpload, removeUpload };
