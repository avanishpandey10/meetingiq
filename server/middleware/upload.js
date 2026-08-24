import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// env.MAX_FILE_SIZE is already in bytes (e.g., 50 * 1024 * 1024)
const maxFileSizeBytes = env.MAX_FILE_SIZE;
const maxFileSizeMb = maxFileSizeBytes / (1024 * 1024);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `meeting-${uniqueSuffix}${ext}`);
  }
});

const defaultAudioFormats = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/ogg',
  'audio/webm',
  'audio/flac',
  'audio/aiff'
];

const allowedMimeTypes = Array.isArray(env.ALLOWED_AUDIO_FORMATS) && env.ALLOWED_AUDIO_FORMATS.length > 0
  ? env.ALLOWED_AUDIO_FORMATS
  : defaultAudioFormats;

const fileFilter = (_req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }
  return cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: ${allowedMimeTypes.join(', ')}`), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSizeBytes
  }
});

export const handleUploadError = (error, req, res, next) => {
  if (!error) {
    return next();
  }

  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File Too Large',
      message: `Maximum file size is ${maxFileSizeMb}MB.`
    });
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      error: 'Upload Error',
      message: error.message
    });
  }

  return res.status(400).json({
    error: 'Upload Failed',
    message: error.message || 'The uploaded file is not supported.'
  });
};