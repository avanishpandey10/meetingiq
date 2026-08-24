import express from 'express';

import {
  analyticsController
} from '../controllers/analyticsController.js';

const router = express.Router();

/**
 * Analytics Routes
 */

// Get platform-wide analytics
router.get(
  '/',
  analyticsController.getPlatformAnalytics
);

// Get analytics for a specific meeting
router.get(
  '/meetings/:id',
  analyticsController.getMeetingAnalytics
);

export default router;