import React, { useEffect, useState } from 'react';

import { useAskMeeting } from '../../hooks/useAskMeeting';
import { formatTimestamp } from '../../utils/formatters';
import { SearchIcon, HelpCircleIcon, AlertIcon, CheckCircleIcon, XIcon, ClockIcon, MicIcon } from '../common/Icons';
import Spinner from '../common/Spinner';

import './AskMeeting.css';

const AskMeeting = ({ meetingId }) => {
  const [question, setQuestion] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const {
    questions = [],
    suggestions = [],
    loading,
    error,
    loadSuggestions,
    askQuestion,
    clearQuestions
  } = useAskMeeting(meetingId);

  useEffect(() => {
    if (!meetingId) return;
    loadSuggestions();
  }, [meetingId, loadSuggestions]);

  const handleAsk = async (event) => {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (trimmedQuestion.length < 3 || loading) return;

    try {
      await askQuestion(trimmedQuestion);
      setQuestion('');
      setShowSuggestions(false);
    } catch {
      // Hook handles the error.
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    if (loading || !suggestion) return;
    setQuestion(suggestion);

    try {
      await askQuestion(suggestion);
      setQuestion('');
      setShowSuggestions(false);
    } catch {
      // Hook handles the error.
    }
  };

  const formatAskedAt = (value) => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString();
  };

  return (
    <div className="ask-meeting">
      <div className="ask-header">
        <h2><HelpCircleIcon size={24} color="#4f46e5" /> Ask Your Meeting</h2>
        <p>Get answers grounded in the meeting transcript.</p>
      </div>

      <form className="ask-form" onSubmit={handleAsk}>
        <div className="ask-input-group">
          <SearchIcon size={16} className="ask-input-icon" />
          <input
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask anything about this meeting..."
            disabled={loading}
          />
          {question && (
            <button
              type="button"
              className="ask-clear-input"
              onClick={() => setQuestion('')}
              aria-label="Clear question"
            >
              <XIcon size={14} />
            </button>
          )}
          <button
            type="submit"
            className="ask-submit-btn"
            disabled={question.trim().length < 3 || loading}
          >
            {loading ? <Spinner size="small" color="white" /> : 'Ask'}
          </button>
        </div>
      </form>

      {error && (
        <div className="ask-error" role="alert">
          <AlertIcon size={16} color="#ef4444" />
          <span>{error}</span>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-section">
          <h4>Suggested Questions</h4>
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <button
                type="button"
                key={`${suggestion}-${index}`}
                className="suggestion-chip"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={loading}
              >
                <HelpCircleIcon size={14} />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {questions.length > 0 && (
        <div className="qa-history">
          <div className="qa-header">
            <h3>Q&A History</h3>
            <button type="button" className="qa-clear-btn" onClick={clearQuestions} disabled={loading}>
              <XIcon size={14} /> Clear
            </button>
          </div>

          <div className="qa-list">
            {questions.map((qa, index) => (
              <div key={qa.id || index} className="qa-item">
                <div className="qa-question">
                  <span className="qa-icon"><HelpCircleIcon size={16} color="#4f46e5" /></span>
                  <div>
                    <p className="question-text">{qa.question}</p>
                    {qa.timestamp && (
                      <span className="qa-timestamp">
                        <ClockIcon size={12} /> Asked at {formatAskedAt(qa.timestamp)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="qa-answer">
                  <span className="qa-icon"><CheckCircleIcon size={16} color="#10b981" /></span>
                  <div className="qa-answer-content">
                    <p className="answer-text">{qa.answer}</p>

                    {typeof qa.confidence === 'number' && (
                      <div className="confidence-bar">
                        <span>Confidence:</span>
                        <div className="confidence-track">
                          <div className="confidence-fill" style={{ width: `${Math.min(100, Math.max(0, qa.confidence * 100))}%` }} />
                        </div>
                        <span>{Math.round(qa.confidence * 100)}%</span>
                      </div>
                    )}

                    {Array.isArray(qa.relevantSegments) && qa.relevantSegments.length > 0 && (
                      <div className="relevant-segments">
                        <h5>Supporting Segments</h5>
                        {qa.relevantSegments.map((segment, segmentIndex) => (
                          <div key={segmentIndex} className="relevant-segment">
                            <div className="segment-meta">
                              <span className="segment-speaker">
                                <MicIcon size={12} /> {segment.speaker}
                              </span>
                              <span className="segment-time">
                                <ClockIcon size={12} /> {formatTimestamp(segment.timestamp)}
                              </span>
                            </div>
                            <p className="segment-quote">"{segment.text}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AskMeeting;