import React from 'react';
import { Link } from 'react-router-dom';

import Badge from '../common/Badge';
import { 
  CalendarIcon, 
  ClockIcon, 
  FileIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  RefreshIcon, 
  AlertIcon, 
  UploadIcon,
  FileTextIcon,
  InboxIcon
} from '../common/Icons';

import {
  formatDate,
  formatDuration,
  formatFileSize
} from '../../utils/formatters';

import './HistoryTable.css';

const HistoryTable = ({ meetings = [], onDelete }) => {
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

  const handleDelete = async (event, meetingId) => {
    event.preventDefault();
    event.stopPropagation();

    if (!meetingId) return;

    const confirmed = window.confirm('Are you sure you want to delete this meeting?');

    if (!confirmed) return;

    try {
      if (typeof onDelete === 'function') {
        await onDelete(meetingId);
      }
    } catch (error) {
      console.error('Failed to delete meeting:', error);
      window.alert('Failed to delete meeting.');
    }
  };

  if (!Array.isArray(meetings) || meetings.length === 0) {
    return (
      <div className="history-table">
        <div className="empty-state">
          <div className="empty-icon">
            <InboxIcon size={40} color="#9ca3af" />
          </div>

          <h3>No meetings found</h3>

          <p>Try changing your filters or upload a new meeting.</p>

          <Link to="/upload" className="btn btn-primary">
            <UploadIcon size={16} />
            Upload Meeting
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="history-table">
      {/* Desktop header */}
      <div className="table-header">
        <div className="col-meeting">
          <FileTextIcon size={14} /> Meeting
        </div>
        <div className="col-date">
          <CalendarIcon size={14} /> Date
        </div>
        <div className="col-duration">
          <ClockIcon size={14} /> Duration
        </div>
        <div className="col-size">
          <FileIcon size={14} /> Size
        </div>
        <div className="col-status">
          <CheckCircleIcon size={14} /> Status
        </div>
        <div className="col-actions">
          Actions
        </div>
      </div>

      {meetings.map((meeting) => (
        <div className="table-row" key={meeting._id}>
          <div className="col-meeting">
            <Link to={`/meetings/${meeting._id}`} className="meeting-link">
              <h4 className="meeting-title">
                {meeting.title || 'Untitled Meeting'}
              </h4>
              <p className="meeting-filename">
                <FileIcon size={12} />
                {meeting.originalFilename || 'Unknown file'}
              </p>
            </Link>
          </div>

          <div className="col-date">
            <CalendarIcon size={14} />
            {formatDate(meeting.createdAt)}
          </div>

          <div className="col-duration">
            <ClockIcon size={14} />
            {meeting.duration > 0 ? formatDuration(meeting.duration) : '—'}
          </div>

          <div className="col-size">
            <FileIcon size={14} />
            {formatFileSize(meeting.fileSize)}
          </div>

          <div className="col-status">
            {getStatusBadge(meeting.status)}
          </div>

          <div className="col-actions">
            <button
              type="button"
              className="btn btn-sm btn-outline btn-delete"
              onClick={(event) => handleDelete(event, meeting._id)}
              aria-label={`Delete ${meeting.title || 'meeting'}`}
              title="Delete meeting"
            >
              <TrashIcon size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryTable;