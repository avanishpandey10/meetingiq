/**
 * Analysis Model
 *
 * Stores structured meeting intelligence generated
 * by the LLM.
 */

import mongoose from 'mongoose';

// ============================================================
// ACTION ITEM SUB-SCHEMA
// ============================================================

const actionItemSchema =
  new mongoose.Schema(
    {
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
      }
    },
    {
      _id: true
    }
  );

// ============================================================
// DECISION SUB-SCHEMA
// ============================================================

const decisionSchema =
  new mongoose.Schema(
    {
      decision: {
        type: String,
        required: true,
        trim: true
      },

      context: {
        type: String,
        default: ''
      },

      participants: {
        type: [String],
        default: []
      },

      timestamp: {
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
      _id: true
    }
  );

// ============================================================
// TOPIC SUB-SCHEMA
// ============================================================

const topicSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true
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

      summary: {
        type: String,
        default: ''
      }
    },
    {
      _id: true
    }
  );

// ============================================================
// RISK / BLOCKER SUB-SCHEMA
// ============================================================

const riskSchema =
  new mongoose.Schema(
    {
      description: {
        type: String,
        required: true,
        trim: true
      },

      severity: {
        type: String,

        enum: [
          'HIGH',
          'MEDIUM',
          'LOW'
        ],

        default: 'MEDIUM'
      },

      timestamp: {
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
      _id: true
    }
  );

// ============================================================
// OPEN QUESTION SUB-SCHEMA
// ============================================================

const questionSchema =
  new mongoose.Schema(
    {
      question: {
        type: String,
        required: true,
        trim: true
      },

      status: {
        type: String,

        enum: [
          'OPEN',
          'RESOLVED'
        ],

        default: 'OPEN'
      },

      timestamp: {
        type: Number,
        min: 0,
        default: null
      }
    },
    {
      _id: true
    }
  );

// ============================================================
// TIMELINE SUB-SCHEMA
// ============================================================

const timelineEventSchema =
  new mongoose.Schema(
    {
      timestamp: {
        type: Number,
        min: 0,
        default: null
      },

      eventType: {
        type: String,

        enum: [
          'TOPIC_START',
          'DECISION',
          'ACTION_ITEM',
          'RISK',
          'QUESTION',
          'BLOCKER'
        ]
      },

      description: {
        type: String,
        default: ''
      }
    },
    {
      _id: true
    }
  );

// ============================================================
// MEETING SCORE SUB-SCHEMA
// ============================================================

const meetingScoreSchema =
  new mongoose.Schema(
    {
      overall: {
        type: Number,
        min: 0,
        max: 100
      },

      preparation: {
        type: Number,
        min: 0,
        max: 100
      },

      decisionClarity: {
        type: Number,
        min: 0,
        max: 100
      },

      actionability: {
        type: Number,
        min: 0,
        max: 100
      },

      ownershipClarity: {
        type: Number,
        min: 0,
        max: 100
      },

      followUpClarity: {
        type: Number,
        min: 0,
        max: 100
      },

      reasons: {
        type: [String],
        default: []
      },

      strengths: {
        type: [String],
        default: []
      },

      improvements: {
        type: [String],
        default: []
      }
    },
    {
      _id: false
    }
  );

// ============================================================
// ANALYSIS SCHEMA
// ============================================================

const analysisSchema =
  new mongoose.Schema(
    {
      meetingId: {
        type: mongoose.Schema.Types.ObjectId,

        ref: 'Meeting',

        required: true,

        unique: true,

        index: true
      },

      executiveSummary: {
        type: String,
        default: ''
      },

      keyTopics: {
        type: [topicSchema],
        default: []
      },

      keyDecisions: {
        type: [decisionSchema],
        default: []
      },

      actionItems: {
        type: [actionItemSchema],
        default: []
      },

      openQuestions: {
        type: [questionSchema],
        default: []
      },

      risks: {
        type: [riskSchema],
        default: []
      },

      blockers: {
        type: [riskSchema],
        default: []
      },

      timeline: {
        type: [timelineEventSchema],
        default: []
      },

      meetingScore: {
        type: meetingScoreSchema,
        default: null
      },

      rawAnalysis: {
        type: mongoose.Schema.Types.Mixed,
        default: null
      }
    },
    {
      timestamps: true
    }
  );

analysisSchema.index({
  meetingId: 1
});

export default mongoose.model(
  'Analysis',
  analysisSchema
);