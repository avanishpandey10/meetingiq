import React, {
  useMemo
} from 'react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

import Card from '../common/Card';

import {
  formatDuration
} from '../../utils/formatters';

import './AnalyticsView.css';

const CHART_COLORS = [
  '#4f46e5',
  '#10b981',
  '#f59e0b',
  '#ef4444'
];

const AnalyticsView = ({
  meeting,
  transcript,
  analysis
}) => {
  if (!meeting) {
    return null;
  }

  const speakerData =
    Array.isArray(
      transcript?.speakerStats
    )
      ? transcript.speakerStats
      : [];

  const actionStats =
    Array.isArray(
      analysis?.actionItems
    )
      ? analysis.actionItems
      : [];

  const actionByPriority =
    useMemo(
      () => [
        {
          name: 'High',
          value:
            actionStats.filter(
              (item) =>
                item.priority ===
                'HIGH'
            ).length
        },
        {
          name: 'Medium',
          value:
            actionStats.filter(
              (item) =>
                item.priority ===
                'MEDIUM'
            ).length
        },
        {
          name: 'Low',
          value:
            actionStats.filter(
              (item) =>
                item.priority ===
                'LOW'
            ).length
        }
      ],
      [actionStats]
    );

  const actionByStatus =
    useMemo(
      () => [
        {
          name: 'Pending',
          value:
            actionStats.filter(
              (item) =>
                item.status ===
                'PENDING'
            ).length
        },
        {
          name: 'In Progress',
          value:
            actionStats.filter(
              (item) =>
                item.status ===
                'IN_PROGRESS'
            ).length
        },
        {
          name: 'Completed',
          value:
            actionStats.filter(
              (item) =>
                item.status ===
                'COMPLETED'
            ).length
        }
      ],
      [actionStats]
    );

  const safeScore = (value) => {
    const numeric =
      Number(value);

    if (
      !Number.isFinite(
        numeric
      )
    ) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(0, numeric)
    );
  };

  return (
    <div className="analytics-view">
      <div className="analytics-grid">
        <Card
          title="Meeting Statistics"
          icon="📊"
        >
          <div className="analytics-stats-grid">
            <div className="analytics-stat-item">
              <div className="analytics-stat-value">
                {meeting.duration
                  ? formatDuration(
                      meeting.duration
                    )
                  : 'N/A'}
              </div>

              <div className="analytics-stat-label">
                Duration
              </div>
            </div>

            <div className="analytics-stat-item">
              <div className="analytics-stat-value">
                {
                  speakerData.length
                }
              </div>

              <div className="analytics-stat-label">
                Participants
              </div>
            </div>

            <div className="analytics-stat-item">
              <div className="analytics-stat-value">
                {analysis?.keyTopics
                  ?.length || 0}
              </div>

              <div className="analytics-stat-label">
                Topics
              </div>
            </div>

            <div className="analytics-stat-item">
              <div className="analytics-stat-value">
                {analysis
                  ?.keyDecisions
                  ?.length || 0}
              </div>

              <div className="analytics-stat-label">
                Decisions
              </div>
            </div>

            <div className="analytics-stat-item">
              <div className="analytics-stat-value">
                {actionStats.length}
              </div>

              <div className="analytics-stat-label">
                Action Items
              </div>
            </div>

            <div className="analytics-stat-item">
              <div className="analytics-stat-value">
                {analysis
                  ?.openQuestions
                  ?.length || 0}
              </div>

              <div className="analytics-stat-label">
                Open Questions
              </div>
            </div>

            <div className="analytics-stat-item">
              <div className="analytics-stat-value">
                {analysis?.risks
                  ?.length || 0}
              </div>

              <div className="analytics-stat-label">
                Risks
              </div>
            </div>

            <div className="analytics-stat-item">
              <div className="analytics-stat-value">
                {analysis
                  ?.blockers
                  ?.length || 0}
              </div>

              <div className="analytics-stat-label">
                Blockers
              </div>
            </div>
          </div>
        </Card>

        {speakerData.length > 0 && (
          <Card
            title="Speaking Distribution"
            icon="🎤"
          >
            <div className="analytics-chart-container">
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <BarChart
                  data={
                    speakerData
                  }
                  margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 10
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="speaker"
                  />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="totalTime"
                    fill="#4f46e5"
                    name="Speaking Time"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="speaker-percentages">
              {speakerData.map(
                (
                  speaker,
                  index
                ) => {
                  const percentage =
                    Number(
                      speaker.percentage
                    ) || 0;

                  return (
                    <div
                      key={
                        speaker.speaker ||
                        index
                      }
                      className="speaker-percentage"
                    >
                      <span className="speaker-name">
                        {speaker.speaker ||
                          'Unknown'}
                      </span>

                      <div className="percentage-bar">
                        <div
                          className="percentage-fill"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                percentage
                              )
                            )}%`
                          }}
                        />
                      </div>

                      <span className="percentage-value">
                        {percentage.toFixed(
                          1
                        )}
                        %
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </Card>
        )}

        {actionStats.length > 0 && (
          <div className="analytics-chart-grid">
            <Card
              title="Action Items by Priority"
              icon="🎯"
            >
              <div className="analytics-pie-container">
                <ResponsiveContainer
                  width="100%"
                  height={260}
                >
                  <PieChart>
                    <Pie
                      data={
                        actionByPriority
                      }
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label
                    >
                      {actionByPriority.map(
                        (
                          entry,
                          index
                        ) => (
                          <Cell
                            key={
                              entry.name
                            }
                            fill={
                              CHART_COLORS[
                                index %
                                  CHART_COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card
              title="Action Items by Status"
              icon="📋"
            >
              <div className="analytics-pie-container">
                <ResponsiveContainer
                  width="100%"
                  height={260}
                >
                  <PieChart>
                    <Pie
                      data={
                        actionByStatus
                      }
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label
                    >
                      {actionByStatus.map(
                        (
                          entry,
                          index
                        ) => (
                          <Cell
                            key={
                              entry.name
                            }
                            fill={
                              CHART_COLORS[
                                index %
                                  CHART_COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {analysis?.meetingScore && (
          <Card
            title="Meeting Effectiveness Score"
            icon="🎯"
          >
            <div className="analytics-score-dashboard">
              <div className="analytics-score-main">
                <div className="analytics-score-circle">
                  <div className="analytics-score-number">
                    {safeScore(
                      analysis
                        .meetingScore
                        .overall
                    )}
                  </div>

                  <div className="analytics-score-total">
                    / 100
                  </div>
                </div>

                <p className="analytics-score-description">
                  AI-derived meeting quality
                  indicator
                </p>
              </div>

              <div className="analytics-score-breakdown">
                {[
                  [
                    'Preparation',
                    analysis.meetingScore
                      .preparation
                  ],
                  [
                    'Decision Clarity',
                    analysis.meetingScore
                      .decisionClarity
                  ],
                  [
                    'Actionability',
                    analysis.meetingScore
                      .actionability
                  ],
                  [
                    'Ownership Clarity',
                    analysis.meetingScore
                      .ownershipClarity
                  ],
                  [
                    'Follow-up Clarity',
                    analysis.meetingScore
                      .followUpClarity
                  ]
                ].map(
                  ([label, value]) => {
                    const score =
                      safeScore(
                        value
                      );

                    return (
                      <div
                        key={label}
                        className="analytics-score-row"
                      >
                        <span>
                          {label}
                        </span>

                        <div className="analytics-score-bar">
                          <div
                            className="analytics-score-fill"
                            style={{
                              width: `${score}%`
                            }}
                          />
                        </div>

                        <strong>
                          {score}
                        </strong>
                      </div>
                    );
                  }
                )}
              </div>

              {Array.isArray(
                analysis
                  .meetingScore
                  .reasons
              ) &&
                analysis
                  .meetingScore
                  .reasons
                  .length > 0 && (
                  <div className="analytics-score-reasons">
                    <h4>
                      Score Explanation
                    </h4>

                    <ul>
                      {analysis.meetingScore.reasons.map(
                        (
                          reason,
                          index
                        ) => (
                          <li
                            key={
                              index
                            }
                          >
                            {reason}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnalyticsView;