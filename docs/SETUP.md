# AccessMind - Installation & Setup Guide

## Prerequisites
- Python 3.9+
- Node.js 16+
- npm or yarn

## Backend Setup

### 1. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Install Optional Dependencies
For database support (PostgreSQL):
```bash
pip install psycopg2-binary
```

### 3. Run Backend Server
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at: `http://localhost:8000`

### 4. API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Frontend Setup

### 1. Install Node Dependencies
```bash
cd frontend
npm install
```

### 2. Configure API URL
Create `.env` file:
```
REACT_APP_API_URL=http://localhost:8000/api/v1
```

### 3. Start Development Server
```bash
npm start
```

Frontend will be available at: `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
```

## Quick Start

### 1. Prepare Sample Data (JSON)
```json
{
  "users": [
    {"user_id": "U1", "department": "Engineering"},
    {"user_id": "U2", "department": "Finance"}
  ],
  "permissions": [
    {"permission_id": "read_code", "sensitivity_level": "low"},
    {"permission_id": "admin_access", "sensitivity_level": "critical"}
  ],
  "access_logs": [
    {"user_id": "U1", "permission_id": "read_code", "timestamp": "2026-03-01", "frequency": 50},
    {"user_id": "U2", "permission_id": "admin_access", "timestamp": "2025-12-01", "frequency": 1}
  ]
}
```

### 2. Run Analysis via API
```bash
curl -X POST http://localhost:8000/api/v1/analyze-sync \
  -H "Content-Type: application/json" \
  -d @data.json > results.json
```

### 3. View Results in Frontend
- Open http://localhost:3000 in browser
- Upload JSON file or use sample data
- Review clusters, roles, risks, and recommendations

## Architecture

### Backend Stack
- **Framework:** FastAPI
- **ML/Analytics:** scikit-learn, scipy, numpy
- **Database:** SQLAlchemy (optional PostgreSQL)
- **Server:** Uvicorn

### Frontend Stack
- **Framework:** React 18
- **Charting:** Chart.js with react-chartjs-2
- **Styling:** CSS/Tailwind
- **API Client:** Axios

## 10-Step Analysis Pipeline

1. **Data Validation** - Check data quality and consistency
2. **Behavior Vector Creation** - Weight permissions by frequency + recency
3. **User Clustering** - Group users by behavior similarity
4. **Role Mining** - Extract minimal permission sets (>70% threshold)
5. **Risk Scoring** - Calculate risk using sensitivity + infrequency + peer deviation + recency
6. **Outlier Detection** - Identify high-risk anomalies
7. **Cleanup Recommendations** - Generate REMOVE/REVIEW/MONITOR actions
8. **Prioritization** - Rank by risk score
9. **Explainability** - Document reasoning for all decisions
10. **Summary** - Generate metrics and impact report

## Troubleshooting

### Backend Issues
- **Port 8000 already in use:** `python -m uvicorn main:app --port 8001`
- **Import errors:** Ensure you're in `backend/` directory
- **Missing dependencies:** `pip install -r requirements.txt --upgrade`

### Frontend Issues
- **Module not found:** `npm install`
- **API connection error:** Check `REACT_APP_API_URL` in `.env`
- **Build fails:** `npm cache clean --force && npm install`

## Performance Tips

- For datasets >1000 users: Use async endpoint (`/analyze`)
- Monitor job status with `/status/{job_id}`
- Set up PostgreSQL for persistent storage
- Enable CORS for cross-origin requests

## Documentation

- [API Documentation](./API.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Examples](./EXAMPLES.md)
