import express from 'express';

import {
  askController
} from '../controllers/askController.js';

const router = express.Router();

/**
 * Ask Meeting Routes
 */

// Get suggested questions for a meeting
router.get(
  '/meetings/:id/suggestions',
  askController.getSuggestedQuestions
);

// Ask a question about a meeting
router.post(
  '/meetings/:id/ask',
  askController.askQuestion
);

export default router;