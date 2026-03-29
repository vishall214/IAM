"""
Test data and examples for AccessMind
"""

SAMPLE_DATA_SMALL = {
    "users": [
        {"user_id": "U1", "department": "Engineering"},
        {"user_id": "U2", "department": "Engineering"},
        {"user_id": "U3", "department": "Finance"},
        {"user_id": "U4", "department": "HR"}
    ],
    "permissions": [
        {"permission_id": "read_code", "sensitivity_level": "low"},
        {"permission_id": "write_code", "sensitivity_level": "medium"},
        {"permission_id": "deploy_service", "sensitivity_level": "high"},
        {"permission_id": "view_salary", "sensitivity_level": "high"},
        {"permission_id": "edit_employee", "sensitivity_level": "medium"},
        {"permission_id": "admin_access", "sensitivity_level": "critical"}
    ],
    "access_logs": [
        {"user_id": "U1", "permission_id": "read_code", "timestamp": "2026-03-01", "frequency": 50},
        {"user_id": "U1", "permission_id": "write_code", "timestamp": "2026-03-01", "frequency": 30},
        {"user_id": "U1", "permission_id": "deploy_service", "timestamp": "2026-02-20", "frequency": 5},
        {"user_id": "U2", "permission_id": "read_code", "timestamp": "2026-03-01", "frequency": 45},
        {"user_id": "U2", "permission_id": "write_code", "timestamp": "2026-03-01", "frequency": 25},
        {"user_id": "U3", "permission_id": "view_salary", "timestamp": "2026-03-01", "frequency": 40},
        {"user_id": "U3", "permission_id": "admin_access", "timestamp": "2025-12-01", "frequency": 1},
        {"user_id": "U4", "permission_id": "edit_employee", "timestamp": "2026-03-01", "frequency": 35},
        {"user_id": "U4", "permission_id": "view_salary", "timestamp": "2026-02-28", "frequency": 20}
    ]
}

SAMPLE_DATA_LARGE = {
    "users": [
        {"user_id": f"U{i}", "department": ["Engineering", "Finance", "HR", "Operations"][i % 4]}
        for i in range(1, 51)
    ],
    "permissions": [
        {"permission_id": "read_code", "sensitivity_level": "low"},
        {"permission_id": "write_code", "sensitivity_level": "medium"},
        {"permission_id": "deploy_service", "sensitivity_level": "high"},
        {"permission_id": "view_salary", "sensitivity_level": "high"},
        {"permission_id": "edit_employee", "sensitivity_level": "medium"},
        {"permission_id": "admin_access", "sensitivity_level": "critical"},
        {"permission_id": "database_access", "sensitivity_level": "high"},
        {"permission_id": "audit_logs", "sensitivity_level": "medium"}
    ],
    "access_logs": []
}

# Generate large dataset logs
import random
from datetime import datetime, timedelta

for user_id in [f"U{i}" for i in range(1, 51)]:
    dept = ["Engineering", "Finance", "HR", "Operations"][(int(user_id[1:]) - 1) % 4]
    
    # Assign department-appropriate permissions
    if dept == "Engineering":
        perms = ["read_code", "write_code", "deploy_service"]
    elif dept == "Finance":
        perms = ["view_salary", "audit_logs"]
    elif dept == "HR":
        perms = ["edit_employee", "view_salary"]
    else:
        perms = ["audit_logs", "database_access"]
    
    for perm in perms:
        freq = random.randint(5, 100)
        days_old = random.randint(0, 120)
        timestamp = (datetime.now() - timedelta(days=days_old)).strftime("%Y-%m-%d")
        
        SAMPLE_DATA_LARGE["access_logs"].append({
            "user_id": user_id,
            "permission_id": perm,
            "timestamp": timestamp,
            "frequency": freq
        })
