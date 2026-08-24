import React, { useEffect } from 'react';
import { AlertIcon, CheckIcon, XIcon, InfoIcon } from './Icons';
import './ConfirmDialog.css';

const ConfirmDialog = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger'
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancel?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const safeType = ['danger', 'primary', 'warning', 'success'].includes(type) ? type : 'danger';

  const getDialogIcon = () => {
    switch (safeType) {
      case 'danger':
        return <AlertIcon size={32} color="#ef4444" />;
      case 'warning':
        return <AlertIcon size={32} color="#f59e0b" />;
      case 'success':
        return <CheckIcon size={32} color="#10b981" />;
      default:
        return <InfoIcon size={32} color="#4f46e5" />;
    }
  };

  return (
    <div className="dialog-overlay" onClick={onCancel} role="presentation">
      <div
        className="dialog-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-header">
          <div className={`dialog-icon dialog-icon-${safeType}`}>
            {getDialogIcon()}
          </div>
          <h3 id="dialog-title">{title}</h3>
          <button
            type="button"
            className="dialog-close"
            onClick={onCancel}
            aria-label="Close"
          >
            <XIcon size={16} />
          </button>
        </div>

        <div className="dialog-body">
          <p>{message}</p>
        </div>

        <div className="dialog-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className={`btn btn-${safeType}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;