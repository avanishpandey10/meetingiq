import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, toast.duration || 5000);
      
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);
  
  if (!toast) return null;
  
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };
  
  return (
    <div className={`toast toast-${toast.type || 'info'}`}>
      <div className="toast-icon">{getIcon(toast.type)}</div>
      <div className="toast-content">
        {toast.title && <h4 className="toast-title">{toast.title}</h4>}
        <p className="toast-message">{toast.message}</p>
      </div>
      <button className="toast-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default Toast;