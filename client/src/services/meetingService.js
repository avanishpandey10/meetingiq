import api from './api';

export const meetingService = {
  /**
   * Upload meeting audio.
   */
  async uploadMeeting(
    file,
    onProgress
  ) {
    if (!file) {
      throw new Error(
        'Audio file is required.'
      );
    }

    const formData =
      new FormData();

    formData.append(
      'audio',
      file
    );

    const response =
      await api.post(
        '/meetings/upload',
        formData,
        {
          onUploadProgress:
            (progressEvent) => {
              if (
                typeof onProgress !==
                  'function' ||
                !progressEvent.total
              ) {
                return;
              }

              const percent =
                Math.round(
                  (progressEvent.loaded *
                    100) /
                    progressEvent.total
                );

              onProgress(
                Math.min(
                  100,
                  Math.max(
                    0,
                    percent
                  )
                )
              );
            }
        }
      );

    return response.data;
  },

  /**
   * Get all meetings.
   */
  async getMeetings(
    filters = {}
  ) {
    const params = {};

    if (filters.status) {
      params.status =
        filters.status;
    }

    if (filters.search) {
      params.search =
        filters.search;
    }

    if (filters.limit) {
      params.limit =
        filters.limit;
    }

    /*
     * Passed through for future server-side sorting.
     */
    if (filters.sortBy) {
      params.sortBy =
        filters.sortBy;
    }

    const response =
      await api.get(
        '/meetings',
        { params }
      );

    return response.data;
  },

  /**
   * Get meeting by ID.
   */
  async getMeeting(
    meetingId
  ) {
    if (!meetingId) {
      throw new Error(
        'Meeting ID is required.'
      );
    }

    const response =
      await api.get(
        `/meetings/${meetingId}`
      );

    return response.data;
  },

  /**
   * Get meeting transcript.
   */
  async getTranscript(
    meetingId
  ) {
    if (!meetingId) {
      throw new Error(
        'Meeting ID is required.'
      );
    }

    const response =
      await api.get(
        `/meetings/${meetingId}/transcript`
      );

    return response.data;
  },

  /**
   * Get meeting analysis.
   */
  async getAnalysis(
    meetingId
  ) {
    if (!meetingId) {
      throw new Error(
        'Meeting ID is required.'
      );
    }

    const response =
      await api.get(
        `/meetings/${meetingId}/analysis`
      );

    return response.data;
  },

  /**
   * Get processing status.
   */
  async getProcessingStatus(
    meetingId
  ) {
    if (!meetingId) {
      throw new Error(
        'Meeting ID is required.'
      );
    }

    const response =
      await api.get(
        `/meetings/${meetingId}/status`
      );

    return response.data;
  },

  /**
   * Delete meeting.
   */
  async deleteMeeting(
    meetingId
  ) {
    if (!meetingId) {
      throw new Error(
        'Meeting ID is required.'
      );
    }

    const response =
      await api.delete(
        `/meetings/${meetingId}`
      );

    return response.data;
  },

  /**
   * Export meeting report.
   */
  async exportMeeting(
    meetingId,
    format = 'json'
  ) {
    if (!meetingId) {
      throw new Error(
        'Meeting ID is required.'
      );
    }

    const response =
      await api.get(
        `/export/meetings/${meetingId}/export`,
        {
          params: {
            format
          }
        }
      );

    return response.data;
  }
};

export default meetingService;