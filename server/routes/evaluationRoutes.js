import express from 'express';
import { evaluationController } from '../controllers/evaluationController.js';

const router = express.Router();

// Run evaluation
router.post('/run', evaluationController.runEvaluation);

// Get latest report
router.get('/report', evaluationController.getLatestReport);

export default router;