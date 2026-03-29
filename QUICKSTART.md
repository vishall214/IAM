# Quick Start Guide

## 🚀 5-Minute Setup

### Prerequisites
- Python 3.9+ (`python --version`)
- Node.js 16+ (`node --version`)
- Git (optional)

### Step 1: Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

Expected duration: 2-3 minutes

### Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
```

Expected duration: 1-2 minutes

### Step 3: Start Backend (Terminal 1)
```bash
cd backend
python -m uvicorn main:app --reload
```

You'll see:
```
Uvicorn running on http://127.0.0.1:8000
```

### Step 4: Start Frontend (Terminal 2)
```bash
cd frontend
npm start
```

You'll see:
```
Compiled successfully!
Localhost:  http://localhost:3000
```

### Step 5: Open Browser
Go to: **http://localhost:3000**

## 📊 First Analysis (2 Minutes)

1. Click **"Load Sample Data"** button
2. Wait for analysis to complete (~3-5 seconds)
3. Review results:
   - 📊 Executive Summary
   - 🔴 Risk Assessment
   - 🎯 Generated Roles
   - 💡 Cleanup Recommendations

## 📝 Next Steps

### Upload Your Own Data

1. Prepare JSON file with format:
```json
{
  "users": [{"user_id": "U1", "department": "Engineering"}],
  "permissions": [{"permission_id": "admin_access", "sensitivity_level": "critical"}],
  "access_logs": [{"user_id": "U1", "permission_id": "admin_access", "timestamp": "2026-03-01", "frequency": 5}]
}
```

2. Click **"Upload JSON Data"**
3. Select your file
4. Review results

### Test via API

```bash
curl -X POST http://localhost:8000/api/v1/analyze-sync \
  -H "Content-Type: application/json" \
  -d @data.json
```

### Run Backend Test
```bash
cd backend
python test.py
```

Generates `results.json` with full analysis output.

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.9+

# Reinstall dependencies
pip install -r requirements.txt --upgrade

# Try different port
python -m uvicorn main:app --port 8001
```

### Frontend won't compile
```bash
# Clear cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install

# Restart
npm start
```

### Connection error
```bash
# Verify backend is running
curl http://localhost:8000/api/v1/health

# Check REACT_APP_API_URL in frontend/.env
# Should be: http://localhost:8000/api/v1
```

## 📁 Files to Know

| Purpose | File |
|---------|------|
| Product spec | `prd.txt` |
| Main docs | `README.md` |
| This guide | `QUICKSTART.md` |
| Project layout | `PROJECT_STRUCTURE.md` |
| API docs | `docs/API.md` |
| Setup guide | `docs/SETUP.md` |

## 🎯 What Happens Next

### Analysis Workflow
1. **Upload/Load data** → JSON validation
2. **Process** → 10-step pipeline runs
3. **Results** → Clusters, Roles, Risks, Recommendations
4. **Review** → View findings in UI
5. **Export** → Download results as JSON

### Key Results
- **Clusters**: Groups of users with similar access patterns
- **Roles**: Optimized permission sets extracted from clusters
- **Risk Scores**: Individual risk for each user-permission pair
- **Recommendations**: Actionable cleanup prioritized by risk
- **Summary**: Before/after metrics and impact

## 💡 Pro Tips

1. **Sample data first** - Click "Load Sample Data" to understand output format
2. **Check logs** - Backend logs show step-by-step progress
3. **API documentation** - Visit http://localhost:8000/docs for Swagger UI
4. **Small datasets** - Start with <100 users for faster results
5. **Configuration** - Edit `backend/config.py` for advanced settings

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Backend starts: `python -m uvicorn main:app --reload`
- [ ] Frontend starts: `npm start`
- [ ] Browser loads: http://localhost:3000
- [ ] Sample data loads: Click button, see results
- [ ] API responds: `curl http://localhost:8000/api/v1/health`
- [ ] Swagger docs: http://localhost:8000/docs

## 🚀 Ready to Go!

You're all set! Start analyzing identity data and generating secure, optimized roles.

**Questions?** Check the full documentation in the `docs/` folder.
