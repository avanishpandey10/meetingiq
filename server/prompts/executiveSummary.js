/**
 * Executive Summary Prompt
 *
 * Design goals:
 * - Outcome-focused
 * - Grounded in transcript
 * - Avoid chronological narration
 * - Highlight decisions and actions
 */

export function executiveSummaryPrompt(transcript) {
  return `
You are an expert meeting analyst.

MEETING TRANSCRIPT:
${transcript}

TASK:
Generate a concise executive summary that explains the most important outcomes of this meeting.

FOCUS ON:

1. What was decided
2. What was completed or resolved
3. What tasks were assigned
4. Important risks or blockers
5. Important unresolved issues
6. Major outcomes

DO NOT:
- Retell the meeting chronologically.
- Invent information.
- Add outside knowledge.
- Invent decisions.
- Invent action items.
- Add recommendations not discussed.
- Assume an outcome that was not explicitly established.

SUMMARY REQUIREMENTS:

- Approximately 100-200 words.
- Clear and professional.
- Focus on outcomes.
- Every important claim must be supported by the transcript.
- Avoid generic filler such as "The meeting was productive."

KEY OUTCOMES:

Return 3-7 concrete outcomes when available.

Each outcome must be:
- specific
- verifiable
- grounded in the transcript

SENTIMENT:

overallSentiment must be:
- positive
- neutral
- negative

Base sentiment only on the overall tone/content of the discussion, not assumptions about participants.

MEETING EFFECTIVENESS:

meetingEffectiveness is an AI-derived indicator from 0-100.

Consider observable evidence such as:
- decisions
- actionable tasks
- clear ownership
- follow-up planning
- unresolved issues

Do not treat this as a scientifically validated score.

If the transcript has insufficient evidence, use a moderate score and explain the limitation through the analysis rather than inventing evidence.

OUTPUT:
Return ONLY valid JSON matching the provided schema.
`.trim();
}