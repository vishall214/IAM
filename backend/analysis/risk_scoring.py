"""
STEP 5: RISK SCORING ENGINE
Calculate risk score for each user-permission pair
"""

import math
from typing import Dict, List, Tuple
from datetime import datetime

RISK_WEIGHTS = {
    "sensitivity": 0.4,
    "infrequency": 0.3,
    "peer_deviation": 0.2,
    "recency": 0.1
}

SENSITIVITY_WEIGHTS = {
    "low": 0.1,
    "medium": 0.2,
    "high": 0.3,
    "critical": 0.4
}

def calculate_sensitivity_score(sensitivity_level: str) -> float:
    """Map sensitivity level to score"""
    return SENSITIVITY_WEIGHTS.get(sensitivity_level, 0.1)

def calculate_infrequency_score(frequency: int, all_frequencies: List[int]) -> float:
    """
    Higher score = lower usage (higher risk)
    Use percentile approach
    """
    if not all_frequencies or len(all_frequencies) == 1:
        return 0.0
    
    sorted_freqs = sorted(all_frequencies)
    percentile = sum(1 for f in sorted_freqs if f < frequency) / len(sorted_freqs)
    
    # Infrequent = high risk (>0.7 percentile = low frequency)
    return max(0.0, (1 - percentile))

def calculate_peer_deviation_score(user_id: str, permission_id: str, 
                                   cluster_members: List[str],
                                   access_logs: List[Dict]) -> float:
    """
    Score how much user deviates from cluster peers
    High score = deviation (higher risk)
    """
    if len(cluster_members) <= 1:
        return 0.0
    
    # Get all users with this permission
    users_with_perm = set()
    for log in access_logs:
        if log["permission_id"] == permission_id:
            users_with_perm.add(log["user_id"])
    
    # Calculate prevalence in cluster
    peers_with_perm = sum(1 for u in cluster_members if u in users_with_perm)
    prevalence = peers_with_perm / len(cluster_members)
    
    # High deviation if <30% of peers have this permission
    if prevalence < 0.3:
        return 0.2
    elif prevalence < 0.7:
        return 0.1
    else:
        return 0.0

def calculate_recency_score(timestamp: str, all_timestamps: List[str], 
                           reference_date: str = "2026-03-29") -> float:
    """
    Score based on recency. Older unused access = higher risk
    """
    try:
        log_date = datetime.fromisoformat(timestamp)
        ref_date = datetime.fromisoformat(reference_date)
        days_old = (ref_date - log_date).days
        
        # Exponential decay
        score = math.exp(-days_old / 30) - 1.0
        score = abs(score)  # Make positive
        
        # Cap at 0.1
        return min(0.1, score)
    except:
        return 0.0

def score_all_accesses(access_logs: List[Dict],
                      permissions: List[Dict],
                      clusters: Dict[str, List[str]],
                      user_cluster_map: Dict[str, str]) -> List[Dict]:
    """
    Score all user-permission pairs
    """
    risk_scores = []
    
    # Build lookup tables
    perm_sensitivity = {p["permission_id"]: p["sensitivity_level"] for p in permissions}
    all_frequencies = [log["frequency"] for log in access_logs]
    all_timestamps = [log["timestamp"] for log in access_logs]
    
    for log in access_logs:
        user_id = log["user_id"]
        permission_id = log["permission_id"]
        frequency = log["frequency"]
        timestamp = log["timestamp"]
        
        sensitivity = perm_sensitivity.get(permission_id, "low")
        
        # Calculate components
        sensitivity_score = calculate_sensitivity_score(sensitivity)
        infrequency_score = calculate_infrequency_score(frequency, all_frequencies)
        
        # Get cluster for peer deviation
        cluster_id = user_cluster_map.get(user_id, "")
        cluster_members = clusters.get(cluster_id, [])
        peer_deviation_score = calculate_peer_deviation_score(user_id, permission_id, 
                                                              cluster_members, access_logs)
        recency_score = calculate_recency_score(timestamp, all_timestamps)
        
        # Calculate overall risk
        overall_risk = (
            sensitivity_score * RISK_WEIGHTS["sensitivity"] +
            infrequency_score * RISK_WEIGHTS["infrequency"] +
            peer_deviation_score * RISK_WEIGHTS["peer_deviation"] +
            recency_score * RISK_WEIGHTS["recency"]
        )
        
        # Categorize risk
        if overall_risk >= 0.8:
            risk_level = "CRITICAL"
        elif overall_risk >= 0.5:
            risk_level = "MEDIUM-HIGH"
        elif overall_risk >= 0.3:
            risk_level = "MEDIUM"
        elif overall_risk >= 0.15:
            risk_level = "LOW-MEDIUM"
        else:
            risk_level = "LOW"
        
        # Determine flags
        flags = []
        if overall_risk >= 0.8:
            flags.append("IMMEDIATE_REMOVAL_REQUIRED")
        elif overall_risk >= 0.5:
            flags.append("REVIEW_NEEDED")
        elif overall_risk >= 0.3 and infrequency_score > 0.7:
            flags.append("MONITOR_90_DAYS")
        
        risk_scores.append({
            "user_id": user_id,
            "permission_id": permission_id,
            "risk_score": round(overall_risk, 3),
            "risk_level": risk_level,
            "components": {
                "sensitivity": round(sensitivity_score, 3),
                "infrequency": round(infrequency_score, 3),
                "peer_deviation": round(peer_deviation_score, 3),
                "recency": round(recency_score, 3)
            },
            "flag": flags[0] if flags else None
        })
    
    return sorted(risk_scores, key=lambda x: x["risk_score"], reverse=True)
