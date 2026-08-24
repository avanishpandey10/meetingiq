import Meeting from '../models/Meeting.js';
import Transcript from '../models/Transcript.js';
import Analysis from '../models/Analysis.js';

import { formatTimestamp } from '../utils/helpers.js';

/**
 * Export Service
 *
 * Generates formatted meeting reports.
 */
export const exportService = {
  /**
   * Generate complete meeting report.
   */
  async generateMeetingReport(meetingId) {
    const meeting =
      await Meeting.findById(
        meetingId
      ).lean();

    if (!meeting) {
      throw new Error(
        'Meeting not found'
      );
    }

    const [
      transcript,
      analysis
    ] = await Promise.all([
      Transcript.findOne({
        meetingId
      }).lean(),

      Analysis.findOne({
        meetingId
      }).lean()
    ]);

    return {
      title:
        meeting.title ||
        'Untitled Meeting',

      generatedAt:
        new Date().toISOString(),

      meeting: {
        date:
          meeting.createdAt ||
          null,

        duration:
          meeting.duration ?? 0,

        language:
          meeting.detectedLanguage ||
          'unknown',

        status:
          meeting.status ||
          'UNKNOWN'
      },

      executiveSummary:
        analysis?.executiveSummary ||
        '',

      topics:
        Array.isArray(
          analysis?.keyTopics
        )
          ? analysis.keyTopics
          : [],

      decisions:
        Array.isArray(
          analysis?.keyDecisions
        )
          ? analysis.keyDecisions
          : [],

      actionItems:
        Array.isArray(
          analysis?.actionItems
        )
          ? analysis.actionItems
          : [],

      risks:
        Array.isArray(
          analysis?.risks
        )
          ? analysis.risks
          : [],

      blockers:
        Array.isArray(
          analysis?.blockers
        )
          ? analysis.blockers
          : [],

      openQuestions:
        Array.isArray(
          analysis?.openQuestions
        )
          ? analysis.openQuestions
          : [],

      timeline:
        Array.isArray(
          analysis?.timeline
        )
          ? analysis.timeline
          : [],

      meetingScore:
        analysis?.meetingScore ||
        null,

      transcript:
        transcript?.fullText ||
        '',

      speakerStats:
        Array.isArray(
          transcript?.speakerStats
        )
          ? transcript.speakerStats
          : []
    };
  },

  /**
   * Format report as plain text.
   */
  formatAsText(report) {
    const topics =
      Array.isArray(report.topics)
        ? report.topics
        : [];

    const decisions =
      Array.isArray(
        report.decisions
      )
        ? report.decisions
        : [];

    const actionItems =
      Array.isArray(
        report.actionItems
      )
        ? report.actionItems
        : [];

    const risks =
      Array.isArray(report.risks)
        ? report.risks
        : [];

    const blockers =
      Array.isArray(
        report.blockers
      )
        ? report.blockers
        : [];

    const openQuestions =
      Array.isArray(
        report.openQuestions
      )
        ? report.openQuestions
        : [];

    const timeline =
      Array.isArray(
        report.timeline
      )
        ? report.timeline
        : [];

    const speakerStats =
      Array.isArray(
        report.speakerStats
      )
        ? report.speakerStats
        : [];

    let text =
      `MEETING REPORT: ${report.title}\n`;

    text += `${'='.repeat(60)}\n\n`;

    text += `Date: ${this.formatDate(
      report.meeting?.date
    )}\n`;

    text += `Duration: ${this.safeTimestamp(
      report.meeting?.duration
    )}\n`;

    text += `Status: ${
      report.meeting?.status ||
      'UNKNOWN'
    }\n`;

    if (report.meeting?.language) {
      text += `Language: ${report.meeting.language}\n`;
    }

    text += '\n';

    // ----------------------------------------------------------
    // EXECUTIVE SUMMARY
    // ----------------------------------------------------------

    if (
      report.executiveSummary
    ) {
      text +=
        `EXECUTIVE SUMMARY\n${'-'.repeat(30)}\n`;

      text +=
        `${report.executiveSummary}\n\n`;
    }

    // ----------------------------------------------------------
    // TOPICS
    // ----------------------------------------------------------

    if (topics.length > 0) {
      text +=
        `DISCUSSION TOPICS\n${'-'.repeat(30)}\n`;

      topics.forEach(
        (topic, index) => {
          text +=
            `${index + 1}. ${
              topic.title ||
              'Untitled Topic'
            }\n`;

          text +=
            `   Time: ${this.safeTimestamp(
              topic.startTime
            )} - ${this.safeTimestamp(
              topic.endTime
            )}\n`;

          if (topic.summary) {
            text +=
              `   Summary: ${topic.summary}\n`;
          }

          text += '\n';
        }
      );
    }

    // ----------------------------------------------------------
    // DECISIONS
    // ----------------------------------------------------------

    if (decisions.length > 0) {
      text +=
        `KEY DECISIONS\n${'-'.repeat(30)}\n`;

      decisions.forEach(
        (decision, index) => {
          text +=
            `${index + 1}. ${
              decision.decision ||
              'Decision unavailable'
            }\n`;

          if (
            decision.timestamp !==
              null &&
            decision.timestamp !==
              undefined
          ) {
            text +=
              `   Timestamp: ${this.safeTimestamp(
                decision.timestamp
              )}\n`;
          }

          if (decision.context) {
            text +=
              `   Context: ${decision.context}\n`;
          }

          if (
            Array.isArray(
              decision.participants
            ) &&
            decision.participants.length >
              0
          ) {
            text +=
              `   Participants: ${decision.participants.join(
                ', '
              )}\n`;
          }

          text += '\n';
        }
      );
    }

    // ----------------------------------------------------------
    // ACTION ITEMS
    // ----------------------------------------------------------

    if (actionItems.length > 0) {
      text +=
        `ACTION ITEMS\n${'-'.repeat(30)}\n`;

      actionItems.forEach(
        (item, index) => {
          text +=
            `${index + 1}. ${
              item.task ||
              'Task unavailable'
            }\n`;

          text +=
            `   Owner: ${
              item.owner ||
              'Unassigned'
            }\n`;

          text +=
            `   Deadline: ${
              item.deadline ||
              'Not specified'
            }\n`;

          text +=
            `   Priority: ${
              item.priority ||
              'MEDIUM'
            }\n`;

          text +=
            `   Status: ${
              item.status ||
              'PENDING'
            }\n`;

          if (
            item.sourceTimestamp !==
              null &&
            item.sourceTimestamp !==
              undefined
          ) {
            text +=
              `   Source: ${this.safeTimestamp(
                item.sourceTimestamp
              )}\n`;
          }

          text += '\n';
        }
      );
    }

    // ----------------------------------------------------------
    // RISKS
    // ----------------------------------------------------------

    if (risks.length > 0) {
      text +=
        `RISKS\n${'-'.repeat(30)}\n`;

      risks.forEach(
        (risk, index) => {
          text +=
            `${index + 1}. ${
              risk.description ||
              'Risk description unavailable'
            }\n`;

          text +=
            `   Severity: ${
              risk.severity ||
              'UNKNOWN'
            }\n`;

          if (
            risk.timestamp !==
              null &&
            risk.timestamp !==
              undefined
          ) {
            text +=
              `   Timestamp: ${this.safeTimestamp(
                risk.timestamp
              )}\n`;
          }

          text += '\n';
        }
      );
    }

    // ----------------------------------------------------------
    // BLOCKERS
    // ----------------------------------------------------------

    if (blockers.length > 0) {
      text +=
        `BLOCKERS\n${'-'.repeat(30)}\n`;

      blockers.forEach(
        (blocker, index) => {
          text +=
            `${index + 1}. ${
              blocker.description ||
              'Blocker description unavailable'
            }\n`;

          text +=
            `   Severity: ${
              blocker.severity ||
              'UNKNOWN'
            }\n`;

          if (
            blocker.timestamp !==
              null &&
            blocker.timestamp !==
              undefined
          ) {
            text +=
              `   Timestamp: ${this.safeTimestamp(
                blocker.timestamp
              )}\n`;
          }

          text += '\n';
        }
      );
    }

    // ----------------------------------------------------------
    // OPEN QUESTIONS
    // ----------------------------------------------------------

    if (
      openQuestions.length > 0
    ) {
      text +=
        `OPEN QUESTIONS\n${'-'.repeat(30)}\n`;

      openQuestions.forEach(
        (question, index) => {
          text +=
            `${index + 1}. ${
              question.question ||
              'Question unavailable'
            }\n`;

          if (question.status) {
            text +=
              `   Status: ${question.status}\n`;
          }

          if (
            question.timestamp !==
              null &&
            question.timestamp !==
              undefined
          ) {
            text +=
              `   Timestamp: ${this.safeTimestamp(
                question.timestamp
              )}\n`;
          }

          text += '\n';
        }
      );
    }

    // ----------------------------------------------------------
    // SPEAKER STATISTICS
    // ----------------------------------------------------------

    if (
      speakerStats.length > 0
    ) {
      text +=
        `SPEAKER STATISTICS\n${'-'.repeat(30)}\n`;

      speakerStats.forEach(
        (speaker) => {
          text +=
            `${speaker.speaker || 'Unknown Speaker'}\n`;

          text +=
            `   Speaking Time: ${this.safeTimestamp(
              speaker.totalTime
            )}\n`;

          text +=
            `   Segments: ${
              speaker.segmentCount ??
              0
            }\n`;

          text +=
            `   Share: ${
              typeof speaker.percentage ===
              'number'
                ? `${speaker.percentage.toFixed(
                    2
                  )}%`
                : 'N/A'
            }\n\n`;
        }
      );
    }

    // ----------------------------------------------------------
    // TIMELINE
    // ----------------------------------------------------------

    if (timeline.length > 0) {
      text +=
        `MEETING TIMELINE\n${'-'.repeat(30)}\n`;

      timeline.forEach(
        (event) => {
          text +=
            `[${this.safeTimestamp(
              event.timestamp
            )}] ${
              event.eventType ||
              'EVENT'
            }: ${
              event.description ||
              ''
            }\n`;
        }
      );

      text += '\n';
    }

    // ----------------------------------------------------------
    // MEETING SCORE
    // ----------------------------------------------------------

    if (report.meetingScore) {
      const score =
        report.meetingScore;

      text +=
        `MEETING EFFECTIVENESS SCORE\n${'-'.repeat(30)}\n`;

      text +=
        `Overall: ${
          score.overall ??
          'N/A'
        }/100\n`;

      text +=
        `Preparation: ${
          score.preparation ??
          'N/A'
        }/100\n`;

      text +=
        `Decision Clarity: ${
          score.decisionClarity ??
          'N/A'
        }/100\n`;

      text +=
        `Actionability: ${
          score.actionability ??
          'N/A'
        }/100\n`;

      text +=
        `Ownership Clarity: ${
          score.ownershipClarity ??
          'N/A'
        }/100\n`;

      text +=
        `Follow-up Clarity: ${
          score.followUpClarity ??
          'N/A'
        }/100\n\n`;

      if (
        Array.isArray(
          score.reasons
        ) &&
        score.reasons.length > 0
      ) {
        text += 'Reasons:\n';

        score.reasons.forEach(
          (reason) => {
            text += `- ${reason}\n`;
          }
        );

        text += '\n';
      }

      if (
        Array.isArray(
          score.strengths
        ) &&
        score.strengths.length > 0
      ) {
        text += 'Strengths:\n';

        score.strengths.forEach(
          (strength) => {
            text += `- ${strength}\n`;
          }
        );

        text += '\n';
      }

      if (
        Array.isArray(
          score.improvements
        ) &&
        score.improvements.length > 0
      ) {
        text +=
          'Recommended Improvements:\n';

        score.improvements.forEach(
          (improvement) => {
            text += `- ${improvement}\n`;
          }
        );

        text += '\n';
      }
    }

    // ----------------------------------------------------------
    // TRANSCRIPT
    // ----------------------------------------------------------

    if (report.transcript) {
      text +=
        `FULL TRANSCRIPT\n${'-'.repeat(30)}\n`;

      text +=
        `${report.transcript}\n\n`;
    }

    text +=
      `${'='.repeat(60)}\n`;

    text +=
      `Generated by MeetingIQ on ${new Date().toLocaleString()}\n`;

    return text;
  },

  // ============================================================
  // FORMAT HTML
  // ============================================================

  formatAsHtml(report) {
    const topics =
      Array.isArray(report.topics)
        ? report.topics
        : [];

    const decisions =
      Array.isArray(
        report.decisions
      )
        ? report.decisions
        : [];

    const actionItems =
      Array.isArray(
        report.actionItems
      )
        ? report.actionItems
        : [];

    const risks =
      Array.isArray(report.risks)
        ? report.risks
        : [];

    const blockers =
      Array.isArray(
        report.blockers
      )
        ? report.blockers
        : [];

    const openQuestions =
      Array.isArray(
        report.openQuestions
      )
        ? report.openQuestions
        : [];

    const score =
      report.meetingScore;

    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meeting Report: ${this.escapeHtml(
    report.title
  )}</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 850px;
      margin: 0 auto;
      padding: 30px;
      color: #1f2937;
      line-height: 1.6;
    }

    h1 {
      color: #4f46e5;
      border-bottom: 2px solid #4f46e5;
      padding-bottom: 10px;
    }

    h2 {
      color: #111827;
      margin-top: 30px;
    }

    .section {
      margin-bottom: 30px;
    }

    .item {
      margin-bottom: 15px;
      padding: 14px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .meta {
      color: #6b7280;
      font-size: 14px;
    }

    .score {
      font-size: 30px;
      font-weight: bold;
      color: #4f46e5;
      margin: 10px 0;
    }

    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      background: #eef2ff;
      color: #3730a3;
      font-size: 12px;
    }

    .timeline {
      padding-left: 20px;
    }

    .timeline-item {
      margin-bottom: 10px;
    }

    .transcript {
      white-space: pre-wrap;
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
  </style>
</head>

<body>

  <h1>
    Meeting Report:
    ${this.escapeHtml(
      report.title
    )}
  </h1>

  <div class="meta">
    Date:
    ${this.escapeHtml(
      this.formatDate(
        report.meeting?.date
      )
    )}
    <br>

    Duration:
    ${this.escapeHtml(
      this.safeTimestamp(
        report.meeting?.duration
      )
    )}
    <br>

    Status:
    ${this.escapeHtml(
      report.meeting?.status ||
        'UNKNOWN'
    )}
    <br>

    ${
      report.meeting?.language
        ? `Language: ${this.escapeHtml(
            report.meeting.language
          )}<br>`
        : ''
    }
  </div>`;

    // ----------------------------------------------------------
    // SUMMARY
    // ----------------------------------------------------------

    if (
      report.executiveSummary
    ) {
      html += `
  <div class="section">
    <h2>Executive Summary</h2>
    <p>${this.escapeHtml(
      report.executiveSummary
    )}</p>
  </div>`;
    }

    // ----------------------------------------------------------
    // TOPICS
    // ----------------------------------------------------------

    if (topics.length > 0) {
      html += `
  <div class="section">
    <h2>Discussion Topics</h2>`;

      topics.forEach(
        (topic) => {
          html += `
    <div class="item">
      <strong>${this.escapeHtml(
        topic.title ||
          'Untitled Topic'
      )}</strong><br>

      <span class="meta">
        ${this.escapeHtml(
          this.safeTimestamp(
            topic.startTime
          )
        )}
        -
        ${this.escapeHtml(
          this.safeTimestamp(
            topic.endTime
          )
        )}
      </span><br>

      ${
        topic.summary
          ? this.escapeHtml(
              topic.summary
            )
          : ''
      }
    </div>`;
        }
      );

      html += `
  </div>`;
    }

    // ----------------------------------------------------------
    // DECISIONS
    // ----------------------------------------------------------

    if (decisions.length > 0) {
      html += `
  <div class="section">
    <h2>Key Decisions</h2>`;

      decisions.forEach(
        (decision) => {
          html += `
    <div class="item">
      <strong>${this.escapeHtml(
        decision.decision ||
          'Decision unavailable'
      )}</strong><br>

      ${
        decision.timestamp !==
          null &&
        decision.timestamp !==
          undefined
          ? `<span class="meta">
              Timestamp:
              ${this.escapeHtml(
                this.safeTimestamp(
                  decision.timestamp
                )
              )}
            </span><br>`
          : ''
      }

      ${
        decision.context
          ? `<span class="meta">
              ${this.escapeHtml(
                decision.context
              )}
            </span><br>`
          : ''
      }

      ${
        Array.isArray(
          decision.participants
        ) &&
        decision.participants.length >
          0
          ? `<span class="meta">
              Participants:
              ${this.escapeHtml(
                decision.participants.join(
                  ', '
                )
              )}
            </span>`
          : ''
      }
    </div>`;
        }
      );

      html += `
  </div>`;
    }

    // ----------------------------------------------------------
    // ACTION ITEMS
    // ----------------------------------------------------------

    if (actionItems.length > 0) {
      html += `
  <div class="section">
    <h2>Action Items</h2>`;

      actionItems.forEach(
        (item) => {
          html += `
    <div class="item">
      <strong>${this.escapeHtml(
        item.task ||
          'Task unavailable'
      )}</strong><br>

      <span class="meta">
        Owner:
        ${this.escapeHtml(
          item.owner ||
            'Unassigned'
        )}
        |
        Deadline:
        ${this.escapeHtml(
          item.deadline ||
            'Not specified'
        )}
        |
        Priority:
        ${this.escapeHtml(
          item.priority ||
            'MEDIUM'
        )}
        |
        Status:
        ${this.escapeHtml(
          item.status ||
            'PENDING'
        )}
      </span>
    </div>`;
        }
      );

      html += `
  </div>`;
    }

    // ----------------------------------------------------------
    // RISKS
    // ----------------------------------------------------------

    if (risks.length > 0) {
      html += `
  <div class="section">
    <h2>Risks</h2>`;

      risks.forEach(
        (risk) => {
          html += `
    <div class="item">
      <strong>${this.escapeHtml(
        risk.description ||
          'Risk description unavailable'
      )}</strong><br>

      <span class="meta">
        Severity:
        ${this.escapeHtml(
          risk.severity ||
            'UNKNOWN'
        )}
      </span>
    </div>`;
        }
      );

      html += `
  </div>`;
    }

    // ----------------------------------------------------------
    // BLOCKERS
    // ----------------------------------------------------------

    if (blockers.length > 0) {
      html += `
  <div class="section">
    <h2>Blockers</h2>`;

      blockers.forEach(
        (blocker) => {
          html += `
    <div class="item">
      <strong>${this.escapeHtml(
        blocker.description ||
          'Blocker description unavailable'
      )}</strong><br>

      <span class="meta">
        Severity:
        ${this.escapeHtml(
          blocker.severity ||
            'UNKNOWN'
        )}
      </span>
    </div>`;
        }
      );

      html += `
  </div>`;
    }

    // ----------------------------------------------------------
    // OPEN QUESTIONS
    // ----------------------------------------------------------

    if (
      openQuestions.length > 0
    ) {
      html += `
  <div class="section">
    <h2>Open Questions</h2>`;

      openQuestions.forEach(
        (question) => {
          html += `
    <div class="item">
      <strong>${this.escapeHtml(
        question.question ||
          'Question unavailable'
      )}</strong>

      ${
        question.status
          ? `<br><span class="badge">
              ${this.escapeHtml(
                question.status
              )}
            </span>`
          : ''
      }
    </div>`;
        }
      );

      html += `
  </div>`;
    }

    // ----------------------------------------------------------
    // MEETING SCORE
    // ----------------------------------------------------------

    if (score) {
      html += `
  <div class="section">
    <h2>Meeting Effectiveness Score</h2>

    <div class="score">
      ${this.escapeHtml(
        String(
          score.overall ??
            'N/A'
        )
      )}/100
    </div>

    <div class="meta">
      Preparation:
      ${this.escapeHtml(
        String(
          score.preparation ??
            'N/A'
        )
      )}

      |
      Decision Clarity:
      ${this.escapeHtml(
        String(
          score.decisionClarity ??
            'N/A'
        )
      )}

      |
      Actionability:
      ${this.escapeHtml(
        String(
          score.actionability ??
            'N/A'
        )
      )}

      |
      Ownership:
      ${this.escapeHtml(
        String(
          score.ownershipClarity ??
            'N/A'
        )
      )}

      |
      Follow-up:
      ${this.escapeHtml(
        String(
          score.followUpClarity ??
            'N/A'
        )
      )}
    </div>`;

      if (
        Array.isArray(
          score.reasons
        ) &&
        score.reasons.length > 0
      ) {
        html += `
    <h3>Reasons</h3>
    <ul>`;

        score.reasons.forEach(
          (reason) => {
            html += `
      <li>
        ${this.escapeHtml(
          reason
        )}
      </li>`;
          }
        );

        html += `
    </ul>`;
      }

      if (
        Array.isArray(
          score.improvements
        ) &&
        score.improvements.length > 0
      ) {
        html += `
    <h3>Recommended Improvements</h3>
    <ul>`;

        score.improvements.forEach(
          (improvement) => {
            html += `
      <li>
        ${this.escapeHtml(
          improvement
        )}
      </li>`;
          }
        );

        html += `
    </ul>`;
      }

      html += `
  </div>`;
    }

    // ----------------------------------------------------------
    // TIMELINE
    // ----------------------------------------------------------

    if (
      Array.isArray(
        report.timeline
      ) &&
      report.timeline.length > 0
    ) {
      html += `
  <div class="section">
    <h2>Meeting Timeline</h2>
    <div class="timeline">`;

      report.timeline.forEach(
        (event) => {
          html += `
      <div class="timeline-item">
        <strong>
          ${this.escapeHtml(
            this.safeTimestamp(
              event.timestamp
            )
          )}
        </strong>
        -
        ${this.escapeHtml(
          event.eventType ||
            'EVENT'
        )}
        :
        ${this.escapeHtml(
          event.description ||
            ''
        )}
      </div>`;
        }
      );

      html += `
    </div>
  </div>`;
    }

    // ----------------------------------------------------------
    // FULL TRANSCRIPT
    // ----------------------------------------------------------

    if (report.transcript) {
      html += `
  <div class="section">
    <h2>Full Transcript</h2>
    <div class="transcript">
      ${this.escapeHtml(
        report.transcript
      )}
    </div>
  </div>`;
    }

    // ----------------------------------------------------------
    // FOOTER
    // ----------------------------------------------------------

    html += `
  <hr>

  <p class="meta">
    Generated by MeetingIQ on
    ${this.escapeHtml(
      new Date().toLocaleString()
    )}
  </p>

</body>
</html>`;

    return html;
  },

  /**
   * Safely format timestamps.
   */
  safeTimestamp(seconds) {
    if (
      seconds === null ||
      seconds === undefined ||
      !Number.isFinite(
        Number(seconds)
      )
    ) {
      return 'N/A';
    }

    return formatTimestamp(
      Number(seconds)
    );
  },

  /**
   * Safely format dates.
   */
  formatDate(date) {
    if (!date) {
      return 'N/A';
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return 'N/A';
    }

    return parsed.toLocaleString();
  },

  /**
   * Escape text before injecting it into HTML.
   *
   * Important because AI-generated content can contain
   * characters that would otherwise be interpreted as HTML.
   */
  escapeHtml(value) {
    const text =
      String(value ?? '');

    return text
      .replace(
        /&/g,
        '&amp;'
      )
      .replace(
        /</g,
        '&lt;'
      )
      .replace(
        />/g,
        '&gt;'
      )
      .replace(
        /"/g,
        '&quot;'
      )
      .replace(
        /'/g,
        '&#039;'
      );
  }
};