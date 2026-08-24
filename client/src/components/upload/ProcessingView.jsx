import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { meetingService } from '../../services/meetingService';

import './ProcessingView.css';

const processingStages = [
  {
    id: 'uploaded',
    label: 'File Uploaded',
    description:
      'Audio file received and validated'
  },

  {
    id: 'transcription',
    label: 'Transcribing Audio',
    description:
      'Converting speech to text with timestamps'
  },

  {
    id: 'transcript_cleaning',
    label: 'Cleaning Transcript',
    description:
      'Improving transcript readability and formatting'
  },

  {
    id: 'transcript_validation',
    label: 'Validating Transcript',
    description:
      'Checking transcript structure and timestamps'
  },

  {
    id: 'intelligence_extraction',
    label: 'Extracting Intelligence',
    description:
      'Analyzing meeting content with Groq AI'
  },

  {
    id: 'action_items',
    label: 'Processing Action Items',
    description:
      'Preparing extracted tasks for tracking'
  },

  {
    id: 'completed',
    label: 'Complete',
    description:
      'Meeting analysis finished successfully'
  }
];

const ProcessingView = ({
  meetingId
}) => {
  const navigate = useNavigate();

  const [status, setStatus] = useState({
    status: 'PROCESSING',
    stage: 'transcription',
    progress: 0,
    error: null
  });

  useEffect(() => {
    if (!meetingId) {
      return undefined;
    }

    let mounted = true;
    let intervalId = null;

    const checkStatus = async () => {
      try {
        const statusData =
          await meetingService.getProcessingStatus(
            meetingId
          );

        if (!mounted) {
          return;
        }

        const progress = Number(
          statusData?.progress
        );

        setStatus({
          status:
            statusData?.status ||
            'PROCESSING',

          stage:
            statusData?.stage ||
            'transcription',

          progress:
            Number.isFinite(progress)
              ? Math.min(
                  100,
                  Math.max(0, progress)
                )
              : 0,

          error:
            statusData?.error ||
            null
        });

        if (
          statusData?.status ===
          'COMPLETED'
        ) {
          if (intervalId) {
            clearInterval(
              intervalId
            );
          }

          setTimeout(() => {
            if (mounted) {
              navigate(
                `/meetings/${meetingId}`
              );
            }
          }, 1500);
        }

        if (
          statusData?.status ===
          'FAILED'
        ) {
          if (intervalId) {
            clearInterval(
              intervalId
            );
          }
        }
      } catch (error) {
        console.error(
          'Failed to check processing status:',
          error
        );

        if (!mounted) {
          return;
        }

        setStatus((prev) => ({
          ...prev,
          error:
            'Failed to check processing status. Please try again.'
        }));
      }
    };

    checkStatus();

    intervalId = setInterval(
      checkStatus,
      3000
    );

    return () => {
      mounted = false;

      if (intervalId) {
        clearInterval(
          intervalId
        );
      }
    };
  }, [meetingId, navigate]);

  const currentStageIndex =
    processingStages.findIndex(
      (stage) =>
        stage.id === status.stage
    );

  const safeStageIndex =
    currentStageIndex >= 0
      ? currentStageIndex
      : 0;

  return (
    <div className="processing-view">
      <h2>
        Processing Your Meeting
      </h2>

      <p className="processing-subtitle">
        Please wait while MeetingIQ
        transcribes and analyzes your
        meeting audio.
      </p>

      {status.error && (
        <div
          className={`processing-error ${
            status.status === 'FAILED'
              ? 'error-failed'
              : ''
          }`}
          role="alert"
        >
          <span>⚠️</span>

          <span>
            {status.error}
          </span>
        </div>
      )}

      <div className="progress-overall">
        <div className="progress-label">
          <span>
            Overall Progress
          </span>

          <span>
            {Math.round(
              status.progress
            )}
            %
          </span>
        </div>

        <div
          className="processing-progress-bar"
          aria-label="Processing progress"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.round(
            status.progress
          )}
          role="progressbar"
        >
          <div
            className="processing-progress-fill"
            style={{
              width: `${status.progress}%`
            }}
          />
        </div>
      </div>

      <div className="stages-list">
        {processingStages.map(
          (stage, index) => {
            const completed =
              index <
              safeStageIndex;

            const active =
              index ===
              safeStageIndex &&
              status.status !==
                'COMPLETED';

            const stageClass = [
              'stage-item',
              completed
                ? 'completed'
                : '',
              active
                ? 'active'
                : ''
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <div
                key={stage.id}
                className={stageClass}
              >
                <div className="stage-icon">
                  {completed
                    ? '✅'
                    : active
                      ? '🔄'
                      : '⏳'}
                </div>

                <div className="stage-content">
                  <h4>
                    {stage.label}
                  </h4>

                  <p>
                    {stage.description}
                  </p>
                </div>
              </div>
            );
          }
        )}
      </div>

      {status.status ===
        'COMPLETED' && (
        <div className="completion-message">
          <div className="success-icon">
            🎉
          </div>

          <h3>
            Analysis Complete!
          </h3>

          <p>
            Redirecting to your meeting
            intelligence dashboard...
          </p>
        </div>
      )}

      {status.status ===
        'FAILED' && (
        <div className="completion-message processing-failed-message">
          <div className="success-icon">
            ❌
          </div>

          <h3>
            Processing Failed
          </h3>

          <p>
            Please check the error above
            and try uploading the meeting
            again.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProcessingView;