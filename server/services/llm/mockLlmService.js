/**
 * Mock LLM Service for Demo Mode
 *
 * Generates realistic structured meeting analysis
 * without calling an external LLM API.
 *
 * IMPORTANT:
 * This service is only for DEMO_MODE / local development.
 */

export const mockLlmService = {
  /**
   * Generate structured meeting analysis.
   *
   * The interface intentionally matches GeminiService:
   * generateStructuredResponse(prompt, schema, options)
   */
  async generateStructuredResponse(
    prompt,
    schema,
    options = {}
  ) {
    // Simulate AI processing delay
    await new Promise((resolve) =>
      setTimeout(resolve, 800)
    );

    const normalizedPrompt =
      typeof prompt === 'string'
        ? prompt.toLowerCase()
        : '';

    // ---------------------------------------------------------
    // EXECUTIVE SUMMARY
    // ---------------------------------------------------------
    if (
      normalizedPrompt.includes(
        'executive summary'
      )
    ) {
      return {
        summary:
          'The team reviewed project progress and discussed the upcoming staging deployment. Backend API integration is complete, while the frontend dashboard still requires additional work. The team agreed on a Friday staging target and identified follow-up work before the demo.',

        keyOutcomes: [
          'Backend API integration completed',
          'Frontend dashboard requires additional work',
          'Staging deployment targeted for Friday'
        ],

        overallSentiment: 'positive',

        meetingEffectiveness: 78
      };
    }

    // ---------------------------------------------------------
    // DECISIONS
    // ---------------------------------------------------------
    if (
      normalizedPrompt.includes(
        'decisions'
      )
    ) {
      return {
        decisions: [
          {
            decision:
              'Deploy the application to the staging environment by Friday.',

            context:
              'The team agreed to complete the remaining frontend work and target a staging deployment for the upcoming demo.',

            participants: [
              'Speaker 1',
              'Speaker 2'
            ],

            timestamp: 62.1,

            confidence: 0.95
          },

          {
            decision:
              'Complete the remaining frontend dashboard work before staging deployment.',

            context:
              'The frontend dashboard was identified as the remaining major development task.',

            participants: [
              'Speaker 1',
              'Speaker 3'
            ],

            timestamp: 45.8,

            confidence: 0.91
          }
        ]
      };
    }

    // ---------------------------------------------------------
    // ACTION ITEMS
    // ---------------------------------------------------------
    if (
      normalizedPrompt.includes(
        'action items'
      )
    ) {
      return {
        actionItems: [
          {
            task:
              'Complete frontend dashboard components',

            owner: 'Speaker 3',

            deadline:
              '2026-08-22',

            priority: 'HIGH',

            sourceTimestamp: 45.8,

            sourceSpeaker: 'Speaker 3',

            confidence: 0.93
          },

          {
            task:
              'Prepare deployment configuration',

            owner: 'Unassigned',

            deadline:
              '2026-08-25',

            priority: 'HIGH',

            sourceTimestamp: 62.1,

            sourceSpeaker: 'Speaker 1',

            confidence: 0.89
          },

          {
            task:
              'Complete QA testing before the staging demo',

            owner: 'Unassigned',

            deadline:
              'Not specified',

            priority: 'MEDIUM',

            sourceTimestamp: 78.4,

            sourceSpeaker: 'Speaker 2',

            confidence: 0.86
          },

          {
            task:
              'Schedule follow-up with the database team',

            owner: 'Unassigned',

            deadline:
              'Not specified',

            priority: 'MEDIUM',

            sourceTimestamp: 112.7,

            sourceSpeaker: 'Speaker 2',

            confidence: 0.84
          }
        ]
      };
    }

    // ---------------------------------------------------------
    // RISKS
    // ---------------------------------------------------------
    if (
      normalizedPrompt.includes(
        'risks'
      ) ||
      normalizedPrompt.includes(
        'blockers'
      )
    ) {
      return {
        risks: [
          {
            description:
              'The remaining frontend work may affect the staging deployment timeline.',

            severity: 'MEDIUM',

            timestamp: 45.8,

            confidence: 0.90
          },

          {
            description:
              'Database migration may introduce deployment risk if not validated before the demo.',

            severity: 'HIGH',

            timestamp: 95.2,

            confidence: 0.87
          }
        ],

        blockers: [
          {
            description:
              'Frontend dashboard is not yet completely ready for testing.',

            severity: 'MEDIUM',

            timestamp: 45.8,

            confidence: 0.88
          }
        ]
      };
    }

    // ---------------------------------------------------------
    // OPEN QUESTIONS
    // ---------------------------------------------------------
    if (
      normalizedPrompt.includes(
        'open questions'
      )
    ) {
      return {
        questions: [
          {
            question:
              'Which cloud provider will be used for production deployment?',

            status: 'OPEN',

            timestamp: 0
          },

          {
            question:
              'Will the database migration be completed and validated before the demo?',

            status: 'OPEN',

            timestamp: 95.2
          }
        ]
      };
    }

    // ---------------------------------------------------------
    // TOPICS
    // ---------------------------------------------------------
    if (
      normalizedPrompt.includes(
        'topics'
      )
    ) {
      return {
        topics: [
          {
            title:
              'Project Status Update',

            startTime: 0,

            endTime: 28.3,

            summary:
              'The team reviewed current project progress, including completion of the backend API integration.'
          },

          {
            title:
              'Frontend Development',

            startTime: 28.3,

            endTime: 62.1,

            summary:
              'The team discussed the frontend dashboard and the remaining work required before testing.'
          },

          {
            title:
              'Deployment Planning',

            startTime: 62.1,

            endTime: 95.2,

            summary:
              'The team discussed the staging deployment target and follow-up responsibilities.'
          },

          {
            title:
              'Risks and Follow-up',

            startTime: 95.2,

            endTime: 128.9,

            summary:
              'The team identified deployment-related risks and unresolved follow-up items.'
          }
        ]
      };
    }

    // ---------------------------------------------------------
    // QUALITY ANALYSIS
    // ---------------------------------------------------------
    if (
      normalizedPrompt.includes(
        'quality'
      )
    ) {
      return {
        score: {
          overall: 78,
          preparation: 75,
          decisionClarity: 82,
          actionability: 80,
          ownershipClarity: 70,
          followUpClarity: 77
        },

        reasons: [
          '2 major decisions were identified with clear context.',
          '4 action items were extracted.',
          '3 action items do not have an assigned owner.',
          '2 action items do not have a specific deadline.',
          '2 open questions remain unresolved.'
        ],

        strengths: [
          'Clear deployment target',
          'Good identification of remaining development work',
          'Action-oriented discussion'
        ],

        improvements: [
          'Assign owners to unassigned tasks',
          'Specify deadlines for remaining tasks',
          'Resolve open deployment questions before the next meeting'
        ]
      };
    }

    // ---------------------------------------------------------
    // ASK YOUR MEETING
    // ---------------------------------------------------------
    if (
      normalizedPrompt.includes(
        'ask'
      ) ||
      normalizedPrompt.includes(
        'question'
      )
    ) {
      return {
        answer:
          'Based on the meeting transcript, the team completed the backend API integration and discussed finishing the frontend dashboard before the staging deployment.',

        sources: [
          {
            timestamp: 12.5,
            speaker: 'Speaker 2',
            text:
              'The backend API integration has been completed.'
          },
          {
            timestamp: 45.8,
            speaker: 'Speaker 3',
            text:
              'The frontend dashboard still needs additional work.'
          }
        ]
      };
    }

    // ---------------------------------------------------------
    // DEFAULT
    // ---------------------------------------------------------
    return {
      result:
        'No specific mock analysis was configured for this prompt.'
    };
  },

  /**
   * Generate text response for Ask Meeting / general LLM tasks.
   */
  async generateText(
    prompt,
    options = {}
  ) {
    await new Promise((resolve) =>
      setTimeout(resolve, 500)
    );

    const normalizedPrompt =
      typeof prompt === 'string'
        ? prompt.toLowerCase()
        : '';

    if (
      normalizedPrompt.includes(
        'what did'
      )
    ) {
      return (
        'Based on the meeting transcript, ' +
        'the team discussed project progress, ' +
        'completed backend API integration, ' +
        'and identified additional frontend work ' +
        'before the staging deployment.'
      );
    }

    if (
      normalizedPrompt.includes(
        'decisions'
      )
    ) {
      return (
        'The primary decision was to target ' +
        'staging deployment by Friday after ' +
        'the remaining frontend work is completed.'
      );
    }

    if (
      normalizedPrompt.includes(
        'action'
      )
    ) {
      return (
        'The main action items are completing ' +
        'the frontend dashboard, preparing the ' +
        'deployment configuration, completing QA, ' +
        'and scheduling a database-team follow-up.'
      );
    }

    return (
      'Based on the available meeting context, ' +
      'the team discussed project progress, ' +
      'deployment planning, remaining work, ' +
      'and follow-up actions.'
    );
  }
};