import React from 'react';
import './Card.css';

const Card = ({
  children,
  className = '',
  title,
  subtitle,
  icon,
  headerAction,
  onClick
}) => {
  const hasHeader = Boolean(title) || Boolean(subtitle) || Boolean(icon) || Boolean(headerAction);

  return (
    <div
      className={['app-card', className].filter(Boolean).join(' ')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {hasHeader && (
        <div className="card-header">
          {icon && (
            <div className="card-icon">
              {icon}
            </div>
          )}

          <div className="card-title-group">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>

          {headerAction && (
            <div className="card-header-action">
              {headerAction}
            </div>
          )}
        </div>
      )}

      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;