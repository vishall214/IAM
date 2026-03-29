"""
FastAPI Backend for AccessMind Identity Governance Platform
"""

from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
from typing import Optional
import traceback

from models.schemas import AnalysisRequest, AnalysisResponse
from analysis.engine import IAMAnalysisEngine

# Initialize FastAPI app
app = FastAPI(
    title="AccessMind - Identity Governance Platform",
    description="AI-powered identity governance with role mining, risk scoring, and recommendations",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize analysis engine
engine = IAMAnalysisEngine()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}

@app.post("/api/analyze", response_model=dict)
async def analyze_access_data(request: AnalysisRequest):
    """
    Execute full identity governance analysis pipeline
    
    Input:
    - users: List of user objects with user_id and department
    - permissions: List of permissions with sensitivity level
    - access_logs: List of access events with frequency and timestamp
    
    Output:
    - Clusters, roles, risk scores, recommendations, and explanations
    """
    try:
        # Convert Pydantic models to dicts
        users = [u.dict() for u in request.users]
        permissions = [p.dict() for p in request.permissions]
        access_logs = [log.dict() for log in request.access_logs]
        
        # Execute pipeline
        result = engine.execute(users, permissions, access_logs)
        
        return JSONResponse(content=result, status_code=200)
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    """
    Upload CSV file with access data
    Expected format: user_id, permission_id, timestamp, frequency, sensitivity, department
    """
    try:
        contents = await file.read()
        lines = contents.decode().split('\n')
        
        # Parse CSV (simple implementation)
        users = {}
        permissions = {}
        access_logs = []
        
        for i, line in enumerate(lines[1:]):  # Skip header
            if not line.strip():
                continue
            
            parts = line.split(',')
            if len(parts) < 6:
                continue
            
            user_id = parts[0].strip()
            permission_id = parts[1].strip()
            timestamp = parts[2].strip()
            frequency = int(parts[3].strip())
            sensitivity = parts[4].strip().lower()
            department = parts[5].strip()
            
            # Collect user
            if user_id not in users:
                users[user_id] = {"user_id": user_id, "department": department}
            
            # Collect permission
            if permission_id not in permissions:
                permissions[permission_id] = {"permission_id": permission_id, "sensitivity_level": sensitivity}
            
            # Collect access log
            access_logs.append({
                "user_id": user_id,
                "permission_id": permission_id,
                "timestamp": timestamp,
                "frequency": frequency
            })
        
        # Execute analysis
        result = engine.execute(
            list(users.values()),
            list(permissions.values()),
            access_logs
        )
        
        return JSONResponse(content=result, status_code=200)
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV parsing failed: {str(e)}")

@app.get("/api/pipeline-steps")
async def get_pipeline_steps():
    """Describe the 10-step analysis pipeline"""
    return {
        "steps": [
            {"step": 1, "name": "Data Validation", "description": "Validate input data consistency"},
            {"step": 2, "name": "Behavior Vector Creation", "description": "Create weighted vectors from access logs"},
            {"step": 3, "name": "User Clustering", "description": "Cluster users by behavioral similarity"},
            {"step": 4, "name": "Role Mining", "description": "Extract minimal permission sets from clusters"},
            {"step": 5, "name": "Risk Scoring", "description": "Calculate risk for each user-permission pair"},
            {"step": 6, "name": "Outlier Detection", "description": "Identify anomalous access patterns"},
            {"step": 7, "name": "Cleanup Recommendations", "description": "Generate removal/review/monitor actions"},
            {"step": 8, "name": "Prioritization", "description": "Rank recommendations by risk and impact"},
            {"step": 9, "name": "Explainability", "description": "Provide justifications for all decisions"},
            {"step": 10, "name": "Output Formatting", "description": "Structure results in JSON format"}
        ]
    }

@app.get("/api/documentation")
async def get_documentation():
    """Get API documentation"""
    return {
        "title": "AccessMind Identity Governance API",
        "description": "AI-powered identity governance platform",
        "endpoints": [
            {
                "path": "/api/analyze",
                "method": "POST",
                "description": "Execute full analysis pipeline",
                "body": {
                    "users": [{"user_id": "U1", "department": "Engineering"}],
                    "permissions": [{"permission_id": "read_code", "sensitivity_level": "low"}],
                    "access_logs": [{"user_id": "U1", "permission_id": "read_code", "timestamp": "2026-03-01", "frequency": 50}]
                }
            },
            {
                "path": "/api/upload-csv",
                "method": "POST",
                "description": "Upload CSV file with access data"
            },
            {
                "path": "/api/pipeline-steps",
                "method": "GET",
                "description": "Describe the 10-step pipeline"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
