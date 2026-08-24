import React, { useState } from 'react';
import { useMeetings } from '../hooks/useMeetings';
import FilterBar from '../components/history/FilterBar';
import HistoryTable from '../components/history/HistoryTable';
import Spinner from '../components/common/Spinner';
import { HistoryIcon, AlertIcon, RefreshIcon } from '../components/common/Icons';
import './HistoryPage.css';

function HistoryPage() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sortBy: 'newest'
  });
  
  const { meetings, loading, error, deleteMeeting } = useMeetings(filters);
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  const handleDelete = async (meetingId) => {
    try {
      await deleteMeeting(meetingId);
    } catch (error) {
      console.error('Failed to delete meeting:', error);
      throw error;
    }
  };
  
  return (
    <div className="history-page">
      <div className="page-header">
        <h1><HistoryIcon size={28} color="#4f46e5" /> Meeting History</h1>
        <p>Browse and manage all your processed meetings</p>
      </div>
      
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />
      
      {loading ? (
        <div className="loading-state">
          <Spinner size="large" />
          <p>Loading meetings...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <AlertIcon size={48} color="#dc2626" />
          <h3>Failed to load meetings</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            <RefreshIcon size={16} /> Retry
          </button>
        </div>
      ) : (
        <HistoryTable meetings={meetings} onDelete={handleDelete} />
      )}
    </div>
  );
}

export default HistoryPage;