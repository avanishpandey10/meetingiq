import api from './api';

export const askService = {
  /**
   * Get suggested questions for a meeting.
   */
  async getSuggestedQuestions(
    meetingId
  ) {
    if (!meetingId) {
      throw new Error(
        'Meeting ID is required.'
      );
    }

    const response =
      await api.get(
        `/ask/meetings/${meetingId}/suggestions`
      );

    return response.data;
  },

  /**
   * Ask a question about a meeting.
   */
  async askQuestion(
    meetingId,
    question
  ) {
    if (!meetingId) {
      throw new Error(
        'Meeting ID is required.'
      );
    }

    if (
      typeof question !==
        'string' ||
      question.trim().length <
        3
    ) {
      throw new Error(
        'Question must be at least 3 characters long.'
      );
    }

    const response =
      await api.post(
        `/ask/meetings/${meetingId}/ask`,
        {
          question:
            question.trim()
        }
      );

    return response.data;
  }
};

export default askService;