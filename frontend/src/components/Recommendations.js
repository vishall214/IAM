import React, { useState } from 'react';

function Recommendations({ recommendations }) {
  const [expandedRec, setExpandedRec] = useState(0);

  const filterByAction = (action) => recommendations.filter(r => r.action_type === action);

  const ACTION_COLORS = {
    "REMOVE": "#d32f2f",
    "REVIEW": "#f57c00",
    "MONITOR": "#fbc02d"
  };

  const URGENCY_COLORS = {
    "IMMEDIATE": "#b71c1c",
    "HIGH": "#e65100",
    "MEDIUM": "#f57f17"
  };

  return (
    <div className="recommendations-section">
      <h2>🎯 Cleanup Recommendations</h2>
      <p className="subtitle">Prioritized actions to improve identity governance</p>

      <div className="action-buttons">
        <button className="filter-btn active">All ({recommendations.length})</button>
        <button className="filter-btn">Remove ({filterByAction("REMOVE").length})</button>
        <button className="filter-btn">Review ({filterByAction("REVIEW").length})</button>
        <button className="filter-btn">Monitor ({filterByAction("MONITOR").length})</button>
      </div>

      <div className="recommendations-list">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="recommendation-card"
            onClick={() => setExpandedRec(expandedRec === idx ? -1 : idx)}
          >
            <div className="rec-header">
              <div className="rec-priority">
                <span className="priority-badge">{rec.priority}</span>
              </div>

              <div className="rec-title">
                <h3>
                  {rec.user_id} → {rec.permission_id}
                </h3>
                <p className="rec-reason">{rec.reason}</p>
              </div>

              <div className="rec-badges">
                <span
                  className="action-badge"
                  style={{ backgroundColor: ACTION_COLORS[rec.action_type] }}
                >
                  {rec.action_type}
                </span>
                <span
                  className="urgency-badge"
                  style={{ backgroundColor: URGENCY_COLORS[rec.urgency] }}
                >
                  {rec.urgency}
                </span>
                <span className="risk-score">Risk: {rec.risk_score.toFixed(2)}</span>
              </div>
            </div>

            {expandedRec === idx && (
              <div className="rec-details">
                <div className="detail-section">
                  <h4>Impact</h4>
                  <p>{rec.impact}</p>
                </div>

                <div className="detail-section">
                  <h4>Supporting Metrics</h4>
                  <div className="metrics-grid">
                    {rec.metrics && Object.entries(rec.metrics).map(([key, value]) => (
                      value && (
                        <div key={key} className="metric-item">
                          <strong>{key.replace(/_/g, ' ')}:</strong>
                          <span>{value}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {rec.resolution_options && rec.resolution_options.length > 0 && (
                  <div className="detail-section">
                    <h4>Resolution Options</h4>
                    <ol className="options-list">
                      {rec.resolution_options.map((option, i) => (
                        <li key={i}>{option}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = `
.recommendations-section {
  padding: 2rem;
}

.recommendations-section h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  margin-bottom: 1.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendation-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.recommendation-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.rec-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
}

.rec-priority {
  flex-shrink: 0;
}

.priority-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
}

.rec-title {
  flex: 1;
}

.rec-title h3 {
  color: #333;
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-family: monospace;
}

.rec-reason {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
}

.rec-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.action-badge,
.urgency-badge {
  padding: 0.4rem 0.75rem;
  border-radius: 20px;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
}

.risk-score {
  background: #f5f5f5;
  color: #333;
  padding: 0.4rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.rec-details {
  padding: 0 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid #eee;
  background: #fafafa;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  color: #333;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.detail-section p {
  color: #666;
  line-height: 1.5;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.metric-item {
  background: white;
  padding: 0.75rem;
  border-radius: 4px;
  border-left: 3px solid #667eea;
}

.metric-item strong {
  display: block;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
  text-transform: capitalize;
}

.metric-item span {
  display: block;
  color: #333;
  font-weight: 600;
}

.options-list {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 4px;
  margin: 0;
  color: #666;
}

.options-list li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.options-list li:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .rec-header {
    flex-wrap: wrap;
  }

  .rec-title {
    width: 100%;
    order: 2;
  }

  .rec-priority {
    order: 1;
  }

  .rec-badges {
    order: 3;
    width: 100%;
    justify-content: flex-start;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
`;

export default Recommendations;
