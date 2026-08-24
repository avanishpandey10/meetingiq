import React, { useMemo, useState } from 'react';

import { SearchIcon, ClockIcon, MicIcon, UserIcon, InboxIcon, XIcon } from '../common/Icons';
import { formatTimestamp } from '../../utils/formatters';

import './TranscriptView.css';

const TranscriptView = ({ transcript }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('all');

  const segments = Array.isArray(transcript?.segments) ? transcript.segments : [];

  const speakers = useMemo(() => {
    const speakerSet = new Set();
    segments.forEach((segment) => {
      if (segment.speaker) speakerSet.add(segment.speaker);
    });
    return Array.from(speakerSet);
  }, [segments]);

  const filteredSegments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return segments.filter((segment) => {
      const matchesSpeaker = selectedSpeaker === 'all' || segment.speaker === selectedSpeaker;
      const text = typeof segment.text === 'string' ? segment.text : '';
      const matchesSearch = !normalizedSearch || text.toLowerCase().includes(normalizedSearch);
      return matchesSpeaker && matchesSearch;
    });
  }, [segments, searchTerm, selectedSpeaker]);

  const jumpToTimestamp = (timestamp) => {
    console.log(`Jumping to ${formatTimestamp(timestamp)}`);
  };

  if (segments.length === 0) {
    return (
      <div className="transcript-no-data">
        <InboxIcon size={32} color="#9ca3af" />
        <p>No transcript segments available.</p>
      </div>
    );
  }

  return (
    <div className="transcript-view">
      <div className="transcript-toolbar">
        <div className="transcript-search-box">
          <SearchIcon size={16} className="transcript-search-icon" />
          <input
            type="text"
            placeholder="Search transcript..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search transcript"
          />
          {searchTerm && (
            <button
              type="button"
              className="transcript-clear-search"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <XIcon size={14} />
            </button>
          )}
        </div>

        <div className="transcript-speaker-filter">
          <UserIcon size={16} className="transcript-filter-icon" />
          <select
            value={selectedSpeaker}
            onChange={(event) => setSelectedSpeaker(event.target.value)}
            aria-label="Filter by speaker"
          >
            <option value="all">All Speakers</option>
            {speakers.map((speaker) => (
              <option key={speaker} value={speaker}>{speaker}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="transcript-results-count">
        Showing <strong>{filteredSegments.length}</strong> of <strong>{segments.length}</strong> segments
      </div>

      <div className="transcript-segments">
        {filteredSegments.length === 0 ? (
          <div className="transcript-no-results">
            <InboxIcon size={32} color="#9ca3af" />
            <p>No segments found.</p>
            {searchTerm && <p>Try adjusting your search terms.</p>}
          </div>
        ) : (
          filteredSegments.map((segment, index) => (
            <div key={segment.segmentId || `segment-${index}`} className="transcript-segment">
              <div className="transcript-segment-header">
                <span className="transcript-segment-timestamp">
                  <ClockIcon size={14} /> {formatTimestamp(segment.startTime)}
                </span>

                <span className="transcript-segment-speaker">
                  <MicIcon size={14} /> {segment.speaker || 'Unknown Speaker'}
                </span>

                {typeof segment.startTime === 'number' && (
                  <button
                    type="button"
                    className="transcript-jump-button"
                    onClick={() => jumpToTimestamp(segment.startTime)}
                    title="Jump to timestamp"
                    aria-label={`Jump to ${formatTimestamp(segment.startTime)}`}
                  >
                    <ClockIcon size={14} />
                  </button>
                )}
              </div>

              <p className="transcript-segment-text">{segment.text || ''}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TranscriptView;