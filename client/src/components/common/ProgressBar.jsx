import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({
  progress = 0,
  label,
  showLabel = true,
  color = 'primary',
  showPercentage = true,
  height = 'medium'
}) => {
  const numericProgress = Number(progress);
  const safeProgress = Number.isFinite(numericProgress) 
    ? Math.min(100, Math.max(0, numericProgress)) 
    : 0;

  const validColors = ['primary', 'success', 'warning', 'danger'];
  const safeColor = validColors.includes(color) ? color : 'primary';

  const validHeights = ['small', 'medium', 'large'];
  const safeHeight = validHeights.includes(height) ? height : 'medium';

  return (
    <div className="progress-bar-container">
      {showLabel && label && (
        <div className="progress-label">
          <span className="progress-label-text">{label}</span>
          {showPercentage && (
            <span className="progress-percentage">{Math.round(safeProgress)}%</span>
          )}
        </div>
      )}

      <div
        className={`common-progress-bar progress-bar-${safeColor} progress-height-${safeHeight}`}
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={Math.round(safeProgress)}
      >
        <div
          className="common-progress-fill"
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;