import express from 'express';

import {
  exportController
} from '../controllers/exportController.js';

const router = express.Router();

/**
 * Export Routes
 */

// Export meeting report
router.get(
  '/meetings/:id/export',
  exportController.exportMeeting
);

export default router;