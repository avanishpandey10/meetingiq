/**
 * Topic Segmentation Prompt
 *
 * Design goals:
 * - Meaningful thematic segmentation
 * - Useful timestamps
 * - Avoid overly granular topics
 */

export function topicsPrompt(transcript) {
  return `
You are an expert meeting analyst specializing in topic segmentation.

MEETING TRANSCRIPT:
${transcript}

TASK:
Divide the meeting into meaningful discussion topics based on the actual conversation flow.

REQUIREMENTS:

1. Each topic must represent a distinct subject area.
2. Each topic must have a clear start time and end time.
3. Topics should be ordered chronologically.
4. Topics should represent meaningful sections, not individual sentences.
5. Avoid unnecessary fragmentation.
6. For meetings under one hour, prefer no more than 10 topics.
7. Do not create a topic that is only a vague label such as "Discussion".

TOPIC FIELDS:

title:
- 3-7 words.
- Specific and descriptive.

startTime:
- Timestamp where the topic begins.

endTime:
- Timestamp where the topic ends.

summary:
- 1-2 concise sentences.
- Must describe actual content from the transcript.

IMPORTANT:

- Use only timestamps present in the transcript.
- Do not invent timestamps.
- Do not invent discussion topics.
- Topics should cover the major flow of the meeting.
- If two adjacent sections are about the same subject, prefer combining them.
- Minor interruptions should not create separate topics.

ORDER:

Return topics in chronological order.

OUTPUT:
Return ONLY valid JSON matching the provided schema.

Example:

{
  "topics": [
    {
      "title": "Backend Progress Update",
      "startTime": 0,
      "endTime": 28.3,
      "summary": "The team reviewed backend API completion and authentication status."
    }
  ]
}
`.trim();
}