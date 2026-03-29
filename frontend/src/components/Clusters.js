/**
 * Clusters Visualization Component
 */

import React from 'react';

const Clusters = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="empty-state">No cluster data</div>;
  }

  return (
    <div className="clusters-section">
      <h2>User Behavioral Clusters</h2>
      <div className="clusters-grid">
        {data.map((cluster) => (
          <div key={cluster.cluster_id} className="cluster-card">
            <div className="card-header">
              <h3>{cluster.cluster_name}</h3>
              <span className="badge cohesion">Cohesion: {(cluster.cohesion_score * 100).toFixed(1)}%</span>
            </div>
            <div className="card-body">
              <p><strong>Users:</strong> {cluster.users.join(', ')}</p>
              <p><strong>User Count:</strong> {cluster.user_count}</p>
              <p><strong>Dominant Permissions:</strong></p>
              <div className="permission-tags">
                {cluster.dominant_permissions.map((perm) => (
                  <span key={perm} className="tag">{perm}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Clusters;
