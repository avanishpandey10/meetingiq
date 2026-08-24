import React from 'react';
import { InboxIcon } from './Icons';
import './EmptyState.css';

const EmptyState = ({
  icon,
  title = 'No data found',
  description = 'There is nothing to display here.',
  action,
  actionLabel,
  onAction
}) => {
  return (
    <div className="common-empty-state">
      <div className="common-empty-icon">
        {icon || <InboxIcon size={40} color="#9ca3af" />}
      </div>

      <h3 className="common-empty-title">{title}</h3>

      <p className="common-empty-description">{description}</p>

      {action && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={onAction}
          disabled={typeof onAction !== 'function'}
        >
          {actionLabel || action}
        </button>
      )}
    </div>
  );
};

export default EmptyState;  