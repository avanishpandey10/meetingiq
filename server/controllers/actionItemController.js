import { actionItemService } from '../services/actionItemService.js';

/**
 * Action Item Controller
 *
 * Handles HTTP requests related to action items.
 */
export const actionItemController = {
  /**
   * Get all action items.
   */
  async getActionItems(req, res, next) {
    try {
      const {
        status,
        owner,
        priority,
        meetingId
      } = req.query;

      const items =
        await actionItemService.getActionItems({
          status,
          owner,
          priority,
          meetingId
        });

      return res.json({
        success: true,
        items,
        count: items.length
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a single action item.
   */
  async getActionItem(req, res, next) {
    try {
      const { id } = req.params;

      const item =
        await actionItemService.getActionItem(
          id
        );

      return res.json({
        success: true,
        item
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update an action item.
   */
  async updateActionItem(req, res, next) {
    try {
      const { id } = req.params;

      const updates =
        req.body || {};

      const item =
        await actionItemService.updateActionItem(
          id,
          updates
        );

      return res.json({
        success: true,
        message:
          'Action item updated successfully',
        item
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get action item statistics.
   */
  async getActionItemStats(req, res, next) {
    try {
      const { meetingId } =
        req.query;

      const stats =
        await actionItemService.getActionItemStats(
          { meetingId }
        );

      return res.json({
        success: true,
        stats
      });
    } catch (error) {
      next(error);
    }
  }
};