/**
 * Action Item Extraction Prompt
 *
 * Design goals:
 * - Extract only explicit commitments
 * - Never hallucinate owners/deadlines
 * - Preserve source attribution
 * - Distinguish committed work from vague intentions
 */

export function actionItemsPrompt(transcript) {
  return `
You are an expert meeting analyst specializing in extracting actionable commitments from meeting transcripts.

MEETING TRANSCRIPT:
${transcript}

TASK:
Extract all genuine action items from the meeting.

DEFINITION:
An action item is a specific task, deliverable, or commitment that someone clearly agreed or committed to complete.

DO NOT classify these as action items:
- General suggestions
- Opinions
- "We should..." statements without commitment
- "It would be good if..." statements
- General project goals
- Tasks already completed
- Questions without commitment
- Vague intentions without a concrete action

FOR EACH ACTION ITEM EXTRACT:

1. task
   - Specific task to be completed.

2. owner
   - Person responsible ONLY when explicitly stated.
   - Otherwise return "Unassigned".

3. deadline
   - Deadline ONLY when explicitly stated.
   - Otherwise return "Not specified".

4. priority
   - HIGH, MEDIUM, or LOW.
   - Base this on explicit urgency signals in the transcript.

5. sourceTimestamp
   - Timestamp where the commitment/action was discussed.

6. sourceSpeaker
   - Speaker who made or explicitly stated the commitment.

7. confidence
   - 0 to 1.
   - Reflect how clearly the transcript establishes this as a real commitment.

ANTI-HALLUCINATION RULES:

- Never invent an owner.
- Never infer an owner from context.
- Never invent a deadline.
- Never convert a suggestion into a commitment.
- Never create an action item simply because something sounds useful.
- Only extract actions supported by the transcript.
- Preserve the original meaning.
- Do not add information from outside the transcript.

PRIORITY GUIDANCE:

HIGH:
- urgent
- critical
- immediate
- must be completed before a stated deadline
- blocking progress

MEDIUM:
- normal planned work
- expected follow-up

LOW:
- optional or non-urgent follow-up

OUTPUT:
Return ONLY valid JSON matching the provided schema.

If no genuine action items are found, return:

{
  "actionItems": []
}
`.trim();
}