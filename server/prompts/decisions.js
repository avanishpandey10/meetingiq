/**
 * Decision Extraction Prompt
 *
 * Design goals:
 * - Distinguish decisions from discussions
 * - Require explicit agreement
 * - Preserve source traceability
 * - Avoid treating suggestions as final decisions
 */

export function decisionsPrompt(transcript) {
  return `
You are an expert meeting analyst specializing in identifying explicit decisions.

MEETING TRANSCRIPT:
${transcript}

TASK:
Extract all final decisions made during the meeting.

DEFINITION:
A decision is a clear final agreement, approval, selection, or commitment reached by the participants.

DO NOT classify these as decisions:
- Suggestions
- Opinions
- Questions
- Proposals that were not accepted
- "Maybe we should..."
- "We could..."
- "I think..."
- Discussion without a final agreement
- Future possibilities without confirmation

FOR EACH DECISION EXTRACT:

1. decision
   - The exact decision that was finalized.

2. context
   - Reason or context only when explicitly stated.

3. participants
   - Speakers explicitly involved in making/agreement around the decision.
   - If unclear, use an empty array.

4. timestamp
   - Timestamp where the decision was finalized.

5. confidence
   - 0 to 1.
   - High confidence means the transcript clearly shows final agreement.

ANTI-HALLUCINATION RULES:

- Extract only explicit final decisions.
- Do not infer decisions from discussion.
- Do not turn recommendations into decisions.
- Do not invent participants.
- Do not invent context.
- Do not invent timestamps.
- If no final decision exists, return an empty array.

IMPORTANT:
A statement such as "Let's deploy on Friday" is only a decision when the transcript indicates that the participants actually agreed or accepted it.

OUTPUT:
Return ONLY valid JSON matching the provided schema.

If no decisions were made:

{
  "decisions": []
}
`.trim();
}