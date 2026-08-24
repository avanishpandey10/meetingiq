import express from 'express';

import {
  actionItemController
} from '../controllers/actionItemController.js';

const router = express.Router();

/**
 * Action Item Routes
 */

// Get action item statistics
router.get(
  '/stats',
  actionItemController.getActionItemStats
);

// Get all action items
router.get(
  '/',
  actionItemController.getActionItems
);

// Get single action item
router.get(
  '/:id',
  actionItemController.getActionItem
);

// Update action item
router.patch(
  '/:id',
  actionItemController.updateActionItem
);

export default router;