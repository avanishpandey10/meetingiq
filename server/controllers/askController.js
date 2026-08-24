import { askService } from '../services/askService.js';

/**
 * Ask Meeting Controller
 *
 * Handles meeting question-answering requests.
 */
export const askController = {
  /**
   * Ask a question about a meeting.
   */
  async askQuestion(req, res, next) {
    try {
      const { id } =
        req.params;

      const { question } =
        req.body || {};

      if (
        typeof question !== 'string' ||
        question.trim().length < 3
      ) {
        return res.status(400).json({
          success: false,
          error:
            'Validation Error',
          message:
            'Question must be at least 3 characters long.'
        });
      }

      const answer =
        await askService.askQuestion(
          id,
          question
        );

      return res.json({
        success: true,
        data: answer
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get suggested questions.
   */
  async getSuggestedQuestions(
    req,
    res,
    next
  ) {
    try {
      const { id } =
        req.params;

      const suggestions =
        await askService.getSuggestedQuestions(
          id
        );

      return res.json({
        success: true,
        suggestions
      });
    } catch (error) {
      next(error);
    }
  }
};