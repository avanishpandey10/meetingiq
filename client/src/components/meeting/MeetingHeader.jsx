import React from 'react';
import { useNavigate } from 'react-router-dom';

import Badge from '../common/Badge';
import { 
  CalendarIcon, 
  ClockIcon, 
  GlobeIcon, 
  FileTextIcon, 
  ArrowLeftIcon,
  CheckCircleIcon,
  RefreshIcon,
  AlertIcon
} from '../common/Icons';
import { formatDate, formatDuration } from '../../utils/formatters';

import './MeetingHeader.css';

const MeetingHeader = ({ meeting }) => {
  const navigate = useNavigate();

  if (!meeting) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success"><CheckCircleIcon size={12} /> Completed</Badge>;
      case 'PROCESSING':
        return <Badge variant="warning"><RefreshIcon size={12} className="spinning" /> Processing</Badge>;
      case 'FAILED':
        return <Badge variant="danger"><AlertIcon size={12} /> Failed</Badge>;
      default:
        return <Badge variant="default">Uploaded</Badge>;
    }
  };

  const handleExport = () => {
    if (!meeting._id) return;
    window.open(
      `/api/export/meetings/${meeting._id}/export?format=html`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="meeting-header">
      <div className="meeting-title-section">
        <h1 className="meeting-header-title">
          {meeting.title || 'Untitled Meeting'}
        </h1>

        <div className="meeting-meta">
          {getStatusBadge(meeting.status)}

          <span className="meeting-date">
            <CalendarIcon size={14} /> {formatDate(meeting.createdAt)}
          </span>

          {meeting.duration > 0 && (
            <span className="meeting-duration">
              <ClockIcon size={14} /> {formatDuration(meeting.duration)}
            </span>
          )}

          {meeting.detectedLanguage && (
            <span className="meeting-language">
              <GlobeIcon size={14} /> {String(meeting.detectedLanguage).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      <div className="meeting-actions">
        <button type="button" className="meeting-header-btn" onClick={handleExport}>
          <FileTextIcon size={16} /> Export
        </button>

        <button type="button" className="meeting-header-btn" onClick={() => navigate(-1)}>
          <ArrowLeftIcon size={16} /> Back
        </button>
      </div>
    </div>
  );
};

export default MeetingHeader;