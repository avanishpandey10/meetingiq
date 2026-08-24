import { runEvaluation } from '../evaluation/evaluate.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const evaluationController = {
  /**
   * Run evaluation and return results
   */
  async runEvaluation(req, res) {
    try {
      console.log('📊 Running evaluation from API...');
      
      const results = await runEvaluation();
      
      res.json({
        success: true,
        message: 'Evaluation completed successfully',
        results
      });
    } catch (error) {
      console.error('❌ Evaluation failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Get latest evaluation report
   */
  async getLatestReport(req, res) {
    try {
      const resultsDir = path.join(__dirname, '../evaluation/results');
      
      if (!fs.existsSync(resultsDir)) {
        return res.json({
          success: true,
          report: null,
          message: 'No evaluation results found. Run evaluation first.'
        });
      }
      
      const files = fs.readdirSync(resultsDir)
        .filter(f => f.endsWith('.json'))
        .sort()
        .reverse();
      
      if (files.length === 0) {
        return res.json({
          success: true,
          report: null,
          message: 'No evaluation results found.'
        });
      }
      
      const latestFile = path.join(resultsDir, files[0]);
      const results = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
      
      res.json({
        success: true,
        report: results
      });
    } catch (error) {
      console.error('Failed to get report:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};