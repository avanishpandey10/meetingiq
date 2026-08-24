import api from './api';

export const evaluationService = {
  /**
   * Run evaluation
   */
  async runEvaluation() {
    const response = await api.post('/evaluation/run');
    return response.data;
  },

  /**
   * Get latest evaluation report
   */
  async getLatestReport() {
    const response = await api.get('/evaluation/report');
    return response.data;
  }
};