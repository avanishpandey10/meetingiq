/**
 * Ask Meeting Prompt
 *
 * Design goals:
 * - Ground answers strictly in meeting evidence
 * - Prevent hallucination
 * - Return supporting transcript segments
 * - Provide confidence and source attribution
 */

export function askMeetingPrompt(
  question,
  transcript,
  analysisData = null,
  relevantSegments = []
) {
  const transcriptContext =
    buildTranscriptContext(
      transcript
    );

  const analysisContext =
    buildAnalysisContext(
      analysisData
    );

  const relevantContext =
    buildRelevantSegmentsContext(
      relevantSegments
    );

  return `
You are MeetingIQ, a grounded AI meeting assistant.

Your job is to answer questions ONLY using information contained in the supplied meeting context.

USER QUESTION:
${question}

==================================================
RELEVANT TRANSCRIPT SEGMENTS
==================================================

${relevantContext || 'No specifically matched segments were found.'}

==================================================
FULL MEETING TRANSCRIPT
==================================================

${transcriptContext || 'No transcript available.'}

==================================================
MEETING ANALYSIS
==================================================

${analysisContext || 'No additional analysis available.'}

==================================================
CRITICAL GROUNDING RULES
==================================================

1. Answer ONLY from the supplied meeting context.

2. Do NOT use outside knowledge.

3. Do NOT invent:
   - speakers
   - names
   - deadlines
   - decisions
   - action items
   - risks
   - timestamps

4. Do NOT assume that a suggestion became a decision.

5. Do NOT assume ownership unless explicitly supported.

6. If the answer cannot be supported by the meeting context, say:
   "I cannot find information about this in the meeting transcript."

7. When possible, include the supporting speaker and timestamp.

8. If multiple speakers contributed relevant information, include the relevant perspectives.

9. Keep the answer concise and directly related to the question.

10. Relevant transcript segments must support the answer.

11. Never fabricate a supporting quote.

12. If the meeting context contains conflicting statements, acknowledge the conflict instead of choosing arbitrarily.

==================================================
RESPONSE
==================================================

Return ONLY valid JSON matching the provided schema.

The response must contain:

- answer
- relevantSegments
- confidence

Confidence:
0-1 based on how strongly the answer is supported by the transcript.

For unsupported questions:
- answer should explicitly say the information was not found
- relevantSegments should be []
- confidence should be low

`.trim();
}

/**
 * Build transcript context.
 */
function buildTranscriptContext(
  transcript
) {
  if (
    !transcript ||
    !Array.isArray(
      transcript.segments
    )
  ) {
    return '';
  }

  return transcript.segments
    .map((segment) => {
      const timestamp =
        formatTimestamp(
          segment.startTime
        );

      const speaker =
        segment.speaker ||
        'Unknown Speaker';

      const text =
        typeof segment.text ===
        'string'
          ? segment.text.trim()
          : '';

      if (!text) {
        return null;
      }

      return `[${timestamp}] ${speaker}: ${text}`;
    })
    .filter(Boolean)
    .join('\n');
}

/**
 * Build analysis context.
 */
function buildAnalysisContext(
  analysisData
) {
  if (!analysisData) {
    return '';
  }

  let context = '';

  if (
    analysisData.executiveSummary
  ) {
    context +=
      `EXECUTIVE SUMMARY:\n${analysisData.executiveSummary}\n\n`;
  }

  if (
    Array.isArray(
      analysisData.keyDecisions
    ) &&
    analysisData.keyDecisions.length >
      0
  ) {
    context +=
      'KEY DECISIONS:\n';

    analysisData.keyDecisions.forEach(
      (decision) => {
        context +=
          `- ${
            decision.decision ||
            'Decision unavailable'
          }`;

        if (
          decision.timestamp !==
            null &&
          decision.timestamp !==
            undefined
        ) {
          context +=
            ` [${formatTimestamp(
              decision.timestamp
            )}]`;
        }

        context += '\n';
      }
    );

    context += '\n';
  }

  if (
    Array.isArray(
      analysisData.actionItems
    ) &&
    analysisData.actionItems.length >
      0
  ) {
    context +=
      'ACTION ITEMS:\n';

    analysisData.actionItems.forEach(
      (item) => {
        context +=
          `- ${
            item.task ||
            'Task unavailable'
          } ` +
          `(Owner: ${
            item.owner ||
            'Unassigned'
          }, Deadline: ${
            item.deadline ||
            'Not specified'
          })\n`;
      }
    );

    context += '\n';
  }

  if (
    Array.isArray(
      analysisData.risks
    ) &&
    analysisData.risks.length > 0
  ) {
    context +=
      'RISKS:\n';

    analysisData.risks.forEach(
      (risk) => {
        context +=
          `- ${
            risk.description ||
            'Risk unavailable'
          } ` +
          `(Severity: ${
            risk.severity ||
            'UNKNOWN'
          })\n`;
      }
    );

    context += '\n';
  }

  if (
    Array.isArray(
      analysisData.openQuestions
    ) &&
    analysisData.openQuestions.length >
      0
  ) {
    context +=
      'OPEN QUESTIONS:\n';

    analysisData.openQuestions.forEach(
      (question) => {
        context +=
          `- ${
            question.question ||
            'Question unavailable'
          } ` +
          `(Status: ${
            question.status ||
            'OPEN'
          })\n`;
      }
    );

    context += '\n';
  }

  return context.trim();
}

/**
 * Build relevant-segment context.
 */
function buildRelevantSegmentsContext(
  segments
) {
  if (
    !Array.isArray(segments) ||
    segments.length === 0
  ) {
    return '';
  }

  return segments
    .map((segment) => {
      const timestamp =
        formatTimestamp(
          segment.timestamp
        );

      const speaker =
        segment.speaker ||
        'Unknown Speaker';

      return `[${timestamp}] ${speaker}: ${
        segment.text || ''
      }`;
    })
    .join('\n');
}

/**
 * Format seconds as timestamp.
 */
function formatTimestamp(
  seconds
) {
  if (
    seconds === null ||
    seconds === undefined ||
    !Number.isFinite(
      Number(seconds)
    ) ||
    Number(seconds) < 0
  ) {
    return 'N/A';
  }

  const totalSeconds =
    Math.floor(
      Number(seconds)
    );

  const hours =
    Math.floor(
      totalSeconds / 3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60
    );

  const secs =
    totalSeconds % 60;

  if (hours > 0) {
    return (
      `${String(hours).padStart(2, '0')}:` +
      `${String(minutes).padStart(2, '0')}:` +
      `${String(secs).padStart(2, '0')}`
    );
  }

  return (
    `${String(minutes).padStart(2, '0')}:` +
    `${String(secs).padStart(2, '0')}`
  );
}

export const askMeetingSchema = {
  type: 'object',

  required: [
    'answer',
    'relevantSegments',
    'confidence'
  ],

  properties: {
    answer: {
      type: 'string'
    },

    relevantSegments: {
      type: 'array',

      items: {
        type: 'object',

        required: [
          'speaker',
          'timestamp',
          'text',
          'relevance'
        ],

        properties: {
          speaker: {
            type: 'string'
          },

          timestamp: {
            type: 'number'
          },

          text: {
            type: 'string'
          },

          relevance: {
            type: 'string'
          }
        }
      }
    },

    confidence: {
      type: 'number',
      minimum: 0,
      maximum: 1
    }
  }
};