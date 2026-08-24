import React from 'react';
import './Spinner.css';

const Spinner = ({
  size = 'medium',
  color = 'primary',
  label = 'Loading',
  showLabel = false
}) => {
  const validSizes = ['small', 'medium', 'large'];
  const validColors = ['primary', 'white', 'success', 'warning', 'danger'];

  const safeSize = validSizes.includes(size) ? size : 'medium';
  const safeColor = validColors.includes(color) ? color : 'primary';

  return (
    <div className="spinner-wrapper">
      <div
        className={`spinner spinner-${safeSize} spinner-${safeColor}`}
        role="status"
        aria-label={label}
      >
        <div className="spinner-circle" />
      </div>
      {showLabel && <span className="spinner-label">{label}</span>}
    </div>
  );
};

export default Spinner;