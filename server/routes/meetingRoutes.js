import express from 'express';

import {
  meetingController
} from '../controllers/meetingController.js';

import {
  upload,
  handleUploadError
} from '../middleware/upload.js';

const router = express.Router();

/**
 * Meeting Routes
 */

// Upload meeting audio
router.post(
  '/upload',
  upload.single('audio'),
  handleUploadError,
  meetingController.uploadMeeting
);

// Get all meetings
router.get(
  '/',
  meetingController.getMeetings
);

// Get meeting by ID
router.get(
  '/:id',
  meetingController.getMeeting
);

// Get meeting analysis
router.get(
  '/:id/analysis',
  meetingController.getAnalysis
);

// Get meeting transcript
router.get(
  '/:id/transcript',
  meetingController.getTranscript
);

// Get meeting processing status
router.get(
  '/:id/status',
  meetingController.getProcessingStatus
);

// Delete meeting
router.delete(
  '/:id',
  meetingController.deleteMeeting
);

export default router;