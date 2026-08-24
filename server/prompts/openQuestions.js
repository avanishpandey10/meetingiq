/**
 * Open Questions Extraction Prompt
 *
 * Design goals:
 * - Find genuinely unresolved issues
 * - Ignore questions that were answered
 * - Preserve timestamps
 * - Avoid inventing unresolved problems
 */

export function openQuestionsPrompt(transcript) {
  return `
You are an expert meeting analyst specializing in identifying unresolved questions and issues.

MEETING TRANSCRIPT:
${transcript}

TASK:
Identify questions, issues, concerns, or decisions that remain unresolved at the end of the meeting.

AN OPEN QUESTION MAY BE:

- An explicit question that was not answered.
- An issue that was raised but not resolved.
- A decision that was explicitly deferred.
- A concern requiring future discussion.
- A matter where the participants clearly stated that more information or follow-up is required.

DO NOT INCLUDE:

- Questions that were answered during the meeting.
- Rhetorical questions.
- Statements of fact.
- Resolved problems.
- General suggestions.
- Issues that were clearly closed.

ANTI-HALLUCINATION RULES:

- Only include unresolved issues explicitly supported by the transcript.
- Do not infer missing questions.
- Do not create questions from general uncertainty.
- Do not mark an issue OPEN if the transcript clearly resolves it.

STATUS:
Use "OPEN" for unresolved items.
Use "RESOLVED" only if the schema requires it and the item is explicitly represented as resolved.

TIMESTAMP:
Use the timestamp where the unresolved issue/question was raised.

If no suitable timestamp is available, follow the schema's allowed representation rather than inventing a timestamp.

OUTPUT:
Return ONLY valid JSON matching the provided schema.

If there are no open questions:

{
  "questions": []
}
`.trim();
}