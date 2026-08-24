import React, { useMemo, useState } from 'react';

import Badge from '../common/Badge';
import { 
  AlertIcon, 
  ClockIcon, 
  UserIcon, 
  CalendarIcon, 
  TargetIcon, 
  CheckCircleIcon, 
  RefreshIcon,
  MicIcon,
  InboxIcon
} from '../common/Icons';
import { formatTimestamp } from '../../utils/formatters';

import './ActionItems.css';

const ActionItems = ({ actionItems = [], onStatusChange }) => {
  const [filter, setFilter] = useState('all');

  const safeItems = Array.isArray(actionItems) ? actionItems : [];

  const filteredItems = useMemo(() => {
    return safeItems.filter((item) => {
      if (filter === 'all') return true;
      if (filter === 'unassigned') return !item.owner || item.owner === 'Unassigned';
      if (filter === 'high') return item.priority === 'HIGH';
      return item.status === filter.toUpperCase();
    });
  }, [safeItems, filter]);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <Badge variant="danger"><AlertIcon size={12} /> HIGH</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning"><TargetIcon size={12} /> MEDIUM</Badge>;
      case 'LOW':
        return <Badge variant="info"><CheckCircleIcon size={12} /> LOW</Badge>;
      default:
        return <Badge variant="default">Unknown</Badge>;
    }
  };

  const getFilterIcon = (filterType) => {
    switch (filterType) {
      case 'all': return <InboxIcon size={14} />;
      case 'pending': return <ClockIcon size={14} />;
      case 'in_progress': return <RefreshIcon size={14} />;
      case 'completed': return <CheckCircleIcon size={14} />;
      case 'unassigned': return <UserIcon size={14} />;
      case 'high': return <AlertIcon size={14} />;
      default: return null;
    }
  };

  const handleStatusChange = async (itemId, status) => {
    if (typeof onStatusChange !== 'function') return;
    try {
      await onStatusChange(itemId, status);
    } catch (error) {
      console.error('Failed to update action item:', error);
    }
  };

  const filterButtons = [
    { id: 'all', label: `All (${safeItems.length})` },
    { id: 'pending', label: 'Pending' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'unassigned', label: 'Unassigned' },
    { id: 'high', label: 'High Priority' }
  ];

  return (
    <div className="meeting-action-items">
      <div className="action-filter-buttons">
        {filterButtons.map((btn) => (
          <button
            key={btn.id}
            type="button"
            className={`action-filter-btn ${filter === btn.id ? 'active' : ''}`}
            onClick={() => setFilter(btn.id)}
          >
            {getFilterIcon(btn.id)}
            {btn.label}
          </button>
        ))}
      </div>

      <div className="action-items-table">
        <div className="action-table-header">
          <div><InboxIcon size={14} /> Task</div>
          <div><UserIcon size={14} /> Owner</div>
          <div><CalendarIcon size={14} /> Deadline</div>
          <div><TargetIcon size={14} /> Priority</div>
          <div><CheckCircleIcon size={14} /> Status</div>
          <div><ClockIcon size={14} /> Source</div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="action-no-items">
            <InboxIcon size={32} color="#9ca3af" />
            <p>No action items found.</p>
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div key={item._id || `action-${index}`} className="action-table-row">
              <div className="action-col-task">
                <p className="action-task-text">{item.task || 'Unnamed task'}</p>
                {typeof item.confidence === 'number' && (
                  <span className="action-confidence">
                    <CheckCircleIcon size={12} />
                    {Math.round(item.confidence * 100)}% confidence
                  </span>
                )}
              </div>

              <div className="action-col-owner">
                <span className={!item.owner || item.owner === 'Unassigned' ? 'action-unassigned' : ''}>
                  {item.owner === 'Unassigned' || !item.owner ? (
                    <><AlertIcon size={12} color="#ef4444" /> Unassigned</>
                  ) : (
                    <><UserIcon size={12} /> {item.owner}</>
                  )}
                </span>
              </div>

              <div className="action-col-deadline">
                {item.deadline === 'Not specified' || !item.deadline ? (
                  <span className="action-not-specified">—</span>
                ) : (
                  <span className="action-deadline">
                    <CalendarIcon size={12} /> {item.deadline}
                  </span>
                )}
              </div>

              <div className="action-col-priority">
                {getPriorityBadge(item.priority)}
              </div>

              <div className="action-col-status">
                <select
                  value={item.status || 'PENDING'}
                  onChange={(event) => handleStatusChange(item._id, event.target.value)}
                  className={`action-status-select status-${(item.status || 'PENDING').toLowerCase()}`}
                  aria-label={`Status for ${item.task || 'action item'}`}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="action-col-source">
                {typeof item.sourceTimestamp === 'number' && (
                  <span className="action-source-timestamp">
                    <ClockIcon size={12} /> {formatTimestamp(item.sourceTimestamp)}
                  </span>
                )}
                {item.sourceSpeaker && (
                  <span className="action-source-speaker">
                    <MicIcon size={12} /> {item.sourceSpeaker}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActionItems;