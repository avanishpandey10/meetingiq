import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { meetingService } from '../services/meetingService';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import { 
  DashboardIcon, 
  UploadIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  AlertIcon, 
  MicIcon,
  BriefcaseIcon,
  ArrowRightIcon
} from '../components/common/Icons';
import { formatDate, formatDuration, formatFileSize } from '../utils/formatters';
import './DashboardPage.css';

function DashboardPage() {
  const [meetings, setMeetings] = useState([]);
  const [stats, setStats] = useState({
    totalMeetings: 0,
    completedMeetings: 0,
    processingMeetings: 0,
    failedMeetings: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchMeetings();
  }, []);
  
  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await meetingService.getMeetings({ limit: 10 });
      setMeetings(data.meetings || []);
      
      const stats = {
        totalMeetings: data.meetings?.length || 0,
        completedMeetings: data.meetings?.filter(m => m.status === 'COMPLETED').length || 0,
        processingMeetings: data.meetings?.filter(m => m.status === 'PROCESSING').length || 0,
        failedMeetings: data.meetings?.filter(m => m.status === 'FAILED').length || 0
      };
      setStats(stats);
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success"><CheckCircleIcon size={12} /> Completed</Badge>;
      case 'PROCESSING':
        return <Badge variant="warning"><ClockIcon size={12} /> Processing</Badge>;
      case 'FAILED':
        return <Badge variant="danger"><AlertIcon size={12} /> Failed</Badge>;
      default:
        return <Badge variant="default">Uploaded</Badge>;
    }
  };
  
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1><DashboardIcon size={28} color="#4f46e5" /> Dashboard</h1>
          <p>Your meeting intelligence overview</p>
        </div>
        <Link to="/upload" className="btn btn-primary">
          <UploadIcon size={16} /> Upload Meeting
        </Link>
      </div>
      
      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-icon"><BriefcaseIcon size={24} color="#4f46e5" /></div>
          <div className="stat-value">{stats.totalMeetings}</div>
          <div className="stat-label">Total Meetings</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon"><CheckCircleIcon size={24} color="#10b981" /></div>
          <div className="stat-value text-success">{stats.completedMeetings}</div>
          <div className="stat-label">Completed</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon"><ClockIcon size={24} color="#f59e0b" /></div>
          <div className="stat-value text-warning">{stats.processingMeetings}</div>
          <div className="stat-label">Processing</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon"><AlertIcon size={24} color="#ef4444" /></div>
          <div className="stat-value text-danger">{stats.failedMeetings}</div>
          <div className="stat-label">Failed</div>
        </Card>
      </div>
      
      <div className="recent-meetings">
        <h2>Recent Meetings</h2>
        
        {loading ? (
          <div className="loading-state">
            <Spinner size="large" />
            <p>Loading meetings...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="empty-state">
            <MicIcon size={48} color="#9ca3af" />
            <h3>No meetings yet</h3>
            <p>Upload your first meeting to get started</p>
            <Link to="/upload" className="btn btn-primary">
              <UploadIcon size={16} /> Upload Meeting
            </Link>
          </div>
        ) : (
          <div className="meetings-list">
            <div className="meeting-list-header">
              <div>Meeting</div>
              <div>Date</div>
              <div>Duration</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            {meetings.map(meeting => (
              <Link 
                to={`/meetings/${meeting._id}`}
                key={meeting._id}
                className="meeting-list-item"
              >
                <div className="meeting-info">
                  <h4>{meeting.title}</h4>
                  <p className="meeting-filename">{meeting.originalFilename}</p>
                </div>
                <div>{formatDate(meeting.createdAt)}</div>
                <div>{formatDuration(meeting.duration)}</div>
                <div>{getStatusBadge(meeting.status)}</div>
                <div>
                  <span className="btn btn-sm btn-outline">
                    View <ArrowRightIcon size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;