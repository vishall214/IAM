import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UploadData from './pages/UploadData';
import ClusterVisualization from './components/ClusterVisualization';
import RoleExtraction from './components/RoleExtraction';
import RiskDashboard from './components/RiskDashboard';
import Recommendations from './components/Recommendations';
import './App.css';

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-container">
            <h1 className="logo">🔐 AccessMind</h1>
            <p className="subtitle">AI-Powered Identity Governance</p>
          </div>
        </header>

        <nav className="app-nav">
          <a href="/" className="nav-link">Dashboard</a>
          <a href="/upload" className="nav-link">Upload Data</a>
          {analysisData && (
            <>
              <a href="#clusters" className="nav-link">Clusters</a>
              <a href="#roles" className="nav-link">Roles</a>
              <a href="#risks" className="nav-link">Risk Analysis</a>
              <a href="#recommendations" className="nav-link">Recommendations</a>
            </>
          )}
        </nav>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard analysisData={analysisData} />} />
            <Route path="/upload" element={
              <UploadData setAnalysisData={setAnalysisData} setLoading={setLoading} />
            } />
          </Routes>

          {analysisData && !loading && (
            <div className="analysis-results">
              <section id="clusters" className="result-section">
                <ClusterVisualization clusters={analysisData.clusters} />
              </section>
              <section id="roles" className="result-section">
                <RoleExtraction roles={analysisData.roles} />
              </section>
              <section id="risks" className="result-section">
                <RiskDashboard riskScores={analysisData.risk_scores} />
              </section>
              <section id="recommendations" className="result-section">
                <Recommendations recommendations={analysisData.recommendations} />
              </section>
            </div>
          )}
        </main>

        <footer className="app-footer">
          <p>&copy; 2026 AccessMind - Identity Governance Platform | MVP Hackathon Edition</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
