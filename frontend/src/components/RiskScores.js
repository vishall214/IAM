/**
 * Risk Scores Visualization Component
 */

import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RiskScores = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }

    // Group by user
    const byUser = {};
    data.forEach((risk) => {
      const key = `${risk.user_id}.${risk.permission_id}`;
      byUser[key] = risk.risk_score;
    });

    return {
      labels: Object.keys(byUser).slice(0, 10),
      datasets: [
        {
          label: 'Risk Score',
          data: Object.values(byUser).slice(0, 10),
          backgroundColor: (context) => {
            const value = context.raw;
            if (value > 0.8) return '#dc2626';
            if (value > 0.6) return '#f97316';
            if (value > 0.4) return '#eab308';
            return '#22c55e';
          }
        }
      ]
    };
  }, [data]);

  if (!data || data.length === 0) {
    return <div className="empty-state">No risk data</div>;
  }

  // Count by risk level
  const riskCounts = {
    CRITICAL: 0,
    HIGH: 0,
    'MEDIUM-HIGH': 0,
    MEDIUM: 0,
    'LOW-MEDIUM': 0,
    LOW: 0
  };

  data.forEach((risk) => {
    riskCounts[risk.risk_level] = (riskCounts[risk.risk_level] || 0) + 1;
  });

  return (
    <div className="risk-scores-section">
      <h2>Risk Assessment</h2>
      
      <div className="risk-summary">
        <div className="risk-stat critical">
          <span className="label">Critical Risk</span>
          <span className="value">{riskCounts.CRITICAL}</span>
        </div>
        <div className="risk-stat high">
          <span className="label">High Risk</span>
          <span className="value">{riskCounts.HIGH + riskCounts['MEDIUM-HIGH']}</span>
        </div>
        <div className="risk-stat medium">
          <span className="label">Medium Risk</span>
          <span className="value">{riskCounts.MEDIUM}</span>
        </div>
        <div className="risk-stat low">
          <span className="label">Low Risk</span>
          <span className="value">{riskCounts.LOW + riskCounts['LOW-MEDIUM']}</span>
        </div>
      </div>

      {chartData && (
        <div className="chart-container">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Top Risk User-Permission Pairs'
                }
              }
            }}
          />
        </div>
      )}

      <div className="risk-details">
        {data.slice(0, 10).map((risk) => (
          <div key={`${risk.user_id}-${risk.permission_id}`} className="risk-item">
            <div className="risk-item-header">
              <span className={`risk-badge ${risk.risk_level.toLowerCase()}`}>
                {risk.risk_level}
              </span>
              <span className="user-perm">{risk.user_id} → {risk.permission_id}</span>
              <span className="score">{risk.risk_score.toFixed(3)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskScores;
