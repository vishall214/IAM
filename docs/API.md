# AccessMind - API Documentation

## Overview
AccessMind is an AI-powered identity governance platform that analyzes user access patterns and generates optimized roles, detects security risks, and provides cleanup recommendations.

## Base URL
```
http://localhost:8000/api/v1
```

## Endpoints

### 1. Synchronous Analysis (Blocking)
**POST** `/analyze-sync`

Performs complete analysis and returns results immediately. Use for small datasets (<100 users).

**Request Body:**
```json
{
  "users": [
    {"user_id": "U1", "department": "Engineering"}
  ],
  "permissions": [
    {"permission_id": "read_code", "sensitivity_level": "low"}
  ],
  "access_logs": [
    {"user_id": "U1", "permission_id": "read_code", "timestamp": "2026-03-01", "frequency": 50}
  ]
}
```

**Response:**
```json
{
  "metadata": {
    "analysis_date": "2026-03-29",
    "status": "SUCCESS"
  },
  "clusters": [...],
  "roles": [...],
  "risk_scores": [...],
  "recommendations": [...],
  "explanations": {...},
  "summary": {...}
}
```

### 2. Asynchronous Analysis (Non-blocking)
**POST** `/analyze`

Submits analysis job and returns immediately with job ID.

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "SUBMITTED",
  "message": "Analysis submitted. Check status with GET /api/v1/status/{job_id}"
}
```

### 3. Job Status
**GET** `/status/{job_id}`

Check status and retrieve results.

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "COMPLETED",
  "submitted_at": "2026-03-29T10:00:00",
  "completed_at": "2026-03-29T10:00:05",
  "result": {...}
}
```

### 4. Health Check
**GET** `/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-29T10:00:00",
  "service": "AccessMind",
  "jobs_in_queue": 0,
  "completed_jobs": 42
}
```

## Data Formats

### User
```json
{
  "user_id": "U1",
  "department": "Engineering",
  "role": "Senior Engineer"
}
```

### Permission
```json
{
  "permission_id": "admin_access",
  "sensitivity_level": "critical"
}
```

Sensitivity Levels: `low`, `medium`, `high`, `critical`

### Access Log
```json
{
  "user_id": "U1",
  "permission_id": "admin_access",
  "timestamp": "2026-03-01",
  "frequency": 50
}
```

## Risk Levels
- `LOW`: Risk score < 0.2
- `LOW-MEDIUM`: 0.2 - 0.4
- `MEDIUM`: 0.4 - 0.6
- `MEDIUM-HIGH`: 0.6 - 0.8
- `HIGH`: 0.8 - 0.95
- `CRITICAL`: 0.95+

## Recommendation Types
- `REMOVE`: Delete permission immediately (Risk > 0.9)
- `REVIEW`: Evaluate and potentially remove (Risk > 0.5)
- `MONITOR`: Track for 90 days (Risk > 0.4)

## Example Usage

### cURL
```bash
curl -X POST http://localhost:8000/api/v1/analyze-sync \
  -H "Content-Type: application/json" \
  -d @data.json
```

### Python
```python
import requests
import json

data = {
  "users": [...],
  "permissions": [...],
  "access_logs": [...]
}

response = requests.post(
  "http://localhost:8000/api/v1/analyze-sync",
  json=data
)

result = response.json()
print(json.dumps(result, indent=2))
```

### JavaScript
```javascript
const apiService = require('./services/api');

const result = await apiService.submitAnalysis(data);
console.log(result);
```
