/**
 * Summary Component
 */

import React from 'react';

const Summary = ({ data }) => {
  if (!data) {
    return <div className="empty-state">No summary data</div>;
  }

  const { current_state, post_recommendation } = data;

  const metrics = [
    {
      title: 'Total Users',
      value: current_state.total_users,
      icon: '👥'
    },
    {
      title: 'Current Permissions',
      value: current_state.total_permissions_assigned,
      after: post_recommendation.total_permissions_assigned,
      icon: '🔐'
    },
    {
      title: 'Critical Risk',
      value: current_state.critical_risk_permissions,
      after: post_recommendation.critical_risk_permissions,
      icon: '🔴'
    },
    {
      title: 'Permission Reduction',
      value: post_recommendation.permission_reduction_pct,
      icon: '📉'
    }
  ];

  return (
    <div className="summary-section">
      <h2>Executive Summary</h2>
      <div className="summary-grid">
        {metrics.map((metric, idx) => (
          <div key={idx} className="summary-card">
            <div className="icon">{metric.icon}</div>
            <h3>{metric.title}</h3>
            <div className="metric-values">
              <span className="current">{metric.value}</span>
              {metric.after !== undefined && (
                <span className="arrow">→</span>
              )}
              {metric.after !== undefined && (
                <span className="after">{metric.after}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Summary;
