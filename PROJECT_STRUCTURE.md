# AccessMind - Project Structure

## Complete Directory Tree

```
c:\Users\visha\Desktop\IAM\
│
├── README.md                           # Main project README
├── prd.txt                             # Product Requirements Document
│
├── docs/                               # Documentation
│   ├── API.md                          # API reference
│   ├── SETUP.md                        # Installation guide
│   └── ARCHITECTURE.md                 # System architecture
│
├── backend/                            # Python FastAPI Backend
│   ├── main.py                         # FastAPI entry point
│   ├── requirements.txt                # Python dependencies
│   ├── config.py                       # Configuration settings
│   ├── test.py                         # Test script
│   ├── test_data.py                    # Sample data
│   ├── .gitignore
│   │
│   └── app/                            # Application package
│       ├── __init__.py
│       │
│       ├── analysis/                   # 10-Step Analysis Pipeline
│       │   ├── __init__.py
│       │   ├── data_validation.py      # Step 1: Data validation
│       │   ├── behavior_vector.py      # Step 2: Behavior vectors
│       │   ├── clustering.py           # Step 3: User clustering
│       │   ├── role_mining.py          # Step 4: Role mining
│       │   ├── risk_engine.py          # Step 5-6: Risk scoring
│       │   ├── recommendations.py      # Step 7-8: Recommendations
│       │   └── orchestrator.py         # Main coordinator
│       │
│       ├── api/                        # REST API Routes
│       │   └── routes.py               # Endpoint definitions
│       │
│       ├── models/                     # Data Models
│       │   ├── __init__.py
│       │   ├── database.py             # SQLAlchemy ORM models
│       │   └── schema.py               # Pydantic request/response schemas
│       │
│       └── db/                         # Database
│           └── session.py              # Database session management
│
└── frontend/                           # React Frontend
    ├── package.json                    # Node.js dependencies
    ├── .env                            # Environment variables
    ├── .gitignore
    │
    ├── public/
    │   └── index.html                  # HTML template
    │
    └── src/
        ├── index.js                    # React entry point
        ├── App.js                      # Main app component
        ├── App.css                     # Global styles
        │
        ├── components/                 # Reusable Components
        │   ├── Upload.js               # File upload widget
        │   ├── Clusters.js             # Cluster visualization
        │   ├── Roles.js                # Role display
        │   ├── RiskScores.js           # Risk visualization
        │   ├── Recommendations.js      # Recommendations panel
        │   └── Summary.js              # Executive summary
        │
        ├── pages/                      # Page components
        │   ├── Dashboard.js
        │   └── Results.js
        │
        └── services/                   # API & Data Services
            ├── api.js                  # API client
            └── sampleData.js           # Sample dataset
```

## File Responsibilities

### Backend Analysis Modules

| File | Purpose | Key Functions |
|------|---------|---------------|
| `data_validation.py` | Validates input data quality | `validate()`, check schemas |
| `behavior_vector.py` | Creates weighted behavior vectors | `create_vectors()`, recency weighting |
| `clustering.py` | Groups users by behavior | `cluster_users()`, hierarchical clustering |
| `role_mining.py` | Extracts minimal roles | `mine_roles()`, >70% threshold |
| `risk_engine.py` | Calculates risk scores | `calculate_risks()`, 4-component model |
| `recommendations.py` | Generates cleanup actions | `generate_recommendations()`, prioritization |
| `orchestrator.py` | Coordinates full pipeline | `analyze()`, 10-step execution |

### Frontend Components

| File | Purpose | Displays |
|------|---------|----------|
| `Upload.js` | File upload interface | JSON file input |
| `Clusters.js` | Cluster visualization | User groups, cohesion |
| `Roles.js` | Generated roles | Role definitions |
| `RiskScores.js` | Risk visualization | Risk chart, heatmap |
| `Recommendations.js` | Cleanup actions | Prioritized recommendations |
| `Summary.js` | Key metrics | Before/after stats |

## API Endpoints

```
POST   /api/v1/analyze-sync      → Synchronous analysis (blocking)
POST   /api/v1/analyze           → Asynchronous analysis (non-blocking)
GET    /api/v1/status/{job_id}  → Check job status
GET    /api/v1/health            → Health check
```

## Data Flow

```
INPUT DATA (JSON)
    ↓
[Backend Analysis Pipeline]
    ├─ Step 1:  Validation
    ├─ Step 2:  Vectors
    ├─ Step 3:  Clustering
    ├─ Step 4:  Roles
    ├─ Step 5:  Risk Scores
    ├─ Step 6:  Outliers
    ├─ Step 7:  Recommendations
    ├─ Step 8:  Prioritization
    ├─ Step 9:  Explanations
    └─ Step 10: Summary
    ↓
[FastAPI Server]
    ↓
RESULT (JSON)
    ↓
[React Frontend]
    ├─ Clusters Visualization
    ├─ Roles Display
    ├─ Risk Charts
    ├─ Recommendations
    └─ Executive Summary
```

## Installation Checklist

- [ ] Python 3.9+ installed
- [ ] Node.js 16+ installed
- [ ] Backend: `pip install -r backend/requirements.txt`
- [ ] Frontend: `npm install` (in frontend/)
- [ ] Backend running: `python -m uvicorn main:app --reload`
- [ ] Frontend running: `npm start`
- [ ] Test: http://localhost:3000

## Key Technologies

**Backend:**
- FastAPI (async Python framework)
- scikit-learn (ML/clustering)
- scipy (scientific computing)
- SQLAlchemy (database ORM)

**Frontend:**
- React 18 (UI framework)
- Chart.js (charting)
- Axios (HTTP client)
- CSS3 (responsive styling)

## Configuration Files

| File | Purpose |
|------|---------|
| `backend/requirements.txt` | Python dependencies |
| `backend/config.py` | Backend settings |
| `frontend/package.json` | Node.js dependencies |
| `frontend/.env` | Environment variables |
| `.gitignore` | Version control exclusions |

## Running the Application

### Start Backend
```bash
cd backend
python -m uvicorn main:app --reload
```
→ API runs at http://localhost:8000

### Start Frontend
```bash
cd frontend
npm start
```
→ App runs at http://localhost:3000

### Test Analysis
```bash
cd backend
python test.py
```
→ Generates results.json

## Quick Reference

### 10-Step Pipeline
1. ✓ Data Validation
2. ✓ Behavior Vectors (frequency × recency)
3. ✓ User Clustering (hierarchical)
4. ✓ Role Mining (>70% threshold)
5. ✓ Risk Scoring (sensitivity + infrequency + peer deviation + recency)
6. ✓ Outlier Detection
7. ✓ Recommendations (REMOVE/REVIEW/MONITOR)
8. ✓ Prioritization
9. ✓ Explainability
10. ✓ Summary & Metrics

### Risk Levels
- 🟢 LOW (<0.2)
- 🟡 MEDIUM (0.4-0.6)
- 🔴 HIGH (0.8+)
- 🔴 CRITICAL (>0.95)

### Recommendation Types
- **REMOVE** (Risk > 0.9) - Delete immediately
- **REVIEW** (Risk > 0.5) - Evaluate & potentially remove
- **MONITOR** (Risk > 0.4) - Track for 90 days
