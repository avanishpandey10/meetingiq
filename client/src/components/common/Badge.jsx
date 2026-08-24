import React from 'react';
import './Badge.css';

const Badge = ({
  children,
  variant = 'default',
  size = 'medium',
  className = ''
}) => {
  const allowedVariants = ['default', 'success', 'warning', 'danger', 'info', 'primary'];
  const allowedSizes = ['small', 'medium', 'large'];

  const safeVariant = allowedVariants.includes(variant) ? variant : 'default';
  const safeSize = allowedSizes.includes(size) ? size : 'medium';

  return (
    <span
      className={[
        'badge',
        `badge-${safeVariant}`,
        `badge-${safeSize}`,
        className
      ].filter(Boolean).join(' ')}
    >
      <span className="badge-content">
        {children}
      </span>
    </span>
  );
};

export default Badge;