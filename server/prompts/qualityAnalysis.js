/**
 * Meeting Quality Analysis Prompt
 *
 * Design goals:
 * - Explainable scoring
 * - Observable evidence
 * - Avoid subjective judgments
 */

export function qualityAnalysisPrompt(transcript) {
  return `
You are an expert analyst evaluating meeting effectiveness.

MEETING TRANSCRIPT:
${transcript}

TASK:
Evaluate this meeting based ONLY on observable evidence in the transcript.

EVALUATION CRITERIA:

1. preparation
   - Evidence of agenda, preparation, objectives, or planned discussion.

2. decisionClarity
   - Whether decisions were clearly discussed and finalized.

3. actionability
   - Whether clear action items were identified.

4. ownershipClarity
   - Whether responsibilities were clearly assigned.

5. followUpClarity
   - Whether deadlines, next steps, or follow-up plans were clearly established.

SCORING:

Each criterion must receive a score from 0-100.

Use the following principles:

90-100:
Very strong observable evidence.

75-89:
Strong evidence with minor gaps.

60-74:
Moderate evidence.

40-59:
Limited evidence.

0-39:
Very little evidence.

IMPORTANT:

- Score only what can be observed.
- Do not assume preparation without evidence.
- Do not assume ownership when owners were not explicitly identified.
- Do not use emotional tone as the basis for quality scoring.
- Do not invent decisions or tasks.
- Do not punish the meeting simply because a topic was not relevant to the transcript.

OVERALL SCORE:

Calculate overall as a reasonable weighted combination of the five criteria.

Provide:
- 3-7 specific reasons
- strengths based on observable evidence
- improvements based on observable gaps

Do not claim that the score is scientifically validated.

OUTPUT:
Return ONLY valid JSON matching the provided schema.
`.trim();
}