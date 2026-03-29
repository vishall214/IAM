/**
 * Upload Component
 */

import React, { useRef, useState } from 'react';
import apiService from '../services/api';

const Upload = ({ onAnalysisComplete, onError, onLoading }) => {
  const fileInput = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      onLoading?.(true);

      const fileContent = await file.text();
      const data = JSON.parse(fileContent);

      const result = await apiService.submitAnalysis(data);
      onAnalysisComplete?.(result);
    } catch (error) {
      console.error('Error processing file:', error);
      onError?.(error.message || 'Failed to process file');
    } finally {
      setIsLoading(false);
      onLoading?.(false);
    }
  };

  return (
    <div className="upload-section">
      <div className="upload-box">
        <input
          ref={fileInput}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          disabled={isLoading}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInput.current?.click()}
          disabled={isLoading}
          className="upload-button"
        >
          {isLoading ? 'Processing...' : 'Upload JSON Data'}
        </button>
        <p className="help-text">Upload a JSON file with users, permissions, and access logs</p>
      </div>
    </div>
  );
};

export default Upload;
