import React from 'react';

import { TrendingUpIcon, TrendingDownIcon, ArrowRightIcon } from '../common/Icons';

import './StatsCard.css';

const StatsCard = ({
  icon,
  value,
  label,
  trend,
  color = 'primary'
}) => {
  const hasTrend = trend !== undefined && trend !== null;
  const numericTrend = Number(trend);
  const isPositive = Number.isFinite(numericTrend) && numericTrend > 0;
  const isNegative = Number.isFinite(numericTrend) && numericTrend < 0;

  return (
    <div className={`stats-card stats-${color}`}>
      <div className="stats-icon">
        {icon}
      </div>

      <div className="stats-content">
        <div className="stats-value">
          {value ?? 0}
        </div>

        <div className="stats-label">
          {label}
        </div>

        {hasTrend && (
          <div
            className={`stats-trend ${
              isPositive
                ? 'trend-up'
                : isNegative
                  ? 'trend-down'
                  : 'trend-neutral'
            }`}
          >
            {isPositive && <TrendingUpIcon size={14} />}
            {isNegative && <TrendingDownIcon size={14} />}
            {!isPositive && !isNegative && <ArrowRightIcon size={14} />}
            {Math.abs(numericTrend)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;