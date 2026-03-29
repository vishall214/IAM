import React from 'react';

function Dashboard({ analysisData }) {
  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      {!analysisData ? (
        <div className="welcome-section">
          <div className="welcome-card">
            <h3>Welcome to AccessMind</h3>
            <p>Upload your access data to get started with identity governance analysis.</p>
            <ul className="features-list">
              <li>✅ Behavioral user clustering</li>
              <li>✅ Automated role generation</li>
              <li>✅ Risk scoring engine</li>
              <li>✅ Actionable cleanup recommendations</li>
              <li>✅ Explainable insights</li>
            </ul>
            <a href="/upload" className="btn btn-primary">
              Upload Data to Begin
            </a>
          </div>

          <div className="info-section">
            <h3>How It Works</h3>
            <ol>
              <li><strong>Upload:</strong> Provide user, permission, and access log data</li>
              <li><strong>Analyze:</strong> 10-step deterministic pipeline</li>
              <li><strong>Cluster:</strong> Group users by behavioral similarity</li>
              <li><strong>Mine:</strong> Extract minimal, optimized roles</li>
              <li><strong>Score:</strong> Calculate risk for each access</li>
              <li><strong>Recommend:</strong> Get prioritized cleanup actions</li>
              <li><strong>Explain:</strong> Understand every decision</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="analysis-summary">
          <h3>Analysis Results</h3>
          <div className="summary-grid">
            <div className="summary-card">
              <h4>Clusters</h4>
              <div className="metric">{analysisData.metadata?.total_users || 0}</div>
              <p>User clusters identified</p>
            </div>
            <div className="summary-card">
              <h4>Roles</h4>
              <div className="metric">{analysisData.roles?.length || 0}</div>
              <p>Optimized roles generated</p>
            </div>
            <div className="summary-card">
              <h4>Risk</h4>
              <div className="metric" style={{color: '#d32f2f'}}>
                {analysisData.summary?.current_state?.critical_risk_permissions || 0}
              </div>
              <p>Critical risk items</p>
            </div>
            <div className="summary-card">
              <h4>Recommendations</h4>
              <div className="metric">{analysisData.recommendations?.length || 0}</div>
              <p>Actions to prioritize</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = `
.dashboard {
  padding: 2rem;
}

.welcome-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.welcome-card, .info-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.welcome-card h3, .info-section h3 {
  color: #667eea;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.features-list {
  list-style: none;
  margin: 1.5rem 0;
  padding: 0;
}

.features-list li {
  padding: 0.5rem 0;
  font-size: 1rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #764ba2;
}

.info-section ol {
  padding-left: 1.5rem;
}

.info-section li {
  margin: 0.75rem 0;
  line-height: 1.6;
}

.analysis-summary {
  padding: 2rem;
  background: white;
  border-radius: 8px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.summary-card {
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid #667eea;
}

.summary-card h4 {
  color: #333;
  margin-bottom: 0.5rem;
}

.metric {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin: 0.5rem 0;
}

.summary-card p {
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .welcome-section {
    grid-template-columns: 1fr;
  }
}
`;

export default Dashboard;
