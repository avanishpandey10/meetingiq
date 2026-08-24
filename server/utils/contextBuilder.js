import { formatTimestamp } from './helpers.js';

/**
 * Context Builder Utility
 *
 * Prepares meeting data for grounded LLM context.
 */

/**
 * Build structured meeting context.
 *
 * @param {Object} transcript
 * @param {Object|null} analysis
 * @returns {Object}
 */
export function buildMeetingContext(
  transcript,
  analysis = null
) {
  const context = {
    transcript: '',
    summary: '',
    decisions: [],
    actionItems: [],
    topics: [],
    risks: [],
    blockers: [],
    openQuestions: []
  };

  // ----------------------------------------------------------
  // TRANSCRIPT CONTEXT
  // ----------------------------------------------------------

  if (
    transcript &&
    Array.isArray(transcript.segments)
  ) {
    context.transcript =
      transcript.segments
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

  // ----------------------------------------------------------
  // ANALYSIS CONTEXT
  // ----------------------------------------------------------

  if (analysis) {
    context.summary =
      typeof analysis.executiveSummary ===
      'string'
        ? analysis.executiveSummary
        : '';

    context.decisions =
      Array.isArray(
        analysis.keyDecisions
      )
        ? analysis.keyDecisions
        : [];

    context.actionItems =
      Array.isArray(
        analysis.actionItems
      )
        ? analysis.actionItems
        : [];

    context.topics =
      Array.isArray(
        analysis.keyTopics
      )
        ? analysis.keyTopics
        : [];

    context.risks =
      Array.isArray(
        analysis.risks
      )
        ? analysis.risks
        : [];

    context.blockers =
      Array.isArray(
        analysis.blockers
      )
        ? analysis.blockers
        : [];

    context.openQuestions =
      Array.isArray(
        analysis.openQuestions
      )
        ? analysis.openQuestions
        : [];
  }

  return context;
}

/**
 * Build a grounded contextual prompt.
 *
 * @param {string} question
 * @param {Object} context
 * @returns {string}
 */
export function buildContextualPrompt(
  question,
  context
) {
  const safeQuestion =
    typeof question === 'string'
      ? question.trim()
      : '';

  let prompt =
    'MEETING CONTEXT:\n\n';

  // ----------------------------------------------------------
  // TRANSCRIPT
  // ----------------------------------------------------------

  if (context?.transcript) {
    prompt += 'TRANSCRIPT:\n';
    prompt += `${context.transcript}\n\n`;
  }

  // ----------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------

  if (context?.summary) {
    prompt +=
      `EXECUTIVE SUMMARY:\n${context.summary}\n\n`;
  }

  // ----------------------------------------------------------
  // DECISIONS
  // ----------------------------------------------------------

  if (
    Array.isArray(
      context?.decisions
    ) &&
    context.decisions.length > 0
  ) {
    prompt += 'KEY DECISIONS:\n';

    context.decisions.forEach(
      (decision) => {
        const timestamp =
          formatTimestamp(
            decision.timestamp
          );

        prompt +=
          `- ${decision.decision || 'Decision unavailable'} ` +
          `(at ${timestamp})\n`;
      }
    );

    prompt += '\n';
  }

  // ----------------------------------------------------------
  // ACTION ITEMS
  // ----------------------------------------------------------

  if (
    Array.isArray(
      context?.actionItems
    ) &&
    context.actionItems.length > 0
  ) {
    prompt += 'ACTION ITEMS:\n';

    context.actionItems.forEach(
      (item) => {
        prompt +=
          `- ${item.task || 'Task unavailable'} ` +
          `(Owner: ${item.owner || 'Unassigned'}, ` +
          `Deadline: ${item.deadline || 'Not specified'}, ` +
          `Priority: ${item.priority || 'MEDIUM'})\n`;
      }
    );

    prompt += '\n';
  }

  // ----------------------------------------------------------
  // RISKS
  // ----------------------------------------------------------

  if (
    Array.isArray(context?.risks) &&
    context.risks.length > 0
  ) {
    prompt += 'RISKS:\n';

    context.risks.forEach((risk) => {
      prompt +=
        `- ${risk.description || 'Risk unavailable'} ` +
        `(Severity: ${risk.severity || 'UNKNOWN'})\n`;
    });

    prompt += '\n';
  }

  // ----------------------------------------------------------
  // BLOCKERS
  // ----------------------------------------------------------

  if (
    Array.isArray(
      context?.blockers
    ) &&
    context.blockers.length > 0
  ) {
    prompt += 'BLOCKERS:\n';

    context.blockers.forEach(
      (blocker) => {
        prompt +=
          `- ${blocker.description || 'Blocker unavailable'} ` +
          `(Severity: ${blocker.severity || 'UNKNOWN'})\n`;
      }
    );

    prompt += '\n';
  }

  // ----------------------------------------------------------
  // OPEN QUESTIONS
  // ----------------------------------------------------------

  if (
    Array.isArray(
      context?.openQuestions
    ) &&
    context.openQuestions.length > 0
  ) {
    prompt += 'OPEN QUESTIONS:\n';

    context.openQuestions.forEach(
      (item) => {
        prompt +=
          `- ${item.question || 'Question unavailable'} ` +
          `(Status: ${item.status || 'OPEN'})\n`;
      }
    );

    prompt += '\n';
  }

  // ----------------------------------------------------------
  // USER QUESTION
  // ----------------------------------------------------------

  prompt +=
    `USER QUESTION:\n${safeQuestion}\n\n`;

  prompt +=
    'GROUNDING RULES:\n' +
    '- Answer ONLY from the provided meeting context.\n' +
    '- Do not invent facts.\n' +
    '- Do not invent speakers, deadlines, decisions, or tasks.\n' +
    '- If the answer is not supported by the meeting, say so clearly.\n';

  return prompt;
}

/**
 * Extract transcript segments relevant to a question.
 *
 * Uses lightweight keyword matching as a local fallback.
 * The LLM is still responsible for the final answer.
 *
 * @param {string} question
 * @param {Object} transcript
 * @param {string} answer
 * @returns {Array}
 */
export function extractRelevantSegments(
  question,
  transcript,
  answer = ''
) {
  if (
    !transcript ||
    !Array.isArray(
      transcript.segments
    )
  ) {
    return [];
  }

  const questionWords =
    extractKeywords(question);

  const answerWords =
    extractKeywords(answer);

  if (
    questionWords.length === 0 &&
    answerWords.length === 0
  ) {
    return [];
  }

  const scoredSegments =
    transcript.segments.map(
      (segment) => {
        const text =
          typeof segment.text ===
          'string'
            ? segment.text
            : '';

        const normalizedText =
          normalizeForSearch(
            text
          );

        let score = 0;

        // Question keywords have greater weight.
        questionWords.forEach(
          (word) => {
            if (
              normalizedText.includes(
                word
              )
            ) {
              score += 3;
            }
          }
        );

        // Answer keywords have lower weight.
        answerWords.forEach(
          (word) => {
            if (
              normalizedText.includes(
                word
              )
            ) {
              score += 1;
            }
          }
        );

        return {
          segment,
          score
        };
      }
    );

  return scoredSegments
    .filter(
      (item) => item.score > 0
    )
    .sort(
      (a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        const aTime =
          typeof a.segment.startTime ===
          'number'
            ? a.segment.startTime
            : Number.MAX_SAFE_INTEGER;

        const bTime =
          typeof b.segment.startTime ===
          'number'
            ? b.segment.startTime
            : Number.MAX_SAFE_INTEGER;

        return aTime - bTime;
      }
    )
    .slice(0, 5)
    .map(
      (item) => ({
        speaker:
          item.segment.speaker ||
          'Unknown Speaker',

        timestamp:
          item.segment.startTime ??
          null,

        text:
          item.segment.text || '',

        relevance:
          item.score
      })
    );
}

/**
 * Extract useful keywords.
 */
function extractKeywords(text) {
  if (
    typeof text !== 'string' ||
    !text.trim()
  ) {
    return [];
  }

  const stopWords =
    new Set([
      'what',
      'when',
      'where',
      'which',
      'who',
      'whom',
      'whose',
      'why',
      'how',
      'did',
      'does',
      'do',
      'was',
      'were',
      'will',
      'would',
      'could',
      'should',
      'about',
      'from',
      'into',
      'through',
      'during',
      'before',
      'after',
      'above',
      'below',
      'between',
      'the',
      'this',
      'that',
      'with',
      'have',
      'has',
      'had',
      'they',
      'them',
      'their',
      'there',
      'then',
      'than',
      'also',
      'just',
      'only'
    ]);

  return [
    ...new Set(
      normalizeForSearch(text)
        .split(/\s+/)
        .filter(
          (word) =>
            word.length > 3 &&
            !stopWords.has(word)
        )
    )
  ];
}

/**
 * Normalize text for keyword matching.
 */
function normalizeForSearch(text) {
  return String(text || '')
    .toLowerCase()
    .replace(
      /[^a-z0-9\s]/g,
      ' '
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim();
}