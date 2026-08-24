import { analyticsService } from '../services/analyticsService.js';

/**
 * Analytics Controller
 */
export const analyticsController = {
  /**
   * Get platform analytics.
   */
  async getPlatformAnalytics(
    req,
    res,
    next
  ) {
    try {
      const analytics =
        await analyticsService.getPlatformAnalytics();

      return res.json({
        success: true,
        analytics
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get analytics for a specific meeting.
   */
  async getMeetingAnalytics(
    req,
    res,
    next
  ) {
    try {
      const { id } = req.params;

      const analytics =
        await analyticsService.getMeetingAnalytics(
          id
        );

      return res.json({
        success: true,
        analytics
      });
    } catch (error) {
      next(error);
    }
  }
};