import React from 'react';
import { Link } from 'react-router-dom';

import Badge from '../common/Badge';
import { 
  MicIcon, 
  CalendarIcon, 
  ClockIcon, 
  GlobeIcon, 
  FileTextIcon, 
  UsersIcon,
  UploadIcon,
  CheckCircleIcon,
  AlertIcon,
  RefreshIcon
} from '../common/Icons';
import { formatDate, formatDuration } from '../../utils/formatters';

import './MeetingList.css';

const MeetingList = ({ meetings = [], loading = false }) => {
  if (loading) {
    return (
      <div className="meeting-list-loading">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-row" />
        <div className="skeleton skeleton-row" />
        <div className="skeleton skeleton-row" />
      </div>
    );
  }

  if (!Array.isArray(meetings) || meetings.length === 0) {
    return (
      <div className="meeting-list-empty">
        <div className="empty-icon">
          <MicIcon size={48} color="#9ca3af" />
        </div>

        <h3>No meetings yet</h3>

        <p>Upload your first meeting to get started</p>

        <Link to="/upload" className="btn btn-primary">
          <UploadIcon size={16} color="white" />
          Upload Meeting
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant="success">
            <CheckCircleIcon size={12} /> Completed
          </Badge>
        );

      case 'PROCESSING':
        return (
          <Badge variant="warning">
            <RefreshIcon size={12} className="spinning" /> Processing
          </Badge>
        );

      case 'FAILED':
        return (
          <Badge variant="danger">
            <AlertIcon size={12} /> Failed
          </Badge>
        );

      default:
        return (
          <Badge variant="default">
            <FileTextIcon size={12} /> Uploaded
          </Badge>
        );
    }
  };

  return (
    <div className="meeting-list">
      {meetings.map((meeting) => (
        <Link
          to={`/meetings/${meeting._id}`}
          key={meeting._id}
          className="meeting-card"
        >
          <div className="meeting-card-header">
            <h3 className="meeting-title">
              {meeting.title || 'Untitled Meeting'}
            </h3>

            {getStatusBadge(meeting.status)}
          </div>

          <div className="meeting-card-body">
            <div className="meeting-info">
              <span className="info-item">
                <CalendarIcon size={14} />
                {formatDate(meeting.createdAt)}
              </span>

              {meeting.duration > 0 && (
                <span className="info-item">
                  <ClockIcon size={14} />
                  {formatDuration(meeting.duration)}
                </span>
              )}

              {meeting.detectedLanguage && (
                <span className="info-item">
                  <GlobeIcon size={14} />
                  {String(meeting.detectedLanguage).toUpperCase()}
                </span>
              )}
            </div>

            <div className="meeting-stats">
              {typeof meeting.segmentCount === 'number' && (
                <span className="stat">
                  <FileTextIcon size={14} />
                  {meeting.segmentCount} segments
                </span>
              )}

              {typeof meeting.speakerCount === 'number' && (
                <span className="stat">
                  <UsersIcon size={14} />
                  {meeting.speakerCount} speakers
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MeetingList;