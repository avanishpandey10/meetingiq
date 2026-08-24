export function fullMeetingAnalysisPrompt(
  transcript,
  meetingInfo = {}
) {
  return `
You are an expert meeting intelligence analyst.

Analyze the meeting transcript below and return ONE structured JSON object.

MEETING TRANSCRIPT:
${transcript}

TASKS:

1. Executive summary
2. Key discussion topics
3. Explicit decisions
4. Explicit action items
5. Risks
6. Current blockers
7. Unresolved questions
8. Meeting effectiveness score

STRICT ANTI-HALLUCINATION RULES:

- Use ONLY information explicitly present in the transcript.
- Never invent owners.
- Never invent deadlines.
- Never invent decisions.
- Never invent risks.
- Never infer facts that are not supported.
- If owner is unknown, use "Unassigned".
- If deadline is unknown, use "Not specified".
- If there are no items, return an empty array.
- Timestamps must come from the transcript.
- Confidence must reflect evidence strength.

EXECUTIVE SUMMARY:
Focus on decisions, outcomes and commitments.

TOPICS:
Create meaningful discussion topics with startTime and endTime.

DECISIONS:
Only include explicit final agreements.

ACTION ITEMS:
Only include clear commitments to perform a task.

RISKS:
Future concerns explicitly mentioned.

BLOCKERS:
Current obstacles explicitly preventing progress.

OPEN QUESTIONS:
Questions/issues explicitly left unresolved.

MEETING SCORE:
Score observable meeting effectiveness from 0-100.

Return ONLY valid JSON.
`;
}

export const fullMeetingAnalysisSchema = {
  type: 'object',

  required: [
    'executiveSummary',
    'keyTopics',
    'keyDecisions',
    'actionItems',
    'risks',
    'blockers',
    'openQuestions',
    'meetingScore'
  ],

  properties: {
    executiveSummary: {
      type: 'string'
    },

    keyTopics: {
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
    },

    keyDecisions: {
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
            type: 'number'
          }
        }
      }
    },

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
            type: 'number'
          }
        }
      }
    },

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
            type: 'number'
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
            type: 'number'
          }
        }
      }
    },

    openQuestions: {
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
    },

    meetingScore: {
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
          type: 'number'
        },
        preparation: {
          type: 'number'
        },
        decisionClarity: {
          type: 'number'
        },
        actionability: {
          type: 'number'
        },
        ownershipClarity: {
          type: 'number'
        },
        followUpClarity: {
          type: 'number'
        },
        reasons: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    }
  }
};