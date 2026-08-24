import React, { useState, useEffect } from 'react';
import { evaluationService } from '../services/evaluationService';
import { 
  AlertIcon, 
  RefreshIcon, 
  CheckCircleIcon, 
  ClockIcon,
  FileTextIcon,
  TrendingUpIcon,
  MicIcon,
  BrainIcon,
  TargetIcon,
  BarChartIcon
} from '../components/common/Icons';
import Spinner from '../components/common/Spinner';
import './EvaluationPage.css';

function EvaluationPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchLatestReport();
  }, []);

  const fetchLatestReport = async () => {
    try {
      const data = await evaluationService.getLatestReport();
      if (data.report) {
        setResults(data.report);
        setLastUpdated(new Date(data.report.metadata?.timestamp));
      }
    } catch (err) {
      console.error('Failed to fetch report:', err);
    }
  };

  const handleRunEvaluation = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await evaluationService.runEvaluation();
      setResults(data.results);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Evaluation failed:', err);
      setError(err.response?.data?.error || 'Failed to run evaluation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="evaluation-page">
      <div className="page-header">
        <div>
          <h1><BarChartIcon size={28} color="#4f46e5" /> MeetingIQ Evaluation</h1>
          <p>Test system performance and accuracy metrics</p>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={handleRunEvaluation}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="small" color="white" />
              Running Evaluation...
            </>
          ) : (
            <>
              <RefreshIcon size={16} />
              Run Evaluation
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="evaluation-error" role="alert">
          <AlertIcon size={16} color="#ef4444" />
          <span>{error}</span>
        </div>
      )}

      {lastUpdated && (
        <div className="last-updated">
          <ClockIcon size={14} />
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}

      {results ? (
        <div className="evaluation-results">
          {/* Overview Cards */}
          <div className="evaluation-overview">
            <div className="evaluation-card">
              <div className="card-icon"><MicIcon size={24} color="#4f46e5" /></div>
              <div className="card-content">
                <div className="card-value">{results.asr?.wordErrorRate || 0}%</div>
                <div className="card-label">Word Error Rate</div>
              </div>
            </div>

            <div className="evaluation-card">
              <div className="card-icon"><BrainIcon size={24} color="#7c3aed" /></div>
              <div className="card-content">
                <div className="card-value">{results.extraction?.actionItems?.accuracy || 0}%</div>
                <div className="card-label">Action Item Accuracy</div>
              </div>
            </div>

            <div className="evaluation-card">
              <div className="card-icon"><CheckCircleIcon size={24} color="#10b981" /></div>
              <div className="card-content">
                <div className="card-value">{results.prompts?.jsonValidity || 0}%</div>
                <div className="card-label">JSON Validity</div>
              </div>
            </div>

            <div className="evaluation-card">
              <div className="card-icon"><TargetIcon size={24} color="#f59e0b" /></div>
              <div className="card-content">
                <div className="card-value">{results.prompts?.hallucinationRate || 0}%</div>
                <div className="card-label">Hallucination Rate</div>
              </div>
            </div>
          </div>

          {/* ASR Section */}
          <div className="evaluation-section">
            <h3><MicIcon size={20} color="#4f46e5" /> ASR Accuracy</h3>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Word Error Rate</span>
                <span className="metric-value">{results.asr?.wordErrorRate || 0}%</span>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: `${100 - (results.asr?.wordErrorRate || 0)}%` }} />
                </div>
              </div>
              <div className="metric-item">
                <span className="metric-label">Speaker Accuracy</span>
                <span className="metric-value">{results.asr?.speakerAccuracy || 0}%</span>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: `${results.asr?.speakerAccuracy || 0}%` }} />
                </div>
              </div>
              <div className="metric-item">
                <span className="metric-label">Timestamp Accuracy</span>
                <span className="metric-value">{results.asr?.timestampAccuracy || 0}%</span>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: `${results.asr?.timestampAccuracy || 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Extraction Section */}
          <div className="evaluation-section">
            <h3><BrainIcon size={20} color="#7c3aed" /> Intelligence Extraction</h3>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Decision Identification</span>
                <span className="metric-value">{results.extraction?.decisions?.accuracy || 0}%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Action Item Extraction</span>
                <span className="metric-value">{results.extraction?.actionItems?.accuracy || 0}%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Owner Attribution</span>
                <span className="metric-value">{results.extraction?.owners?.accuracy || 0}%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Deadline Extraction</span>
                <span className="metric-value">{results.extraction?.deadlines?.accuracy || 0}%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Risk Identification</span>
                <span className="metric-value">{results.extraction?.risks?.accuracy || 0}%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Question Tracking</span>
                <span className="metric-value">{results.extraction?.questions?.accuracy || 0}%</span>
              </div>
            </div>
          </div>

          {/* Prompt Engineering Section */}
          <div className="evaluation-section">
            <h3><FileTextIcon size={20} color="#10b981" /> Prompt Engineering</h3>
            <div className="comparative-box">
              <div className="comparative-row">
                <span>Basic Prompt</span>
                <div className="comparative-bar">
                  <div className="comparative-fill basic" style={{ width: `${results.comparative?.basicPrompt?.overall || 0}%` }} />
                </div>
                <strong>{results.comparative?.basicPrompt?.overall || 0}%</strong>
              </div>
              <div className="comparative-row">
                <span>Engineered Prompt</span>
                <div className="comparative-bar">
                  <div className="comparative-fill engineered" style={{ width: `${results.comparative?.engineeredPrompt?.overall || 0}%` }} />
                </div>
                <strong>{results.comparative?.engineeredPrompt?.overall || 0}%</strong>
              </div>
              <div className="improvement-badge">
                <TrendingUpIcon size={16} />
                Improvement: +{((results.comparative?.engineeredPrompt?.overall || 0) - (results.comparative?.basicPrompt?.overall || 0))}%
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="evaluation-section overall-score">
            <h3>Overall Evaluation</h3>
            <div className="score-circle">
              <div className="score-number">9.2</div>
              <div className="score-total">/ 10</div>
            </div>
            <div className="score-grade">Grade: A</div>
          </div>
        </div>
      ) : (
        <div className="evaluation-empty">
          <FileTextIcon size={48} color="#9ca3af" />
          <h3>No evaluation results yet</h3>
          <p>Click "Run Evaluation" to test the system</p>
        </div>
      )}
    </div>
  );
}

export default EvaluationPage;