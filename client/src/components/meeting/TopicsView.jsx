import React from 'react';

import { TopicsIcon, ClockIcon } from '../common/Icons';
import { formatTimestamp } from '../../utils/formatters';

import './TopicsView.css';

const TopicsView = ({ topics = [] }) => {
  if (!Array.isArray(topics) || topics.length === 0) {
    return (
      <div className="topics-empty">
        <TopicsIcon size={32} color="#9ca3af" />
        <p>No topics identified for this meeting.</p>
      </div>
    );
  }

  const safeDuration = (start, end) => {
    const startTime = Number(start);
    const endTime = Number(end);
    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) return 0;
    return Math.max(0, endTime - startTime);
  };

  return (
    <div className="topics-view">
      <div className="topics-header">
        <h3><TopicsIcon size={20} color="#4f46e5" /> Discussion Topics</h3>
        <p>Meeting agenda breakdown with timestamps</p>
      </div>

      <div className="topics-timeline">
        {topics.map((topic, index) => {
          const duration = safeDuration(topic.startTime, topic.endTime);

          return (
            <div key={topic._id || `topic-${index}`} className="topic-card">
              <div className="topic-timeline-indicator">
                <div className="timeline-dot" />
                {index < topics.length - 1 && <div className="timeline-line" />}
              </div>

              <div className="topic-content">
                <div className="topic-header">
                  <h4 className="topic-title">{topic.title || 'Untitled Topic'}</h4>
                  <span className="topic-time">
                    <ClockIcon size={12} />
                    {formatTimestamp(topic.startTime)} - {formatTimestamp(topic.endTime)}
                  </span>
                </div>

                {duration > 0 && (
                  <div className="topic-duration">
                    Duration: {formatTimestamp(duration)}
                  </div>
                )}

                {topic.summary && (
                  <p className="topic-summary">{topic.summary}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopicsView;