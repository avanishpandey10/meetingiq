/**
 * Transcript Model
 *
 * Stores the ASR output for a meeting.
 */

import mongoose from 'mongoose';

// ============================================================
// WORD SUB-SCHEMA
// ============================================================

const wordSchema =
  new mongoose.Schema(
    {
      word: {
        type: String,
        default: ''
      },

      start: {
        type: Number,
        min: 0,
        default: null
      },

      end: {
        type: Number,
        min: 0,
        default: null
      },

      confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: null
      }
    },
    {
      _id: false
    }
  );

// ============================================================
// SEGMENT SUB-SCHEMA
// ============================================================

const segmentSchema =
  new mongoose.Schema(
    {
      segmentId: {
        type: String,
        required: true
      },

      speaker: {
        type: String,
        default: 'Unknown Speaker',
        trim: true
      },

      speakerConfidence: {
        type: Number,
        min: 0,
        max: 1,
        default: null
      },

      startTime: {
        type: Number,
        min: 0,
        default: null
      },

      endTime: {
        type: Number,
        min: 0,
        default: null
      },

      text: {
        type: String,
        default: ''
      },

      words: {
        type: [wordSchema],
        default: []
      }
    },
    {
      _id: false
    }
  );

// ============================================================
// SPEAKER STATISTICS
// ============================================================

const speakerStatsSchema =
  new mongoose.Schema(
    {
      speaker: {
        type: String,
        required: true
      },

      totalTime: {
        type: Number,
        min: 0,
        default: 0
      },

      segmentCount: {
        type: Number,
        min: 0,
        default: 0
      },

      percentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      }
    },
    {
      _id: false
    }
  );

// ============================================================
// TRANSCRIPT SCHEMA
// ============================================================

const transcriptSchema =
  new mongoose.Schema(
    {
      meetingId: {
        type: mongoose.Schema.Types.ObjectId,

        ref: 'Meeting',

        required: true,

        unique: true,

        index: true
      },

      fullText: {
        type: String,
        default: ''
      },

      language: {
        type: String,
        default: 'unknown',
        trim: true
      },

      segments: {
        type: [segmentSchema],
        default: []
      },

      speakerStats: {
        type: [speakerStatsSchema],
        default: []
      }
    },
    {
      timestamps: true
    }
  );

transcriptSchema.index({
  meetingId: 1
});

export default mongoose.model(
  'Transcript',
  transcriptSchema
);