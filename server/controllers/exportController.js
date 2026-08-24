import { exportService } from '../services/exportService.js';

/**
 * Export Controller
 */
export const exportController = {
  /**
   * Export a meeting report.
   *
   * Supported formats:
   * - json
   * - text
   * - html
   */
  async exportMeeting(
    req,
    res,
    next
  ) {
    try {
      const { id } =
        req.params;

      const format =
        String(
          req.query.format ||
            'json'
        ).toLowerCase();

      const report =
        await exportService.generateMeetingReport(
          id
        );

      switch (format) {
        case 'text': {
          const textReport =
            exportService.formatAsText(
              report
            );

          res.setHeader(
            'Content-Type',
            'text/plain; charset=utf-8'
          );

          res.setHeader(
            'Content-Disposition',
            `attachment; filename="meeting-report-${id}.txt"`
          );

          return res.send(
            textReport
          );
        }

        case 'html': {
          const htmlReport =
            exportService.formatAsHtml(
              report
            );

          res.setHeader(
            'Content-Type',
            'text/html; charset=utf-8'
          );

          res.setHeader(
            'Content-Disposition',
            `attachment; filename="meeting-report-${id}.html"`
          );

          return res.send(
            htmlReport
          );
        }

        case 'json':
        default:
          return res.json({
            success: true,
            report
          });
      }
    } catch (error) {
      next(error);
    }
  }
};