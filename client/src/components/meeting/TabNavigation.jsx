import React from 'react';
import './TabNavigation.css';

const TabNavigation = ({ tabs = [], activeTab, onTabChange }) => {
  if (!Array.isArray(tabs) || tabs.length === 0) return null;

  return (
    <div className="tab-navigation" role="tablist">
      <div className="tabs-container">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange?.(tab.id)}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span className="tab-label">{tab.label}</span>
            {tab.count !== undefined && tab.count !== null && (
              <span className="tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;