/**
 * JSON Schemas for LLM response validation.
 *
 * These schemas are used by the Gemini structured-output
 * pipeline.
 */

// ============================================================
// EXECUTIVE SUMMARY
// ============================================================

export const executiveSummarySchema = {
  type: 'object',

  required: [
    'summary',
    'keyOutcomes',
    'overallSentiment',
    'meetingEffectiveness'
  ],

  properties: {
    summary: {
      type: 'string'
    },

    keyOutcomes: {
      type: 'array',

      items: {
        type: 'string'
      }
    },

    overallSentiment: {
      type: 'string',

      enum: [
        'positive',
        'neutral',
        'negative'
      ]
    },

    meetingEffectiveness: {
      type: 'number',
      minimum: 0,
      maximum: 100
    }
  }
};

// ============================================================
// DECISIONS
// ============================================================

export const decisionsSchema = {
  type: 'object',

  required: [
    'decisions'
  ],

  properties: {
    decisions: {
      type: 'array',

      items: {
        type: 'object',

        required: [
          'decision',
          'timestamp',
          'confidence'
        ],

        properties: {
          decision: {
            type: 'string'
          },

          context: {
            type: 'string'
          },

          participants: {
            type: 'array',

            items: {
              type: 'string'
            }
          },

          timestamp: {
            type: 'number'
          },

          confidence: {
            type: 'number',
            minimum: 0,
            maximum: 1
          }
        }
      }
    }
  }
};

// ============================================================
// ACTION ITEMS
// ============================================================

export const actionItemsSchema = {
  type: 'object',

  required: [
    'actionItems'
  ],

  properties: {
    actionItems: {
      type: 'array',

      items: {
        type: 'object',

        required: [
          'task',
          'owner',
          'deadline',
          'priority',
          'sourceTimestamp',
          'confidence'
        ],

        properties: {
          task: {
            type: 'string'
          },

          owner: {
            type: 'string'
          },

          deadline: {
            type: 'string'
          },

          priority: {
            type: 'string',

            enum: [
              'HIGH',
              'MEDIUM',
              'LOW'
            ]
          },

          sourceTimestamp: {
            type: 'number'
          },

          sourceSpeaker: {
            type: 'string'
          },

          confidence: {
            type: 'number',
            minimum: 0,
            maximum: 1
          }
        }
      }
    }
  }
};

// ============================================================
// RISKS / BLOCKERS
// ============================================================

export const risksSchema = {
  type: 'object',

  required: [
    'risks',
    'blockers'
  ],

  properties: {
    risks: {
      type: 'array',

      items: {
        type: 'object',

        required: [
          'description',
          'severity',
          'timestamp',
          'confidence'
        ],

        properties: {
          description: {
            type: 'string'
          },

          severity: {
            type: 'string',

            enum: [
              'HIGH',
              'MEDIUM',
              'LOW'
            ]
          },

          timestamp: {
            type: 'number'
          },

          confidence: {
            type: 'number',
            minimum: 0,
            maximum: 1
          }
        }
      }
    },

    blockers: {
      type: 'array',

      items: {
        type: 'object',

        required: [
          'description',
          'severity',
          'timestamp',
          'confidence'
        ],

        properties: {
          description: {
            type: 'string'
          },

          severity: {
            type: 'string',

            enum: [
              'HIGH',
              'MEDIUM',
              'LOW'
            ]
          },

          timestamp: {
            type: 'number'
          },

          confidence: {
            type: 'number',
            minimum: 0,
            maximum: 1
          }
        }
      }
    }
  }
};

// ============================================================
// OPEN QUESTIONS
// ============================================================

export const openQuestionsSchema = {
  type: 'object',

  required: [
    'questions'
  ],

  properties: {
    questions: {
      type: 'array',

      items: {
        type: 'object',

        required: [
          'question',
          'status',
          'timestamp'
        ],

        properties: {
          question: {
            type: 'string'
          },

          status: {
            type: 'string',

            enum: [
              'OPEN',
              'RESOLVED'
            ]
          },

          timestamp: {
            type: 'number'
          }
        }
      }
    }
  }
};

// ============================================================
// TOPICS
// ============================================================

export const topicsSchema = {
  type: 'object',

  required: [
    'topics'
  ],

  properties: {
    topics: {
      type: 'array',

      items: {
        type: 'object',

        required: [
          'title',
          'startTime',
          'endTime',
          'summary'
        ],

        properties: {
          title: {
            type: 'string'
          },

          startTime: {
            type: 'number'
          },

          endTime: {
            type: 'number'
          },

          summary: {
            type: 'string'
          }
        }
      }
    }
  }
};

// ============================================================
// QUALITY ANALYSIS
// ============================================================

export const qualityAnalysisSchema = {
  type: 'object',

  required: [
    'score',
    'reasons',
    'strengths',
    'improvements'
  ],

  properties: {
    score: {
      type: 'object',

      required: [
        'overall',
        'preparation',
        'decisionClarity',
        'actionability',
        'ownershipClarity',
        'followUpClarity'
      ],

      properties: {
        overall: {
          type: 'number',
          minimum: 0,
          maximum: 100
        },

        preparation: {
          type: 'number',
          minimum: 0,
          maximum: 100
        },

        decisionClarity: {
          type: 'number',
          minimum: 0,
          maximum: 100
        },

        actionability: {
          type: 'number',
          minimum: 0,
          maximum: 100
        },

        ownershipClarity: {
          type: 'number',
          minimum: 0,
          maximum: 100
        },

        followUpClarity: {
          type: 'number',
          minimum: 0,
          maximum: 100
        }
      }
    },

    reasons: {
      type: 'array',

      items: {
        type: 'string'
      }
    },

    strengths: {
      type: 'array',

      items: {
        type: 'string'
      }
    },

    improvements: {
      type: 'array',

      items: {
        type: 'string'
      }
    }
  }
};