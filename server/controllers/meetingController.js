import { meetingService } from '../services/meetingService.js';
import { meetingProcessor } from '../services/pipeline/meetingProcessor.js';
/**
 * Meeting Controller
 *
 * Handles HTTP requests for meeting operations.
 */
export const meetingController = {
  /**
   * Upload and create a new meeting.
   */
  async uploadMeeting(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please provide an audio file'
      });
    }

    const meeting =
      await meetingService.createMeeting(
        req.file
      );

    // Start COMPLETE processing pipeline
    meetingProcessor
      .processMeeting(meeting._id)
      .catch((error) => {
        console.error(
          'Background processing error:',
          error
        );
      });

    return res.status(201).json({
      message:
        'Meeting uploaded successfully',
      meeting,
      processing: {
        status: 'started',
        stage: 'transcription'
      }
    });
  } catch (error) {
    next(error);
  }
},

  /**
   * Get all meetings.
   */
  async getMeetings(
    req,
    res,
    next
  ) {
    try {
      const {
        status,
        search,
        limit
      } = req.query;

      const parsedLimit =
        Number(limit);

      const meetings =
        await meetingService.getMeetings({
          status,
          search,
          limit:
            Number.isFinite(
              parsedLimit
            ) &&
            parsedLimit > 0
              ? parsedLimit
              : 50
        });

      return res.json({
        success: true,
        meetings,
        count: meetings.length
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get meeting by ID.
   */
  async getMeeting(
    req,
    res,
    next
  ) {
    try {
      const { id } =
        req.params;

      const meeting =
        await meetingService.getMeetingById(
          id
        );

      return res.json({
        success: true,
        meeting
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get meeting analysis.
   */
  async getAnalysis(
    req,
    res,
    next
  ) {
    try {
      const { id } =
        req.params;

      const analysis =
        await meetingService.getAnalysis(
          id
        );

      return res.json({
        success: true,
        analysis
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get meeting transcript.
   */
  async getTranscript(
    req,
    res,
    next
  ) {
    try {
      const { id } =
        req.params;

      const transcript =
        await meetingService.getTranscript(
          id
        );

      return res.json({
        success: true,
        transcript
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete meeting.
   */
  async deleteMeeting(
    req,
    res,
    next
  ) {
    try {
      const { id } =
        req.params;

      await meetingService.deleteMeeting(
        id
      );

      return res.json({
        success: true,
        message:
          'Meeting deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get meeting processing status.
   */
  async getProcessingStatus(
    req,
    res,
    next
  ) {
    try {
      const { id } =
        req.params;

      const meeting =
        await meetingService.getMeetingById(
          id
        );

      return res.json({
        success: true,

        status:
          meeting.status,

        stage:
          meeting.processingStage,

        progress:
          meeting.processingProgress,

        error:
          meeting.processingError ||
          null,

        processedAt:
          meeting.processedAt ||
          null
      });
    } catch (error) {
      next(error);
    }
  }
};