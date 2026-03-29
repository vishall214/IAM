#!/usr/bin/env python3
"""
Test the complete analysis pipeline with provided data
"""

import json
import sys
from analysis.engine import IAMAnalysisEngine

# Your test data
payload = {
  "users": [
    {"user_id": "U1", "name": "Aarav Mehta", "email": "aarav.mehta@company.com", "department": "Engineering"},
    {"user_id": "U2", "name": "Rohan Gupta", "email": "rohan.gupta@company.com", "department": "Finance"},
    {"user_id": "U3", "name": "Ishaan Verma", "email": "ishaan.verma@company.com", "department": "Engineering"},
    {"user_id": "U4", "name": "Kabir Singh", "email": "kabir.singh@company.com", "department": "HR"},
    {"user_id": "U5", "name": "Aditya Sharma", "email": "aditya.sharma@company.com", "department": "Engineering"},
    {"user_id": "U6", "name": "Arjun Nair", "email": "arjun.nair@company.com", "department": "Sales"},
    {"user_id": "U7", "name": "Vivaan Rao", "email": "vivaan.rao@company.com", "department": "Engineering"},
    {"user_id": "U8", "name": "Krishna Iyer", "email": "krishna.iyer@company.com", "department": "Finance"},
    {"user_id": "U9", "name": "Sai Reddy", "email": "sai.reddy@company.com", "department": "Engineering"},
    {"user_id": "U10", "name": "Rahul Das", "email": "rahul.das@company.com", "department": "Marketing"},
    {"user_id": "U11", "name": "Ankit Jain", "email": "ankit.jain@company.com", "department": "Engineering"},
    {"user_id": "U12", "name": "Siddharth Kapoor", "email": "siddharth.kapoor@company.com", "department": "Finance"},
    {"user_id": "U13", "name": "Manish Yadav", "email": "manish.yadav@company.com", "department": "Engineering"},
    {"user_id": "U14", "name": "Deepak Mishra", "email": "deepak.mishra@company.com", "department": "HR"},
    {"user_id": "U15", "name": "Neeraj Kumar", "email": "neeraj.kumar@company.com", "department": "Sales"},
    {"user_id": "U16", "name": "Pooja Sharma", "email": "pooja.sharma@company.com", "department": "Marketing"},
    {"user_id": "U17", "name": "Sneha Patel", "email": "sneha.patel@company.com", "department": "Engineering"},
    {"user_id": "U18", "name": "Priya Shah", "email": "priya.shah@company.com", "department": "Finance"},
    {"user_id": "U19", "name": "Ritika Singh", "email": "ritika.singh@company.com", "department": "HR"},
    {"user_id": "U20", "name": "Ananya Roy", "email": "ananya.roy@company.com", "department": "Engineering"},
    {"user_id": "U21", "name": "Karan Malhotra", "email": "karan.malhotra@company.com", "department": "Engineering"},
    {"user_id": "U22", "name": "Varun Khanna", "email": "varun.khanna@company.com", "department": "Sales"},
    {"user_id": "U23", "name": "Ravi Shankar", "email": "ravi.shankar@company.com", "department": "Engineering"},
    {"user_id": "U24", "name": "Gaurav Bansal", "email": "gaurav.bansal@company.com", "department": "Finance"},
    {"user_id": "U25", "name": "Amit Agarwal", "email": "amit.agarwal@company.com", "department": "Engineering"},
    {"user_id": "U26", "name": "Nikhil Joshi", "email": "nikhil.joshi@company.com", "department": "Marketing"},
    {"user_id": "U27", "name": "Suresh Pillai", "email": "suresh.pillai@company.com", "department": "Engineering"},
    {"user_id": "U28", "name": "Vikram Desai", "email": "vikram.desai@company.com", "department": "Finance"},
    {"user_id": "U29", "name": "Harsh Vardhan", "email": "harsh.vardhan@company.com", "department": "Engineering"},
    {"user_id": "U30", "name": "Ajay Kulkarni", "email": "ajay.kulkarni@company.com", "department": "HR"},
    {"user_id": "U31", "name": "Mehul Shah", "email": "mehul.shah@company.com", "department": "Engineering"},
    {"user_id": "U32", "name": "Tushar Mehta", "email": "tushar.mehta@company.com", "department": "Sales"},
    {"user_id": "U33", "name": "Kunal Arora", "email": "kunal.arora@company.com", "department": "Engineering"},
    {"user_id": "U34", "name": "Sahil Gupta", "email": "sahil.gupta@company.com", "department": "Finance"},
    {"user_id": "U35", "name": "Rakesh Sharma", "email": "rakesh.sharma@company.com", "department": "Engineering"},
    {"user_id": "U36", "name": "Yash Jain", "email": "yash.jain@company.com", "department": "Marketing"},
    {"user_id": "U37", "name": "Mohit Verma", "email": "mohit.verma@company.com", "department": "Engineering"},
    {"user_id": "U38", "name": "Akash Singh", "email": "akash.singh@company.com", "department": "Sales"},
    {"user_id": "U39", "name": "Nitin Reddy", "email": "nitin.reddy@company.com", "department": "Engineering"},
    {"user_id": "U40", "name": "Rohit Iyer", "email": "rohit.iyer@company.com", "department": "Finance"}
  ],
  "permissions": [
    {"permission_id": "read_code", "sensitivity_level": "low"},
    {"permission_id": "deploy_prod", "sensitivity_level": "critical"}
  ],
  "access_logs": [
    {"user_id": "U1", "permission_id": "read_code", "timestamp": "2026-03-25", "frequency": 220},
    {"user_id": "U2", "permission_id": "deploy_prod", "timestamp": "2026-03-24", "frequency": 12},
    {"user_id": "U5", "permission_id": "read_code", "timestamp": "2026-03-25", "frequency": 180},
    {"user_id": "U7", "permission_id": "read_code", "timestamp": "2026-03-25", "frequency": 210},
    {"user_id": "U10", "permission_id": "deploy_prod", "timestamp": "2026-03-24", "frequency": 8},
    {"user_id": "U15", "permission_id": "deploy_prod", "timestamp": "2026-03-23", "frequency": 5},
    {"user_id": "U20", "permission_id": "read_code", "timestamp": "2026-03-25", "frequency": 140},
    {"user_id": "U25", "permission_id": "deploy_prod", "timestamp": "2026-03-24", "frequency": 6},
    {"user_id": "U30", "permission_id": "read_code", "timestamp": "2026-03-25", "frequency": 95},
    {"user_id": "U35", "permission_id": "deploy_prod", "timestamp": "2026-03-24", "frequency": 10}
  ]
}

# Run analysis
print("=" * 80)
print("RUNNING COMPLETE ANALYSIS PIPELINE")
print("=" * 80)
print()

try:
    engine = IAMAnalysisEngine()
    result = engine.execute(
        users=payload["users"],
        permissions=payload["permissions"],
        access_logs=payload["access_logs"]
    )
    
    print("[OK] Analysis completed successfully")
    print()
    
    # Print recommendations
    print("-" * 80)
    print("RECOMMENDATIONS GENERATED:")
    print("-" * 80)
    for i, rec in enumerate(result.get("recommendations", []), 1):
        print(f"\n[{i}] {rec['id']}")
        print(f"    User: {rec['user_id']}")
        print(f"    Permission: {rec['permission_id']}")
        print(f"    Action: {rec['action_type']}")
        print(f"    Risk Score: {rec['risk_score']}")
        print(f"    Confidence: {rec['confidence']}%")
        print(f"    Urgency: {rec['urgency']}")
        print(f"    Reason: {rec['reason'][:80]}...")
        print(f"    Status: {rec['status']}")
    
    print()
    print("-" * 80)
    print("RISK SCORES:")
    print("-" * 80)
    for score in result.get("risk_scores", [])[:15]:  # First 15
        print(f"{score['user_id']:4} + {score['permission_id']:12} = {score['risk_score']:.3f} ({score['risk_level']})")
    
    print()
    print("-" * 80)
    print("SUMMARY STATISTICS:")
    print("-" * 80)
    summary = result.get("summary", {})
    current = summary.get("current_state", {})
    post = summary.get("post_recommendation", {})
    
    print(f"Current State:")
    print(f"  Total permissions assigned: {current.get('total_permissions_assigned')}")
    print(f"  Critical risk: {current.get('critical_risk_permissions')}")
    print(f"  High risk: {current.get('high_risk_permissions')}")
    print(f"  Medium risk: {current.get('medium_risk_permissions')}")
    
    print(f"\nPost-Recommendation Impact:")
    print(f"  Total permissions assigned: {post.get('total_permissions_assigned')}")
    print(f"  Critical risk: {post.get('critical_risk_permissions')}")
    print(f"  High risk: {post.get('high_risk_permissions')}")
    print(f"  Medium risk: {post.get('medium_risk_permissions')}")
    
    print()
    
except Exception as e:
    print(f"[ERROR] {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
