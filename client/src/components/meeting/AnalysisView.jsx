import React from 'react';

import Card from '../common/Card';
import { 
  FileTextIcon, 
  CheckCircleIcon, 
  TopicsIcon, 
  AnalyticsIcon,
  ClockIcon,
  UsersIcon,
  TrendingUpIcon,
  AlertIcon
} from '../common/Icons';
import { formatTimestamp } from '../../utils/formatters';

import './AnalysisView.css';

const AnalysisView = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="analysis-view-empty">
        <FileTextIcon size={32} color="#9ca3af" />
        <p>No analysis available for this meeting yet.</p>
      </div>
    );
  }

  const decisions = Array.isArray(analysis.keyDecisions) ? analysis.keyDecisions : [];
  const topics = Array.isArray(analysis.keyTopics) ? analysis.keyTopics : [];
  const score = analysis.meetingScore;

  const safeScore = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return Math.min(100, Math.max(0, numeric));
  };

  return (
    <div className="analysis-view">
      {analysis.executiveSummary && (
        <Card
          title="Executive Summary"
          icon={<FileTextIcon size={20} color="#4f46e5" />}
          className="analysis-summary-card"
        >
          <p className="analysis-summary-text">{analysis.executiveSummary}</p>
        </Card>
      )}

      {decisions.length > 0 && (
        <Card
          title="Key Decisions"
          icon={<CheckCircleIcon size={20} color="#10b981" />}
          subtitle={`${decisions.length} decisions made`}
        >
          <div className="analysis-decisions-list">
            {decisions.map((decision, index) => (
              <div key={decision._id || `decision-${index}`} className="analysis-decision-item">
                <div className="analysis-decision-header">
                  <p className="analysis-decision-text">{decision.decision}</p>
                  {typeof decision.confidence === 'number' && (
                    <span className="analysis-confidence">
                      <CheckCircleIcon size={12} />
                      {Math.round(decision.confidence * 100)}% confidence
                    </span>
                  )}
                </div>

                {decision.context && (
                  <p className="analysis-decision-context">{decision.context}</p>
                )}

                <div className="analysis-decision-meta">
                  {typeof decision.timestamp === 'number' && (
                    <span>
                      <ClockIcon size={12} /> {formatTimestamp(decision.timestamp)}
                    </span>
                  )}
                  {Array.isArray(decision.participants) && decision.participants.length > 0 && (
                    <span>
                      <UsersIcon size={12} /> {decision.participants.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {topics.length > 0 && (
        <Card
          title="Discussion Topics"
          icon={<TopicsIcon size={20} color="#7c3aed" />}
          subtitle="Meeting agenda breakdown"
        >
          <div className="analysis-topics-list">
            {topics.map((topic, index) => {
              const start = Number(topic.startTime);
              const end = Number(topic.endTime);
              const duration = Number.isFinite(start) && Number.isFinite(end) ? Math.max(0, end - start) : 0;

              return (
                <div key={topic._id || `topic-${index}`} className="analysis-topic-item">
                  <div className="analysis-topic-header">
                    <h4>{topic.title}</h4>
                    <span>
                      <ClockIcon size={12} />
                      {formatTimestamp(topic.startTime)} - {formatTimestamp(topic.endTime)}
                    </span>
                  </div>

                  {duration > 0 && (
                    <div className="analysis-topic-duration">
                      Duration: {formatTimestamp(duration)}
                    </div>
                  )}

                  {topic.summary && (
                    <p className="analysis-topic-summary">{topic.summary}</p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {score && (
        <Card
          title="Meeting Effectiveness"
          icon={<AnalyticsIcon size={20} color="#f59e0b" />}
          subtitle="AI-derived quality indicators"
        >
          <div className="analysis-score-overview">
            <div className="analysis-score-circle">
              <div className="analysis-score-number">{safeScore(score.overall)}</div>
              <div className="analysis-score-label">/ 100</div>
            </div>

            <div className="analysis-score-details">
              {[
                ['Preparation', score.preparation],
                ['Decision Clarity', score.decisionClarity],
                ['Actionability', score.actionability],
                ['Ownership Clarity', score.ownershipClarity],
                ['Follow-up Clarity', score.followUpClarity]
              ].map(([label, value]) => {
                const safeValue = safeScore(value);
                return (
                  <div key={label} className="analysis-score-item">
                    <span>{label}</span>
                    <div className="analysis-score-bar">
                      <div className="analysis-score-fill" style={{ width: `${safeValue}%` }} />
                    </div>
                    <strong>{safeValue}</strong>
                  </div>
                );
              })}
            </div>
          </div>

          {Array.isArray(score.reasons) && score.reasons.length > 0 && (
            <div className="analysis-score-reasons">
              <h4><AlertIcon size={14} /> Why this score?</h4>
              <ul>
                {score.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(score.strengths) && score.strengths.length > 0 && (
            <div className="analysis-score-reasons">
              <h4><TrendingUpIcon size={14} /> Strengths</h4>
              <ul>
                {score.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(score.improvements) && score.improvements.length > 0 && (
            <div className="analysis-score-reasons">
              <h4><AlertIcon size={14} /> Improvements</h4>
              <ul>
                {score.improvements.map((improvement, index) => (
                  <li key={index}>{improvement}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AnalysisView;