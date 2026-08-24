import Meeting from '../models/Meeting.js';
import Transcript from '../models/Transcript.js';
import Analysis from '../models/Analysis.js';
import ActionItem from '../models/ActionItem.js';

import { getAsrService } from './asr/asrService.js';

import path from 'node:path';
import fs from 'node:fs';

/**
 * Meeting Service
 *
 * Handles meeting business logic.
 */
export const meetingService = {
  /**
   * Create a new meeting from uploaded file.
   */
  async createMeeting(fileData) {
    try {
      if (!fileData) {
        throw new Error('Uploaded file data is required.');
      }

      if (!fileData.originalname) {
        throw new Error('Original filename is required.');
      }

      const title =
        this.generateMeetingTitle(
          fileData.originalname
        );

      const meeting = new Meeting({
        title,

        originalFilename:
          fileData.originalname,

        fileSize:
          fileData.size || 0,

        fileFormat:
          path
            .extname(fileData.originalname)
            .toLowerCase(),

        storagePath:
          fileData.path,

        status: 'UPLOADED',

        processingStage:
          'uploaded',

        processingProgress: 0
      });

      await meeting.save();

      console.log(
        `✅ Meeting created: ${meeting._id} - ${meeting.title}`
      );

      return meeting;
    } catch (error) {
      console.error(
        '❌ Failed to create meeting:',
        error
      );

      throw error;
    }
  },

  /**
   * Generate a meeting title from filename.
   */
  generateMeetingTitle(filename) {
    if (!filename) {
      return 'Untitled Meeting';
    }

    const withoutExt = path.basename(
      filename,
      path.extname(filename)
    );

    const title = withoutExt
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      )
      .trim();

    return title || 'Untitled Meeting';
  },

  /**
   * Process meeting audio through ASR pipeline.
   *
   * NOTE:
   * The complete AI processing pipeline should preferably
   * be handled by meetingProcessor.js.
   *
   * This method keeps your existing service API intact.
   */
  async processMeeting(meetingId) {
    const meeting =
      await Meeting.findById(meetingId);

    if (!meeting) {
      throw new Error(
        'Meeting not found'
      );
    }

    try {
      // ------------------------------------------------------
      // Validate audio path
      // ------------------------------------------------------

      if (!meeting.storagePath) {
        throw new Error(
          'Meeting audio file path is missing.'
        );
      }

      // ------------------------------------------------------
      // Update status
      // ------------------------------------------------------

      meeting.status =
        'PROCESSING';

      meeting.processingStage =
        'transcription';

      meeting.processingProgress =
        10;

      meeting.processingError =
        null;

      await meeting.save();

      console.log(
        `🔄 Processing meeting ${meetingId}: Starting transcription...`
      );

      // ------------------------------------------------------
      // Get ASR service
      // ------------------------------------------------------

      const asrService =
        getAsrService();

      // ------------------------------------------------------
      // Transcribe audio
      // ------------------------------------------------------

      const transcriptData =
        await asrService.transcribe(
          meeting.storagePath
        );

      if (
        !transcriptData ||
        !Array.isArray(
          transcriptData.segments
        )
      ) {
        throw new Error(
          'Invalid transcript returned by ASR service.'
        );
      }

      if (
        transcriptData.segments.length === 0
      ) {
        throw new Error(
          'No transcript segments returned.'
        );
      }

      // ------------------------------------------------------
      // Transcript storage
      // ------------------------------------------------------

      meeting.processingProgress =
        60;

      meeting.processingStage =
        'transcript_storage';

      await meeting.save();

      const fullText =
        typeof transcriptData.fullText ===
        'string'
          ? transcriptData.fullText.trim()
          : transcriptData.segments
              .map(
                (segment) =>
                  segment.text || ''
              )
              .filter(Boolean)
              .join(' ');

      if (!fullText) {
        throw new Error(
          'Transcript contains no text.'
        );
      }

      const transcript =
        new Transcript({
          meetingId:
            meeting._id,

          fullText,

          language:
            transcriptData.language ||
            'unknown',

          segments:
            transcriptData.segments,

          speakerStats:
            Array.isArray(
              transcriptData.speakerStats
            )
              ? transcriptData.speakerStats
              : []
        });

      await transcript.save();

      meeting.transcriptId =
        transcript._id;

      // ------------------------------------------------------
      // Duration
      // ------------------------------------------------------

      meeting.duration =
        this.calculateDuration(
          transcriptData.segments
        );

      meeting.detectedLanguage =
        transcriptData.language ||
        'unknown';

      /*
       * Do not hardcode a fake language confidence.
       * Only set it if the ASR service provides one.
       */
      if (
        transcriptData.languageConfidence !==
        undefined
      ) {
        meeting.languageConfidence =
          transcriptData.languageConfidence;
      }

      // ------------------------------------------------------
      // Complete
      // ------------------------------------------------------

      meeting.processingProgress =
        100;

      meeting.processingStage =
        'completed';

      meeting.status =
        'COMPLETED';

      meeting.processedAt =
        new Date();

      await meeting.save();

      console.log(
        `✅ Meeting ${meetingId} processed successfully`
      );

      return meeting;
    } catch (error) {
      meeting.status =
        'FAILED';

      meeting.processingError =
        error.message;

      meeting.processingStage =
        'failed';

      await meeting.save();

      console.error(
        `❌ Meeting ${meetingId} processing failed:`,
        error
      );

      throw error;
    }
  },

  /**
   * Calculate meeting duration from valid timestamps.
   */
  calculateDuration(segments) {
    if (
      !Array.isArray(segments) ||
      segments.length === 0
    ) {
      return 0;
    }

    const validSegments =
      segments.filter(
        (segment) =>
          typeof segment.startTime ===
            'number' &&
          typeof segment.endTime ===
            'number' &&
          segment.endTime >=
            segment.startTime
      );

    if (
      validSegments.length === 0
    ) {
      return 0;
    }

    return Math.max(
      ...validSegments.map(
        (segment) =>
          segment.endTime
      )
    );
  },

  /**
   * Get all meetings with optional filters.
   */
  async getMeetings(filters = {}) {
    const query = {};

    if (filters.status) {
      query.status =
        filters.status;
    }

    if (
      filters.search &&
      filters.search.trim()
    ) {
      query.title = {
        $regex:
          filters.search.trim(),
        $options: 'i'
      };
    }

    const parsedLimit =
      Number(filters.limit);

    const limit =
      Number.isFinite(parsedLimit) &&
      parsedLimit > 0
        ? Math.min(
            parsedLimit,
            100
          )
        : 50;

    const meetings =
      await Meeting.find(query)
        .sort({
          createdAt: -1
        })
        .limit(limit);

    const meetingsWithCounts =
      await Promise.all(
        meetings.map(
          async (meeting) => {
            const meetingObj =
              meeting.toObject();

            if (
              meeting.transcriptId
            ) {
              const transcript =
                await Transcript.findById(
                  meeting.transcriptId
                ).lean();

              if (transcript) {
                meetingObj.segmentCount =
                  Array.isArray(
                    transcript.segments
                  )
                    ? transcript.segments.length
                    : 0;

                meetingObj.speakerCount =
                  Array.isArray(
                    transcript.speakerStats
                  )
                    ? transcript
                        .speakerStats
                        .length
                    : 0;
              } else {
                meetingObj.segmentCount =
                  0;

                meetingObj.speakerCount =
                  0;
              }
            } else {
              meetingObj.segmentCount =
                0;

              meetingObj.speakerCount =
                0;
            }

            return meetingObj;
          }
        )
      );

    return meetingsWithCounts;
  },

  /**
   * Get meeting by ID.
   */
  async getMeetingById(meetingId) {
    const meeting =
      await Meeting.findById(
        meetingId
      );

    if (!meeting) {
      throw new Error(
        'Meeting not found'
      );
    }

    return meeting;
  },

  /**
   * Get analysis for a meeting.
   */
  async getAnalysis(meetingId) {
    const analysis =
      await Analysis.findOne({
        meetingId
      });

    if (!analysis) {
      throw new Error(
        'Analysis not found for this meeting'
      );
    }

    return analysis;
  },

  /**
   * Get transcript for a meeting.
   */
  async getTranscript(meetingId) {
    const transcript =
      await Transcript.findOne({
        meetingId
      });

    if (!transcript) {
      throw new Error(
        'Transcript not found for this meeting'
      );
    }

    return transcript;
  },

  /**
   * Delete meeting and associated data.
   */
  async deleteMeeting(meetingId) {
    const meeting =
      await Meeting.findById(
        meetingId
      );

    if (!meeting) {
      throw new Error(
        'Meeting not found'
      );
    }

    // Delete transcript
    if (
      meeting.transcriptId
    ) {
      await Transcript.findByIdAndDelete(
        meeting.transcriptId
      );
    } else {
      await Transcript.deleteMany({
        meetingId
      });
    }

    // Delete analysis
    if (
      meeting.analysisId
    ) {
      await Analysis.findByIdAndDelete(
        meeting.analysisId
      );
    } else {
      await Analysis.deleteMany({
        meetingId
      });
    }

    // Delete action items
    await ActionItem.deleteMany({
      meetingId
    });

    // Delete audio file
    if (
      meeting.storagePath &&
      fs.existsSync(
        meeting.storagePath
      )
    ) {
      try {
        fs.unlinkSync(
          meeting.storagePath
        );
      } catch (fileError) {
        console.warn(
          '⚠️ Could not delete audio file:',
          fileError.message
        );
      }
    }

    await Meeting.findByIdAndDelete(
      meetingId
    );

    console.log(
      `✅ Meeting ${meetingId} deleted successfully`
    );

    return true;
  }
};