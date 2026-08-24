import React, { useEffect } from 'react';
import { CheckCircleIcon, AlertIcon, InfoIcon, XIcon, StarIcon } from './Icons';
import './Toast.css';

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return undefined;

    const duration = Number(toast.duration);
    const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 5000;

    const timer = setTimeout(() => {
      onClose?.();
    }, safeDuration);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon size={20} color="#10b981" />;
      case 'error':
        return <AlertIcon size={20} color="#ef4444" />;
      case 'warning':
        return <AlertIcon size={20} color="#f59e0b" />;
      case 'info':
        return <InfoIcon size={20} color="#3b82f6" />;
      default:
        return <StarIcon size={20} color="#6b7280" />;
    }
  };

  const safeType = ['success', 'error', 'warning', 'info'].includes(toast.type) ? toast.type : 'info';

  return (
    <div className={`toast toast-${safeType}`} role="alert">
      <div className="toast-icon">
        {getIcon(safeType)}
      </div>

      <div className="toast-content">
        {toast.title && <h4 className="toast-title">{toast.title}</h4>}
        <p className="toast-message">{toast.message || ''}</p>
      </div>

      <button
        type="button"
        className="toast-close"
        onClick={() => onClose?.()}
        aria-label="Close notification"
      >
        <XIcon size={16} />
      </button>
    </div>
  );
};

export default Toast;