import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { useMeeting } from '../hooks/useMeeting';
import { actionService } from '../services/actionService';

import MeetingHeader from '../components/meeting/MeetingHeader';
import TabNavigation from '../components/meeting/TabNavigation';
import TranscriptView from '../components/meeting/TranscriptView';
import AnalysisView from '../components/meeting/AnalysisView';
import ActionItems from '../components/meeting/ActionItems';
import TopicsView from '../components/meeting/TopicsView';
import Timeline from '../components/meeting/Timeline';
import AnalyticsView from '../components/meeting/AnalyticsView';

import Spinner from '../components/common/Spinner';

import { 
  AnalysisIcon, 
  TranscriptIcon, 
  ActionIcon, 
  TopicsIcon, 
  TimelineIcon, 
  AnalyticsIcon,
  AlertIcon,
  RefreshIcon
} from '../components/common/Icons';

import './MeetingPage.css';

const MeetingPage = () => {
  const { id } = useParams();

  const {
    meeting,
    transcript,
    analysis,
    loading,
    error
  } = useMeeting(id);

  const [activeTab, setActiveTab] = useState('analysis');

  const keyDecisions = Array.isArray(analysis?.keyDecisions) ? analysis.keyDecisions : [];
  const actionItems = Array.isArray(analysis?.actionItems) ? analysis.actionItems : [];
  const keyTopics = Array.isArray(analysis?.keyTopics) ? analysis.keyTopics : [];
  const timeline = Array.isArray(analysis?.timeline) ? analysis.timeline : [];

  const tabs = [
    { id: 'analysis', label: 'Analysis', icon: <AnalysisIcon size={18} />, count: keyDecisions.length },
    { id: 'transcript', label: 'Transcript', icon: <TranscriptIcon size={18} />, count: transcript?.segments?.length || 0 },
    { id: 'actions', label: 'Action Items', icon: <ActionIcon size={18} />, count: actionItems.length },
    { id: 'topics', label: 'Topics', icon: <TopicsIcon size={18} />, count: keyTopics.length },
    { id: 'timeline', label: 'Timeline', icon: <TimelineIcon size={18} />, count: timeline.length },
    { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon size={18} /> }
  ];

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await actionService.updateActionItem(itemId, { status: newStatus });
      console.log(`Action item ${itemId} updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update action item:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="meeting-page loading">
        <Spinner size="large" />
        <p>Loading meeting intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="meeting-page error">
        <div className="error-state">
          <AlertIcon size={48} color="#dc2626" />
          <h2>Failed to load meeting</h2>
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            <RefreshIcon size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="meeting-page">
        <p>Meeting not found</p>
      </div>
    );
  }

  return (
    <div className="meeting-page">
      <MeetingHeader meeting={meeting} />
      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="tab-content">
        {activeTab === 'analysis' && <AnalysisView analysis={analysis} meeting={meeting} />}
        {activeTab === 'transcript' && <TranscriptView transcript={transcript} />}
        {activeTab === 'actions' && <ActionItems actionItems={actionItems} onStatusChange={handleStatusChange} />}
        {activeTab === 'topics' && <TopicsView topics={keyTopics} />}
        {activeTab === 'timeline' && <Timeline timeline={timeline} />}
        {activeTab === 'analytics' && <AnalyticsView meeting={meeting} transcript={transcript} analysis={analysis} />}
      </div>
    </div>
  );
};

export default MeetingPage;