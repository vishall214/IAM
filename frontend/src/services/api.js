/**
 * AccessMind API Service
 */

import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default {
  // Submit analysis
  submitAnalysis: async (data) => {
    const response = await api.post('/analyze-sync', data);
    return response.data;
  },

  // Submit async analysis
  submitAnalysisAsync: async (data) => {
    const response = await api.post('/analyze', data);
    return response.data;
  },

  // Get job status
  getJobStatus: async (jobId) => {
    const response = await api.get(`/status/${jobId}`);
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};
