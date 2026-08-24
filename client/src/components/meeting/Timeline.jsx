import React from 'react';

import { 
  TopicsIcon, 
  CheckCircleIcon, 
  ActionIcon, 
  AlertIcon, 
  HelpCircleIcon,
  ClockIcon
} from '../common/Icons';
import { formatTimestamp } from '../../utils/formatters';

import './Timeline.css';

const Timeline = ({ timeline = [] }) => {
  if (!Array.isArray(timeline) || timeline.length === 0) {
    return (
      <div className="timeline-empty">
        <ClockIcon size={32} color="#9ca3af" />
        <p>No timeline events found for this meeting.</p>
      </div>
    );
  }

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'TOPIC_START':
        return <TopicsIcon size={16} />;
      case 'DECISION':
        return <CheckCircleIcon size={16} />;
      case 'ACTION_ITEM':
        return <ActionIcon size={16} />;
      case 'RISK':
      case 'BLOCKER':
        return <AlertIcon size={16} />;
      case 'QUESTION':
        return <HelpCircleIcon size={16} />;
      default:
        return <ClockIcon size={16} />;
    }
  };

  const getEventClass = (eventType) => {
    switch (eventType) {
      case 'DECISION': return 'timeline-event-decision';
      case 'ACTION_ITEM': return 'timeline-event-action';
      case 'RISK':
      case 'BLOCKER': return 'timeline-event-risk';
      case 'QUESTION': return 'timeline-event-question';
      default: return 'timeline-event-default';
    }
  };

  const formatEventType = (eventType) => {
    if (!eventType) return 'EVENT';
    return eventType.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const sortedTimeline = [...timeline].sort((a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0));

  return (
    <div className="timeline-view">
      <div className="timeline-header">
        <h3>Meeting Timeline</h3>
        <p>Important moments and events</p>
      </div>

      <div className="timeline-container">
        {sortedTimeline.map((event, index) => (
          <div key={event._id || `${event.eventType}-${event.timestamp}-${index}`} className="timeline-event">
            <div className="event-marker">
              <div className={`event-icon ${getEventClass(event.eventType)}`}>
                {getEventIcon(event.eventType)}
              </div>
              {index < sortedTimeline.length - 1 && <div className="event-line" />}
            </div>

            <div className="event-content">
              <div className="event-header">
                <span className="event-timestamp">
                  <ClockIcon size={12} /> {formatTimestamp(event.timestamp)}
                </span>
                <span className={`event-type ${getEventClass(event.eventType)}`}>
                  {formatEventType(event.eventType)}
                </span>
              </div>
              <p className="event-description">{event.description || 'No description available.'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;