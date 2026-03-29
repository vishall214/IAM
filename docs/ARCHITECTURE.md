# AccessMind - Architecture Guide

## System Design

```
┌─────────────────────────────────────┐
│         React Frontend              │
│  (Upload, Visualization, Results)   │
└────────────────┬────────────────────┘
                 │ HTTP/REST
┌────────────────▼────────────────────┐
│      FastAPI Backend Server         │
│  (routes, orchestration, storage)   │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   10-Step Analysis Pipeline         │
│                                     │
│  1. Data Validation                 │
│  2. Behavior Vector Creation        │
│  3. User Clustering (Hierarchical)  │
│  4. Role Mining                     │
│  5. Risk Scoring Engine             │
│  6. Outlier Detection               │
│  7. Recommendation Generation       │
│  8. Prioritization                  │
│  9. Explainability Layer            │
│  10. Summary & Metrics              │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│      Structured JSON Output         │
│  {clusters, roles, risks,           │
│   recommendations, explanations}    │
└─────────────────────────────────────┘
```

## Backend Structure

```
backend/
├── main.py                 # FastAPI entry point
├── requirements.txt        # Python dependencies
└── app/
    ├── __init__.py
    ├── analysis/           # Core 10-step pipeline
    │   ├── __init__.py
    │   ├── data_validation.py      (Step 1)
    │   ├── behavior_vector.py      (Step 2)
    │   ├── clustering.py           (Step 3)
    │   ├── role_mining.py          (Step 4)
    │   ├── risk_engine.py          (Step 5-6)
    │   ├── recommendations.py      (Step 7-8)
    │   └── orchestrator.py         (Main coordinator)
    ├── api/                # REST endpoints
    │   └── routes.py
    ├── models/             # Data schemas
    │   ├── __init__.py
    │   ├── database.py     # SQLAlchemy models
    │   └── schema.py       # Pydantic schemas
    └── db/                 # Database operations
        └── session.py
```

## Frontend Structure

```
frontend/
├── package.json
├── public/
│   └── index.html
└── src/
    ├── index.js            # Entry point
    ├── App.js              # Main app component
    ├── App.css             # Global styles
    ├── components/         # Reusable components
    │   ├── Upload.js       # File upload
    │   ├── Clusters.js     # Cluster visualization
    │   ├── Roles.js        # Role display
    │   ├── RiskScores.js   # Risk chart
    │   ├── Recommendations.js  # Recommendation panels
    │   └── Summary.js      # Executive summary
    ├── pages/              # Page components
    │   ├── Dashboard.js
    │   └── Results.js
    └── services/           # API & data services
        ├── api.js          # API client
        └── sampleData.js   # Sample dataset
```

## Key Components

### 1. Data Validation (Step 1)
- **Input:** Raw JSON with users, permissions, access logs
- **Output:** Validation report + normalized data
- **Logic:** Schema checking, reference validation, quality metrics

### 2. Behavior Vector Creation (Step 2)
- **Input:** Users, permissions, access logs
- **Formula:** score = frequency × recency_weight
- **Recency:** Exponential decay: exp(-days_old/30)
- **Output:** Normalized behavior vectors per user

### 3. User Clustering (Step 3)
- **Algorithm:** Hierarchical clustering
- **Distance Metric:** Cosine distance (1 - cosine_similarity)
- **Linkage:** Ward's method
- **Output:** Cluster assignments with cohesion scores

### 4. Role Mining (Step 4)
- **Strategy:** Extract permissions used by >70% of cluster
- **Optimization:** Minimize permission sets while maintaining coverage
- **Output:** Candidate roles with permission lists

### 5. Risk Scoring (Step 5)
- **Formula:** Risk = (Sensitivity × 0.4) + (Infrequency × 0.3) + (Peer_Deviation × 0.2) + (Recency_Gap × 0.1)
- **Sensitivity:** Low=0.1, Medium=0.2, High=0.3, Critical=0.4
- **Infrequency:** 1 - (user_freq / avg_freq)
- **Peer Deviation:** 1 - (peers_with_perm / total_peers)
- **Recency:** Exponential risk increase after 30 days

### 6. Outlier Detection (Step 6)
- **Flags:** IMMEDIATE_REMOVAL_REQUIRED (>0.9), REVIEW_NEEDED (>0.5), MONITOR_90_DAYS (>0.4)
- **Detection:** Global and local outliers

### 7. Recommendations (Step 7-8)
- **Types:** REMOVE (risk>0.9), REVIEW (>0.5), MONITOR (>0.4)
- **Prioritization:** By risk score + impact
- **Explanations:** Full reasoning with supporting metrics

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/analyze-sync` | Blocking analysis |
| POST | `/analyze` | Async analysis submission |
| GET | `/status/{job_id}` | Check job status |
| GET | `/health` | Health check |

## Data Flow

```
Raw JSON Data
     ↓
[Step 1: Validation] → Report
     ↓
[Step 2: Vectors] → User behavior profiles
     ↓
[Step 3: Clustering] → Groups + cohesion
     ↓
[Step 4: Roles] → Optimized permission sets
     ↓
[Step 5-6: Risk] → Risk scores + outliers
     ↓
[Step 7-8: Recommendations] → Prioritized actions
     ↓
[Step 9-10: Explanations + Summary]
     ↓
JSON Result
     ↓
Frontend Visualization
```

## Key Algorithms

### Hierarchical Clustering
- Builds dendrogram of user similarities
- Cuts at distance threshold to create clusters
- Handles edge cases (single user, identical users)
- Rich output: cohesion scores, dominant permissions

### Risk Formula
Balanced scoring across 4 dimensions:
- **Sensitivity (40%):** Higher privilege = higher risk
- **Infrequency (30%):** Unused access = higher risk
- **Peer Deviation (20%):** Non-standard access = higher risk
- **Recency (10%):** Old unused access = higher risk

### Role Mining Strategy
Extracts minimal but sufficient permission sets:
- Core: Permissions used by >70% of cluster
- Justified by: Coverage and user count
- Scalable: Works for 1-1000+ users

## Performance Characteristics

- **Validation:** O(n) where n = number of logs
- **Vectors:** O(n + u) where u = number of users
- **Clustering:** O(u² × p) where p = permissions (hierarchical)
- **Risk Scoring:** O(n × u × p) (all user-perm pairs)
- **Complete Pipeline:** ~100ms for 100 users, ~1s for 1000 users

## Security Considerations

- No persistence of raw access logs by default
- Pseudonymization of results optional
- CORS configured for local development only
- Sanitize JSON input to prevent injection
- Rate limiting recommended for production

## Future Enhancements

1. **Feedback Loop:** Learn from approved/rejected recommendations
2. **Temporal Analysis:** Track role drift over time
3. **Advanced ML:** Anomaly detection, predictive risk
4. **Integration:** LDAP, AD, Azure AD connectors
5. **Multi-tenancy:** Separate analysis per org
6. **Compliance:** SOC 2, HIPAA reporting
