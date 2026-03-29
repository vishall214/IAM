import React from 'react';

function ClusterVisualization({ clusters }) {
  return (
    <div className="cluster-viz">
      <h2>👥 User Clusters</h2>
      <p className="subtitle">Users grouped by behavioral similarity</p>

      <div className="clusters-grid">
        {clusters.map((cluster, idx) => (
          <div key={idx} className="cluster-card">
            <div className="cluster-header">
              <h3>{cluster.cluster_name}</h3>
              <span className="cohesion-badge">
                Cohesion: {(cluster.cohesion_score * 100).toFixed(0)}%
              </span>
            </div>

            <div className="cluster-details">
              <div className="detail-row">
                <strong>Department:</strong>
                <span>{cluster.department}</span>
              </div>
              <div className="detail-row">
                <strong>Users:</strong>
                <span>{cluster.user_count}</span>
              </div>
              <div className="detail-row">
                <strong>Members:</strong>
                <span className="user-list">{cluster.users.join(', ')}</span>
              </div>
              <div className="detail-row">
                <strong>Top Permissions:</strong>
                <span className="perm-list">
                  {cluster.dominant_permissions.map((p, i) => (
                    <span key={i} className="perm-tag">{p}</span>
                  ))}
                </span>
              </div>
            </div>

            {cluster.alerts && cluster.alerts.length > 0 && (
              <div className="alerts">
                {cluster.alerts.map((alert, i) => (
                  <div key={i} className="alert-item">⚠️ {alert}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = `
.cluster-viz {
  padding: 2rem;
}

.cluster-viz h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
}

.clusters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.cluster-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;
}

.cluster-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cluster-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.cluster-header h3 {
  color: #667eea;
  font-size: 1.3rem;
  margin: 0;
}

.cohesion-badge {
  background: #e8eaf6;
  color: #667eea;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.cluster-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.detail-row strong {
  color: #333;
}

.detail-row span {
  color: #666;
  text-align: right;
}

.user-list {
  font-family: monospace;
  background: #f5f5f5;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.perm-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-end;
}

.perm-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.alerts {
  background: #fff3cd;
  border-left: 3px solid #ffc107;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.alert-item {
  color: #856404;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .clusters-grid {
    grid-template-columns: 1fr;
  }

  .cluster-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .cohesion-badge {
    align-self: flex-start;
  }
}
`;

export default ClusterVisualization;
