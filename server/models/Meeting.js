/**
 * Meeting Model
 *
 * Stores uploaded meeting metadata,
 * processing state, and references to
 * transcript/analysis documents.
 */

import mongoose from 'mongoose';

const meetingSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
      },

      originalFilename: {
        type: String,
        required: true,
        trim: true
      },

      fileSize: {
        type: Number,
        required: true,
        min: 0
      },

      duration: {
        type: Number,
        default: 0,
        min: 0
      },

      fileFormat: {
        type: String,
        required: true,
        trim: true
      },

      storagePath: {
        type: String,
        required: true,
        trim: true
      },

      status: {
        type: String,

        enum: [
          'UPLOADED',
          'PROCESSING',
          'COMPLETED',
          'FAILED'
        ],

        default: 'UPLOADED',

        index: true
      },

      processingStage: {
        type: String,
        default: 'uploaded'
      },

      processingProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },

      processingError: {
        type: String,
        default: null
      },

      detectedLanguage: {
        type: String,
        default: null,
        trim: true
      },

      languageConfidence: {
        type: Number,
        default: null,
        min: 0,
        max: 1
      },

      transcriptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transcript',
        default: null
      },

      analysisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Analysis',
        default: null
      },

      processedAt: {
        type: Date,
        default: null
      }
    },
    {
      timestamps: true
    }
  );

// ============================================================
// INDEXES
// ============================================================

meetingSchema.index({
  createdAt: -1
});

meetingSchema.index({
  status: 1
});

meetingSchema.index({
  detectedLanguage: 1
});

// Helpful for dashboard/history search.
meetingSchema.index({
  title: 'text'
});

export default mongoose.model(
  'Meeting',
  meetingSchema
);