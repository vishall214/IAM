import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function RiskDashboard({ riskScores }) {
  // Prepare data for charts
  const riskLevelCounts = {
    "CRITICAL": 0,
    "MEDIUM-HIGH": 0,
    "MEDIUM": 0,
    "LOW-MEDIUM": 0,
    "LOW": 0
  };

  riskScores.forEach(score => {
    riskLevelCounts[score.risk_level]++;
  });

  const pieData = Object.entries(riskLevelCounts)
    .filter(([, count]) => count > 0)
    .map(([level, count]) => ({
      name: level,
      value: count
    }));

  const COLORS = {
    "CRITICAL": "#d32f2f",
    "MEDIUM-HIGH": "#f57c00",
    "MEDIUM": "#fbc02d",
    "LOW-MEDIUM": "#689f38",
    "LOW": "#388e3c"
  };

  // Top risky permissions
  const topRisks = riskScores
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 5);

  return (
    <div className="risk-dashboard">
      <h2>⚠️ Risk Analysis</h2>
      <p className="subtitle">Permission risk scores based on sensitivity, frequency, and anomalies</p>

      <div className="risk-layout">
        <div className="risk-chart-container">
          <h3>Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="risk-table">
          <h3>Top Risk Items</h3>
          <div className="table-container">
            {topRisks.map((score, idx) => (
              <div key={idx} className="risk-row">
                <div className="risk-priority">{idx + 1}</div>
                <div className="risk-info">
                  <div className="risk-user">{score.user_id} → {score.permission_id}</div>
                  <div className="risk-score">Score: {score.risk_score.toFixed(3)}</div>
                </div>
                <div className={`risk-badge ${score.risk_level}`}>
                  {score.risk_level}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="risk-metrics">
        <div className="metric-card critical">
          <div className="metric-label">Critical Risk</div>
          <div className="metric-value">{riskLevelCounts["CRITICAL"]}</div>
        </div>
        <div className="metric-card high">
          <div className="metric-label">Medium-High Risk</div>
          <div className="metric-value">{riskLevelCounts["MEDIUM-HIGH"]}</div>
        </div>
        <div className="metric-card medium">
          <div className="metric-label">Medium Risk</div>
          <div className="metric-value">{riskLevelCounts["MEDIUM"]}</div>
        </div>
        <div className="metric-card low">
          <div className="metric-label">Low Risk</div>
          <div className="metric-value">{riskLevelCounts["LOW"] + riskLevelCounts["LOW-MEDIUM"]}</div>
        </div>
      </div>
    </div>
  );
}

const styles = `
.risk-dashboard {
  padding: 2rem;
}

.risk-dashboard h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
}

.risk-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.risk-chart-container,
.risk-table {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.risk-chart-container h3,
.risk-table h3 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.table-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.risk-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f5f5f5;
  border-radius: 4px;
  border-left: 3px solid #d32f2f;
}

.risk-priority {
  min-width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #d32f2f;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.risk-info {
  flex: 1;
}

.risk-user {
  font-weight: 600;
  color: #333;
  font-family: monospace;
}

.risk-score {
  font-size: 0.85rem;
  color: #666;
}

.risk-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.risk-badge.CRITICAL {
  background: #ffcdd2;
  color: #b71c1c;
}

.risk-badge.MEDIUM-HIGH {
  background: #ffe0b2;
  color: #e65100;
}

.risk-badge.MEDIUM {
  background: #fff9c4;
  color: #f57f17;
}

.risk-badge.LOW {
  background: #c8e6c9;
  color: #1b5e20;
}

.risk-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.metric-card {
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.metric-card.critical {
  border-top: 4px solid #d32f2f;
}

.metric-card.high {
  border-top: 4px solid #f57c00;
}

.metric-card.medium {
  border-top: 4px solid #fbc02d;
}

.metric-card.low {
  border-top: 4px solid #388e3c;
}

.metric-label {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

@media (max-width: 768px) {
  .risk-layout {
    grid-template-columns: 1fr;
  }

  .risk-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}
`;

export default RiskDashboard;
