/**
 * Action Item Model
 *
 * Stores actionable tasks extracted from meetings.
 */

import mongoose from 'mongoose';

const statusHistorySchema =
  new mongoose.Schema(
    {
      status: {
        type: String,

        enum: [
          'PENDING',
          'IN_PROGRESS',
          'COMPLETED'
        ],

        required: true
      },

      changedAt: {
        type: Date,
        default: Date.now
      }
    },
    {
      _id: false
    }
  );

const actionItemSchema =
  new mongoose.Schema(
    {
      meetingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meeting',
        required: true,
        index: true
      },

      analysisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Analysis',
        default: null
      },

      task: {
        type: String,
        required: true,
        trim: true
      },

      owner: {
        type: String,
        default: 'Unassigned',
        trim: true
      },

      deadline: {
        type: String,
        default: 'Not specified',
        trim: true
      },

      priority: {
        type: String,

        enum: [
          'HIGH',
          'MEDIUM',
          'LOW'
        ],

        default: 'MEDIUM'
      },

      status: {
        type: String,

        enum: [
          'PENDING',
          'IN_PROGRESS',
          'COMPLETED'
        ],

        default: 'PENDING'
      },

      sourceTimestamp: {
        type: Number,
        min: 0,
        default: null
      },

      sourceSpeaker: {
        type: String,
        default: 'Unknown Speaker',
        trim: true
      },

      confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: null
      },

      statusHistory: {
        type: [statusHistorySchema],
        default: []
      }
    },
    {
      timestamps: true
    }
  );

// ------------------------------------------------------------
// INDEXES
// ------------------------------------------------------------

actionItemSchema.index({
  meetingId: 1
});

actionItemSchema.index({
  status: 1
});

actionItemSchema.index({
  owner: 1
});

actionItemSchema.index({
  priority: 1
});

// Useful for meeting-specific action tracker queries.
actionItemSchema.index({
  meetingId: 1,
  status: 1
});

// ------------------------------------------------------------
// STATUS HISTORY
// ------------------------------------------------------------

actionItemSchema.pre(
  'save',
  function (next) {
    /*
     * Only add history when:
     * - this is a new document, OR
     * - status has changed.
     */
    if (
      this.isNew ||
      this.isModified('status')
    ) {
      this.statusHistory.push({
        status: this.status,
        changedAt: new Date()
      });
    }

    next();
  }
);

export default mongoose.model(
  'ActionItem',
  actionItemSchema
);