import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useActionItems } from '../hooks/useActionItems';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import { 
  ActionIcon, 
  SearchIcon, 
  ClockIcon, 
  UserIcon, 
  CalendarIcon, 
  TargetIcon, 
  CheckCircleIcon, 
  AlertIcon, 
  BriefcaseIcon, 
  RefreshIcon, 
  ArrowLeftIcon, 
  XIcon,
  MicIcon,
  InboxIcon,
  TrendingUpIcon
} from '../components/common/Icons';
import { formatTimestamp } from '../utils/formatters';
import './ActionTrackerPage.css';

function ActionTrackerPage() {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  });
  
  const { items, stats, loading, error, updateItemStatus } = useActionItems(filters);
  
  const completionRate = useMemo(() => {
    if (!stats || !stats.total) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  }, [stats]);
  
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <Badge variant="danger"><AlertIcon size={12} /> HIGH</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning"><TargetIcon size={12} /> MEDIUM</Badge>;
      case 'LOW':
        return <Badge variant="info"><TrendingUpIcon size={12} /> LOW</Badge>;
      default:
        return <Badge><InboxIcon size={12} /> Unknown</Badge>;
    }
  };
  
  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await updateItemStatus(itemId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update action item status');
    }
  };
  
  const filteredItems = useMemo(() => {
    if (!filters.search) return items;
    const searchTerm = filters.search.toLowerCase();
    return items.filter(item => 
      item.task?.toLowerCase().includes(searchTerm) ||
      item.owner?.toLowerCase().includes(searchTerm)
    );
  }, [items, filters.search]);
  
  return (
    <div className="action-tracker-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1><ActionIcon size={28} color="#4f46e5" /> Action Tracker</h1>
          <p>Track and manage all action items across meetings</p>
        </div>
        <div className="header-right">
          <Link to="/dashboard" className="btn btn-outline">
            <ArrowLeftIcon size={16} /> Back to Dashboard
          </Link>
        </div>
      </div>
      
      {/* Stats Overview */}
      {stats && (
        <div className="stats-overview">
          <Card className="stat-card stat-total">
            <div className="stat-icon"><BriefcaseIcon size={24} color="#4f46e5" /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.total || 0}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
          </Card>
          
          <Card className="stat-card stat-pending">
            <div className="stat-icon"><ClockIcon size={24} color="#f59e0b" /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.pending || 0}</div>
              <div className="stat-label">Pending</div>
            </div>
          </Card>
          
          <Card className="stat-card stat-in-progress">
            <div className="stat-icon"><RefreshIcon size={24} color="#3b82f6" /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.inProgress || 0}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </Card>
          
          <Card className="stat-card stat-completed">
            <div className="stat-icon"><CheckCircleIcon size={24} color="#10b981" /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.completed || 0}</div>
              <div className="stat-label">Completed</div>
            </div>
          </Card>
          
          <Card className="stat-card stat-high-priority">
            <div className="stat-icon"><AlertIcon size={24} color="#ef4444" /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.highPriority || 0}</div>
              <div className="stat-label">High Priority</div>
            </div>
          </Card>
          
          <Card className="stat-card stat-unassigned">
            <div className="stat-icon"><UserIcon size={24} color="#9ca3af" /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.unassigned || 0}</div>
              <div className="stat-label">Unassigned</div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Completion Progress */}
      {stats && stats.total > 0 && (
        <div className="completion-progress">
          <div className="completion-header">
            <span>Overall Completion</span>
            <span className="completion-percentage">{completionRate}%</span>
          </div>
          <div className="completion-bar">
            <div className="completion-fill" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="filter-section">
        <div className="filter-group search-group">
          <SearchIcon size={16} className="filter-icon" />
          <input
            type="text"
            placeholder="Search tasks or owners..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="filter-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        
        <div className="filter-group">
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="filter-select"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        
        {(filters.status || filters.priority || filters.search) && (
          <button 
            className="btn btn-outline btn-clear"
            onClick={() => setFilters({ status: '', priority: '', search: '' })}
          >
            <XIcon size={16} /> Clear Filters
          </button>
        )}
      </div>
      
      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <Spinner size="large" />
          <p>Loading action items...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <AlertIcon size={48} color="#dc2626" />
          <h3>Failed to load action items</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            <RefreshIcon size={16} /> Retry
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          <InboxIcon size={48} color="#9ca3af" />
          <h3>{filters.search || filters.status || filters.priority ? 'No matching items' : 'No action items found'}</h3>
          <p>
            {filters.search || filters.status || filters.priority 
              ? 'Try adjusting your filters' 
              : 'Action items from meetings will appear here'}
          </p>
        </div>
      ) : (
        <>
          <div className="results-count">
            Showing <strong>{filteredItems.length}</strong> of <strong>{items.length}</strong> items
          </div>
          
          <div className="action-items-table">
            <div className="table-header">
              <div className="col-task"><ActionIcon size={14} /> Task</div>
              <div className="col-owner"><UserIcon size={14} /> Owner</div>
              <div className="col-deadline"><CalendarIcon size={14} /> Deadline</div>
              <div className="col-priority"><TargetIcon size={14} /> Priority</div>
              <div className="col-status"><CheckCircleIcon size={14} /> Status</div>
            </div>
            
            {filteredItems.map((item, index) => (
              <div key={item._id || index} className="table-row">
                <div className="col-task">
                  <p className="task-text">{item.task}</p>
                  <div className="task-meta">
                    {item.sourceTimestamp && (
                      <span className="source-time">
                        <ClockIcon size={12} /> {formatTimestamp(item.sourceTimestamp)}
                      </span>
                    )}
                    {item.sourceSpeaker && (
                      <span className="source-speaker">
                        <MicIcon size={12} /> {item.sourceSpeaker}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="col-owner">
                  <span className={`owner-name ${item.owner === 'Unassigned' ? 'unassigned' : ''}`}>
                    {item.owner === 'Unassigned' ? (
                      <>
                        <AlertIcon size={14} color="#ef4444" /> Unassigned
                      </>
                    ) : (
                      <>
                        <UserIcon size={14} /> {item.owner}
                      </>
                    )}
                  </span>
                </div>
                
                <div className="col-deadline">
                  {item.deadline === 'Not specified' ? (
                    <span className="not-specified">—</span>
                  ) : (
                    <span className="deadline-date">
                      <CalendarIcon size={14} /> {item.deadline}
                    </span>
                  )}
                </div>
                
                <div className="col-priority">
                  {getPriorityBadge(item.priority)}
                </div>
                
                <div className="col-status">
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item._id, e.target.value)}
                    className={`status-select status-${item.status.toLowerCase()}`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ActionTrackerPage;