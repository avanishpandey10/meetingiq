import api from './api';

export const actionService = {
  /**
   * Get all action items with filters.
   */
  async getActionItems(
    filters = {}
  ) {
    const params = {};

    if (filters.status) {
      params.status =
        filters.status;
    }

    if (filters.owner) {
      params.owner =
        filters.owner;
    }

    if (filters.priority) {
      params.priority =
        filters.priority;
    }

    if (filters.meetingId) {
      params.meetingId =
        filters.meetingId;
    }

    const response =
      await api.get(
        '/action-items',
        { params }
      );

    return response.data;
  },

  /**
   * Get a single action item.
   */
  async getActionItem(
    itemId
  ) {
    if (!itemId) {
      throw new Error(
        'Action item ID is required.'
      );
    }

    const response =
      await api.get(
        `/action-items/${itemId}`
      );

    return response.data;
  },

  /**
   * Update action item.
   */
  async updateActionItem(
    itemId,
    updates
  ) {
    if (!itemId) {
      throw new Error(
        'Action item ID is required.'
      );
    }

    const response =
      await api.patch(
        `/action-items/${itemId}`,
        updates
      );

    return response.data;
  },

  /**
   * Get action item statistics.
   */
  async getActionItemStats(
    filters = {}
  ) {
    const params = {};

    if (filters.meetingId) {
      params.meetingId =
        filters.meetingId;
    }

    const response =
      await api.get(
        '/action-items/stats',
        { params }
      );

    return response.data;
  }
};

export default actionService;