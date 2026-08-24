/**
 * Risk and Blocker Extraction Prompt
 *
 * Design goals:
 * - Separate future risks from current blockers
 * - Require explicit evidence
 * - Avoid inventing severity
 */

export function risksPrompt(transcript) {
  return `
You are an expert meeting analyst specializing in identifying risks and blockers.

MEETING TRANSCRIPT:
${transcript}

TASK:
Extract risks and blockers explicitly discussed during the meeting.

DEFINITIONS:

RISK:
A potential future problem or negative outcome that may occur.

Examples:
- A deadline might be missed.
- A migration might cause data loss.
- A dependency may delay delivery.

BLOCKER:
A current obstacle that is actively preventing or limiting progress.

Examples:
- Missing access.
- Broken integration.
- Unavailable dependency.
- Current unresolved technical issue preventing completion.

IMPORTANT DISTINCTION:

A concern about something that might happen is usually a RISK.

An issue currently preventing progress is usually a BLOCKER.

FOR EACH ITEM EXTRACT:

1. description
2. severity
3. timestamp
4. confidence

SEVERITY:

HIGH:
Clearly significant impact or immediate concern.

MEDIUM:
Meaningful concern but manageable.

LOW:
Minor or limited impact.

ANTI-HALLUCINATION RULES:

- Only extract explicitly discussed concerns.
- Do not create risks from neutral statements.
- Do not infer a blocker unless the transcript shows that progress is actually affected.
- Do not invent severity without supporting signals.
- Do not include concerns that were clearly resolved during the meeting.
- Do not invent timestamps.

OUTPUT:
Return ONLY valid JSON matching the provided schema.

If no risks exist:
"risks": []

If no blockers exist:
"blockers": []
`.trim();
}