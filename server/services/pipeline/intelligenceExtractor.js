import { getLlmService } from '../llm/llmService.js';
import { validateAnalysisData } from '../../utils/validators.js';

export const intelligenceExtractor = {

  /**
   * Extract all meeting intelligence using ONE LLM call.
   */
  async extractAll(transcript) {
    if (!transcript || !Array.isArray(transcript.segments) || transcript.segments.length === 0) {
      throw new Error('Transcript is empty. Cannot perform meeting analysis.');
    }

    const llmService = getLlmService();
    const transcriptText = this.prepareTranscriptText(transcript);

    if (!transcriptText.trim()) {
      throw new Error('Transcript text is empty.');
    }

    console.log('🧠 Starting ONE combined meeting analysis request...');

    let result;
    try {
      result = await llmService.generateStructuredResponse(
        this.buildSimplePrompt(transcriptText),
        this.getSimpleSchema(),
        {
          maxTokens: 3000,
          schemaName: 'meeting_intelligence'
        }
      );
    } catch (error) {
      console.error('❌ LLM analysis failed:', error);
      return this.getDefaultAnalysis();
    }

    if (!result || typeof result !== 'object') {
      console.warn('⚠️ LLM returned invalid response. Using defaults.');
      return this.getDefaultAnalysis();
    }

    console.log('📝 Raw LLM result:', JSON.stringify(result, null, 2).substring(0, 500));

    // Normalize all fields
    const analysis = {
      executiveSummary: this.normalizeString(result.executiveSummary || result.summary, ''),
      keyTopics: this.normalizeTopics(result.keyTopics || result.topics),
      keyDecisions: this.normalizeDecisions(result.keyDecisions || result.decisions),
      actionItems: this.normalizeActionItems(result.actionItems || result.actions),
      risks: this.normalizeRisks(result.risks),
      blockers: this.normalizeRisks(result.blockers),
      openQuestions: this.normalizeQuestions(result.openQuestions || result.questions),
      meetingScore: this.normalizeScore(result.meetingScore || result.score),
      rawAnalysis: result
    };

    // Always calculate score locally as backup/verification
    if (!analysis.meetingScore || this.isDefaultScore(analysis.meetingScore)) {
      console.log('⚠️ Calculating meeting score locally...');
      analysis.meetingScore = this.calculateLocalScore(analysis);
    }

    // Generate timeline
    analysis.timeline = this.generateTimeline(analysis);

    const validation = validateAnalysisData(analysis);
    if (!validation.isValid) {
      console.warn('⚠️ Analysis validation warnings:', validation.warnings);
    }

    console.log(`✅ Analysis complete:
      Topics: ${analysis.keyTopics.length}
      Decisions: ${analysis.keyDecisions.length}
      Action Items: ${analysis.actionItems.length}
      Risks: ${analysis.risks.length}
      Blockers: ${analysis.blockers.length}
      Open Questions: ${analysis.openQuestions.length}
      Timeline Events: ${analysis.timeline.length}
      Score: ${analysis.meetingScore?.overall || 'N/A'}`);

    return analysis;
  },

  /**
   * SIMPLE PROMPT - Less likely to confuse the model
   */
  buildSimplePrompt(transcript) {
    return `
Analyze this meeting transcript and extract key information.

TRANSCRIPT:
${transcript}

Return JSON with these fields:
1. "executiveSummary": A 2-3 sentence summary of what happened
2. "decisions": Array of {decision, context, timestamp, confidence}
3. "actionItems": Array of {task, owner, deadline, priority, sourceTimestamp, confidence}
4. "risks": Array of {description, severity, timestamp, confidence}
5. "openQuestions": Array of {question, timestamp}

RULES:
- Use ONLY information from the transcript
- If owner unknown, use "Unassigned"
- If deadline unknown, use "Not specified"
- timestamps must be numbers (seconds)
- confidence must be 0 to 1
- Return empty array if nothing found
- Do NOT invent data
`;
  },

  /**
   * SIMPLE SCHEMA
   */
  getSimpleSchema() {
    return {
      type: 'object',
      properties: {
        executiveSummary: { type: 'string' },
        decisions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              decision: { type: 'string' },
              context: { type: 'string' },
              timestamp: { type: 'number' },
              confidence: { type: 'number' }
            }
          }
        },
        actionItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              task: { type: 'string' },
              owner: { type: 'string' },
              deadline: { type: 'string' },
              priority: { type: 'string' },
              sourceTimestamp: { type: 'number' },
              confidence: { type: 'number' }
            }
          }
        },
        risks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              severity: { type: 'string' },
              timestamp: { type: 'number' },
              confidence: { type: 'number' }
            }
          }
        },
        openQuestions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              timestamp: { type: 'number' }
            }
          }
        }
      }
    };
  },

  /**
   * Calculate local score based on actual extracted data
   */
  calculateLocalScore(analysis) {
    const scores = {
      preparation: 50,
      decisionClarity: 50,
      actionability: 50,
      ownershipClarity: 50,
      followUpClarity: 50
    };

    const reasons = [];
    const strengths = [];
    const improvements = [];

    // Decision clarity
    if (analysis.keyDecisions.length > 0) {
      scores.decisionClarity = Math.min(90, 55 + analysis.keyDecisions.length * 15);
      reasons.push(`${analysis.keyDecisions.length} decisions identified`);
      strengths.push('Clear decisions were made');
    } else {
      scores.decisionClarity = 35;
      reasons.push('No clear decisions identified');
      improvements.push('Make clearer decisions');
    }

    // Actionability
    if (analysis.actionItems.length > 0) {
      scores.actionability = Math.min(90, 55 + analysis.actionItems.length * 10);
      reasons.push(`${analysis.actionItems.length} action items extracted`);
      strengths.push('Action items were identified');
    } else {
      scores.actionability = 35;
      reasons.push('No action items identified');
      improvements.push('Assign clear action items');
    }

    // Ownership clarity
    const assignedItems = analysis.actionItems.filter(item => 
      item.owner && item.owner !== 'Unassigned'
    ).length;
    
    if (assignedItems > 0 && analysis.actionItems.length > 0) {
      const ratio = assignedItems / analysis.actionItems.length;
      scores.ownershipClarity = Math.min(90, Math.round(50 + ratio * 40));
      reasons.push(`${assignedItems}/${analysis.actionItems.length} items have owners`);
      if (ratio >= 0.7) {
        strengths.push('Good ownership assignment');
      }
    } else if (analysis.actionItems.length > 0) {
      scores.ownershipClarity = 30;
      reasons.push('No items have clear owners');
      improvements.push('Assign owners to action items');
    }

    // Topics / Preparation
    if (analysis.keyTopics.length > 0) {
      scores.preparation = Math.min(85, 50 + analysis.keyTopics.length * 10);
      reasons.push(`${analysis.keyTopics.length} topics discussed`);
      strengths.push('Organized discussion');
    } else {
      scores.preparation = 40;
      reasons.push('No clear topic structure detected');
    }

    // Open questions / Follow-up
    if (analysis.openQuestions.length > 0) {
      scores.followUpClarity = Math.max(30, 60 - analysis.openQuestions.length * 15);
      reasons.push(`${analysis.openQuestions.length} open questions remain`);
      improvements.push('Resolve open questions before meeting ends');
    } else {
      scores.followUpClarity = 75;
      reasons.push('No unresolved questions');
      strengths.push('Clear follow-up');
    }

    // Risks
    if (analysis.risks.length > 0) {
      reasons.push(`${analysis.risks.length} risks identified`);
      improvements.push('Address identified risks');
    }

    const overall = Math.round(
      (scores.preparation + scores.decisionClarity + scores.actionability + 
       scores.ownershipClarity + scores.followUpClarity) / 5
    );

    return {
      overall,
      ...scores,
      reasons,
      strengths,
      improvements
    };
  },

  isDefaultScore(score) {
    if (!score) return true;
    return (
      score.overall === 50 &&
      score.preparation === 50 &&
      score.decisionClarity === 50 &&
      score.actionability === 50 &&
      score.ownershipClarity === 50 &&
      score.followUpClarity === 50
    );
  },

  getDefaultAnalysis() {
    return {
      executiveSummary: 'Analysis could not be completed.',
      keyTopics: [],
      keyDecisions: [],
      actionItems: [],
      risks: [],
      blockers: [],
      openQuestions: [],
      meetingScore: this.getDefaultScore(),
      timeline: [],
      rawAnalysis: {}
    };
  },

  getDefaultScore() {
    return {
      overall: 50,
      preparation: 50,
      decisionClarity: 50,
      actionability: 50,
      ownershipClarity: 50,
      followUpClarity: 50,
      reasons: ['Insufficient data for scoring'],
      strengths: [],
      improvements: []
    };
  },

  // ... Keep all normalization methods from previous code ...

  normalizeString(value, fallback = '') {
    return typeof value === 'string' ? value.trim() : fallback;
  },

  normalizeTimestamp(value) {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    
    if (typeof value === 'string') {
      const trimmed = value.trim();
      const numericValue = Number(trimmed);
      if (Number.isFinite(numericValue)) return numericValue;
      
      const timeMatch = trimmed.match(/^(?:(\d+):)?(\d+):(\d+)$/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1] || '0', 10);
        const minutes = parseInt(timeMatch[2], 10);
        const seconds = parseInt(timeMatch[3], 10);
        return hours * 3600 + minutes * 60 + seconds;
      }
    }
    return 0;
  },

  normalizeConfidence(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0.8;
    if (numeric > 1 && numeric <= 100) return numeric / 100;
    return Math.min(1, Math.max(0, numeric));
  },

  normalizePriority(priority) {
    if (!priority || typeof priority !== 'string') return 'MEDIUM';
    const upper = priority.toUpperCase().trim();
    if (upper.includes('HIGH') || upper === 'H') return 'HIGH';
    if (upper.includes('LOW') || upper === 'L') return 'LOW';
    return 'MEDIUM';
  },

  normalizeSeverity(severity) {
    if (!severity || typeof severity !== 'string') return 'MEDIUM';
    const upper = severity.toUpperCase().trim();
    if (upper.includes('HIGH') || upper.includes('CRITICAL')) return 'HIGH';
    if (upper.includes('LOW')) return 'LOW';
    return 'MEDIUM';
  },

  normalizeDecisions(decisions) {
    if (!Array.isArray(decisions)) return [];
    return decisions
      .filter(d => d && typeof d === 'object')
      .map((d, i) => ({
        decision: this.normalizeString(d.decision || d.text || d.title, `Decision ${i + 1}`),
        context: this.normalizeString(d.context || d.reason, ''),
        participants: Array.isArray(d.participants) ? d.participants : [],
        timestamp: this.normalizeTimestamp(d.timestamp),
        confidence: this.normalizeConfidence(d.confidence)
      }))
      .filter(d => d.decision.length > 0);
  },

  normalizeActionItems(items) {
    if (!Array.isArray(items)) return [];
    return items
      .filter(item => item && typeof item === 'object')
      .map((item, i) => ({
        task: this.normalizeString(item.task || item.description || item.action, `Task ${i + 1}`),
        owner: this.normalizeString(item.owner || item.assignedTo, 'Unassigned'),
        deadline: this.normalizeString(item.deadline || item.dueDate, 'Not specified'),
        priority: this.normalizePriority(item.priority),
        sourceTimestamp: this.normalizeTimestamp(item.sourceTimestamp || item.timestamp),
        sourceSpeaker: this.normalizeString(item.sourceSpeaker || item.speaker, ''),
        confidence: this.normalizeConfidence(item.confidence)
      }))
      .filter(item => item.task.length > 0);
  },

  normalizeRisks(risks) {
    if (!Array.isArray(risks)) return [];
    return risks
      .filter(r => r && typeof r === 'object')
      .map((r, i) => ({
        description: this.normalizeString(r.description || r.risk || r.issue, `Risk ${i + 1}`),
        severity: this.normalizeSeverity(r.severity),
        timestamp: this.normalizeTimestamp(r.timestamp),
        confidence: this.normalizeConfidence(r.confidence)
      }))
      .filter(r => r.description.length > 0);
  },

  normalizeQuestions(questions) {
    if (!Array.isArray(questions)) return [];
    return questions
      .filter(q => q && typeof q === 'object')
      .map((q, i) => ({
        question: this.normalizeString(q.question || q.text, `Question ${i + 1}`),
        status: q.status === 'RESOLVED' ? 'RESOLVED' : 'OPEN',
        timestamp: this.normalizeTimestamp(q.timestamp)
      }))
      .filter(q => q.question.length > 0);
  },

  normalizeTopics(topics) {
    if (!Array.isArray(topics)) return [];
    return topics
      .filter(t => t && typeof t === 'object')
      .map((t, i) => ({
        title: this.normalizeString(t.title || t.topic, `Topic ${i + 1}`),
        startTime: this.normalizeTimestamp(t.startTime),
        endTime: this.normalizeTimestamp(t.endTime),
        summary: this.normalizeString(t.summary || t.description, '')
      }))
      .filter(t => t.title.length > 0);
  },

  normalizeScore(score) {
    if (!score || typeof score !== 'object') return null;
    
    const normalizeNumber = (value) => {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return null;
      return Math.min(100, Math.max(0, numeric));
    };

    return {
      overall: normalizeNumber(score.overall),
      preparation: normalizeNumber(score.preparation),
      decisionClarity: normalizeNumber(score.decisionClarity),
      actionability: normalizeNumber(score.actionability),
      ownershipClarity: normalizeNumber(score.ownershipClarity),
      followUpClarity: normalizeNumber(score.followUpClarity),
      reasons: Array.isArray(score.reasons) ? score.reasons : [],
      strengths: Array.isArray(score.strengths) ? score.strengths : [],
      improvements: Array.isArray(score.improvements) ? score.improvements : []
    };
  },

  prepareTranscriptText(transcript) {
    return transcript.segments
      .map((segment) => {
        const timestamp = this.formatTimestamp(segment.startTime);
        const speaker = segment.speaker || 'Unknown Speaker';
        const text = typeof segment.text === 'string' ? segment.text.trim() : '';
        if (!text) return null;
        return `[${timestamp}] ${speaker}: ${text}`;
      })
      .filter(Boolean)
      .join('\n');
  },

  formatTimestamp(seconds) {
    const value = Number(seconds);
    if (!Number.isFinite(value) || value < 0) return '00:00:00';
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const secs = Math.floor(value % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  },

  generateTimeline(analysis) {
    const timeline = [];

    for (const topic of analysis.keyTopics) {
      if (Number.isFinite(Number(topic.startTime))) {
        timeline.push({
          timestamp: Number(topic.startTime),
          eventType: 'TOPIC_START',
          description: `Topic: ${topic.title}`
        });
      }
    }

    for (const decision of analysis.keyDecisions) {
      if (Number.isFinite(Number(decision.timestamp))) {
        timeline.push({
          timestamp: Number(decision.timestamp),
          eventType: 'DECISION',
          description: `Decision: ${decision.decision}`
        });
      }
    }

    for (const item of analysis.actionItems) {
      if (Number.isFinite(Number(item.sourceTimestamp))) {
        timeline.push({
          timestamp: Number(item.sourceTimestamp),
          eventType: 'ACTION_ITEM',
          description: `Action: ${item.task} (${item.owner || 'Unassigned'})`
        });
      }
    }

    for (const risk of analysis.risks) {
      if (Number.isFinite(Number(risk.timestamp))) {
        timeline.push({
          timestamp: Number(risk.timestamp),
          eventType: 'RISK',
          description: `Risk: ${risk.description}`
        });
      }
    }

    for (const blocker of analysis.blockers) {
      if (Number.isFinite(Number(blocker.timestamp))) {
        timeline.push({
          timestamp: Number(blocker.timestamp),
          eventType: 'BLOCKER',
          description: `Blocker: ${blocker.description}`
        });
      }
    }

    for (const question of analysis.openQuestions) {
      if (Number.isFinite(Number(question.timestamp))) {
        timeline.push({
          timestamp: Number(question.timestamp),
          eventType: 'QUESTION',
          description: `Question: ${question.question}`
        });
      }
    }

    return timeline.sort((a, b) => a.timestamp - b.timestamp);
  }
};