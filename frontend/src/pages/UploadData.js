import React, { useState } from 'react';
import axios from 'axios';

function UploadData({ setAnalysisData, setLoading }) {
  const [sampleData, setSampleData] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!sampleData) {
      // Use the sample data from earlier
      const sampleDataset = {
        users: [
          { user_id: "U1", department: "Engineering" },
          { user_id: "U2", department: "Engineering" },
          { user_id: "U3", department: "Finance" },
          { user_id: "U4", department: "HR" }
        ],
        permissions: [
          { permission_id: "read_code", sensitivity_level: "low" },
          { permission_id: "write_code", sensitivity_level: "medium" },
          { permission_id: "deploy_service", sensitivity_level: "high" },
          { permission_id: "view_salary", sensitivity_level: "high" },
          { permission_id: "edit_employee", sensitivity_level: "medium" },
          { permission_id: "admin_access", sensitivity_level: "critical" }
        ],
        access_logs: [
          { user_id: "U1", permission_id: "read_code", timestamp: "2026-03-01", frequency: 50 },
          { user_id: "U1", permission_id: "write_code", timestamp: "2026-03-01", frequency: 30 },
          { user_id: "U1", permission_id: "deploy_service", timestamp: "2026-02-20", frequency: 5 },
          { user_id: "U2", permission_id: "read_code", timestamp: "2026-03-01", frequency: 45 },
          { user_id: "U2", permission_id: "write_code", timestamp: "2026-03-01", frequency: 25 },
          { user_id: "U3", permission_id: "view_salary", timestamp: "2026-03-01", frequency: 40 },
          { user_id: "U3", permission_id: "admin_access", timestamp: "2025-12-01", frequency: 1 },
          { user_id: "U4", permission_id: "edit_employee", timestamp: "2026-03-01", frequency: 35 },
          { user_id: "U4", permission_id: "view_salary", timestamp: "2026-02-28", frequency: 20 }
        ]
      };
      setSampleData(sampleDataset);
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('http://localhost:8000/api/analyze', sampleData);
      setAnalysisData(response.data);
      setLoading(false);

      // Scroll to results
      setTimeout(() => {
        document.getElementById('clusters')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <h2>Load Analysis Data</h2>

        <div className="sample-data-section">
          <div className="card">
            <h3>📊 Use Sample Dataset</h3>
            <p>Quick start with pre-configured hackathon demo data (4 users, 6 permissions, 9 access logs)</p>
            <button onClick={handleAnalyze} className="btn btn-primary btn-large">
              Load Sample & Analyze
            </button>
          </div>
        </div>

        <div className="info-boxes">
          <div className="info-box">
            <h4>Sample Includes:</h4>
            <ul>
              <li>👥 4 users across 3 departments</li>
              <li>🔐 6 permissions (low to critical)</li>
              <li>📈 9 access log entries</li>
              <li>⚠️ 1 critical risk (stale admin access)</li>
            </ul>
          </div>

          <div className="info-box">
            <h4>Expected Results:</h4>
            <ul>
              <li>✅ 3 user clusters identified</li>
              <li>✅ 3 optimized roles generated</li>
              <li>✅ 1 CRITICAL recommendation</li>
              <li>✅ 22% permission reduction</li>
            </ul>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="csv-section">
          <h3>Or Upload Custom CSV</h3>
          <p>Format: user_id, permission_id, timestamp, frequency, sensitivity, department</p>
          <input type="file" accept=".csv" className="file-input" />
          <button className="btn btn-secondary">Upload CSV</button>
        </div>
      </div>
    </div>
  );
}

const styles = `
.upload-page {
  padding: 2rem;
}

.upload-container {
  max-width: 800px;
  margin: 0 auto;
}

.upload-container h2 {
  margin-bottom: 2rem;
  color: #333;
}

.sample-data-section {
  margin-bottom: 2rem;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.card h3 {
  color: #667eea;
  margin-bottom: 1rem;
}

.card p {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.btn-large {
  font-size: 1.1rem;
  padding: 1rem 2rem;
}

.info-boxes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin: 2rem 0;
}

.info-box {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-box h4 {
  color: #333;
  margin-bottom: 1rem;
}

.info-box ul {
  list-style: none;
  padding: 0;
}

.info-box li {
  padding: 0.5rem 0;
  color: #666;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.csv-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  margin-top: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.csv-section h3 {
  color: #333;
  margin-bottom: 1rem;
}

.csv-section p {
  color: #666;
  margin-bottom: 1rem;
  font-family: monospace;
  background: #f5f5f5;
  padding: 0.5rem;
  border-radius: 4px;
}

.file-input {
  display: block;
  margin-bottom: 1rem;
}

.btn-secondary {
  background: #666;
  color: white;
}

.btn-secondary:hover {
  background: #555;
}

@media (max-width: 768px) {
  .info-boxes {
    grid-template-columns: 1fr;
  }
}
`;

export default UploadData;
