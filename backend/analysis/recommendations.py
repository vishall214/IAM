"""
STEP 7-8: CLEANUP RECOMMENDATIONS
Generate and prioritize recommendations
"""

from typing import Dict, List, Tuple

def generate_recommendations(risk_scores: List[Dict],
                            access_logs: List[Dict],
                            permissions: List[Dict],
                            clusters: Dict[str, List[str]],
                            user_cluster_map: Dict[str, str]) -> List[Dict]:
    """
    Generate recommendations based on risk scores
    Prioritize by risk, impact, and scope
    """
    recommendations = []
    priority = 1
    
    # Build lookup tables
    perm_sensitivity = {p["permission_id"]: p["sensitivity_level"] for p in permissions}
    perm_global_usage = {}
    for log in access_logs:
        perm = log["permission_id"]
        perm_global_usage[perm] = perm_global_usage.get(perm, 0) + 1
    total_accesses = sum(perm_global_usage.values())
    
    # Filter to high-risk accesses
    high_risk = [s for s in risk_scores if s["risk_score"] >= 0.3]
    
    for score in sorted(high_risk, key=lambda x: x["risk_score"], reverse=True):
        user_id = score["user_id"]
        permission_id = score["permission_id"]
        risk_score = score["risk_score"]
        risk_level = score["risk_level"]
        
        # Determine action
        if risk_score >= 0.8:
            action_type = "REMOVE"
            urgency = "IMMEDIATE"
        elif risk_score >= 0.5:
            action_type = "REVIEW"
            urgency = "HIGH"
        else:
            action_type = "MONITOR"
            urgency = "MEDIUM"
        
        # Build explanation
        reason = build_reason(user_id, permission_id, score, access_logs, clusters, user_cluster_map)
        
        # Collect metrics
        metrics = extract_metrics(user_id, permission_id, score, access_logs, 
                                 perm_sensitivity, perm_global_usage, total_accesses)
        
        # Resolution options
        resolution = get_resolution_options(action_type, permission_id)
        
        # Impact
        impact = get_impact(action_type, permission_id)
        
        recommendations.append({
            "priority": priority,
            "action_type": action_type,
            "user_id": user_id,
            "permission_id": permission_id,
            "risk_score": round(risk_score, 3),
            "reason": reason,
            "impact": impact,
            "metrics": metrics,
            "resolution_options": resolution,
            "urgency": urgency
        })
        
        priority += 1
    
    return recommendations[:10]  # Top 10 recommendations

def build_reason(user_id: str, permission_id: str, score: Dict, 
                 access_logs: List[Dict], clusters: Dict[str, List[str]],
                 user_cluster_map: Dict[str, str]) -> str:
    """Build explainable reason for recommendation"""
    
    # Get cluster info
    cluster_id = user_cluster_map.get(user_id, "Unknown")
    cluster_members = clusters.get(cluster_id, [])
    
    # Get usage info for this user-permission
    user_logs = [l for l in access_logs if l["user_id"] == user_id and l["permission_id"] == permission_id]
    if user_logs:
        freq = user_logs[0]["frequency"]
        timestamp = user_logs[0]["timestamp"]
    else:
        freq = 0
        timestamp = "Unknown"
    
    # Count peer usage
    peer_usage = sum(1 for l in access_logs 
                    if l["permission_id"] == permission_id and l["user_id"] in cluster_members)
    peer_prevalence = f"{(peer_usage / len(cluster_members) * 100):.0f}%" if cluster_members else "0%"
    
    # Build reason
    components = score.get("components", {})
    if components.get("sensitivity", 0) > 0.3:
        reason = f"High sensitivity permission with "
    else:
        reason = f"Access pattern anomaly: "
    
    if components.get("infrequency", 0) > 0.7:
        reason += f"infrequent usage ({freq}x) "
    if components.get("peer_deviation", 0) > 0.1:
        reason += f"+ only {peer_prevalence} of cluster uses this "
    if components.get("recency", 0) > 0.05:
        reason += f"+ stale access (last: {timestamp}) "
    
    return reason.rstrip()

def extract_metrics(user_id: str, permission_id: str, score: Dict,
                   access_logs: List[Dict], perm_sensitivity: Dict,
                   perm_usage: Dict, total_accesses: int) -> Dict:
    """Extract supporting metrics"""
    
    # Get usage
    user_logs = [l for l in access_logs if l["user_id"] == user_id and l["permission_id"] == permission_id]
    freq = user_logs[0]["frequency"] if user_logs else 0
    timestamp = user_logs[0]["timestamp"] if user_logs else "Unknown"
    
    # Days old
    from datetime import datetime
    try:
        log_date = datetime.fromisoformat(timestamp)
        ref_date = datetime.fromisoformat("2026-03-29")
        days_old = (ref_date - log_date).days
    except:
        days_old = 999
    
    # Prevalence
    global_usage = perm_usage.get(permission_id, 0)
    global_prev = f"{(global_usage / total_accesses * 100):.0f}%" if total_accesses > 0 else "0%"
    
    return {
        "sensitivity": perm_sensitivity.get(permission_id, "unknown"),
        "usage_frequency": f"{freq} occurrences",
        "recency_days": days_old,
        "peer_prevalence": "50%",  # Placeholder, would be calculated from cluster
        "global_prevalence": global_prev
    }

def get_resolution_options(action_type: str, permission_id: str) -> List[str]:
    """Get resolution options based on action type"""
    if action_type == "REMOVE":
        return ["Remove permission immediately"]
    elif action_type == "REVIEW":
        return [
            f"Verify with manager if {permission_id} is needed",
            f"If yes: Implement MFA or approval workflow for {permission_id}",
            "If no: Remove permission"
        ]
    else:
        return [
            f"Schedule 90-day review for {permission_id}",
            "If zero usage detected: Remove",
            "Otherwise: Continue monitoring"
        ]

def get_impact(action_type: str, permission_id: str) -> str:
    """Describe impact of recommendation"""
    if action_type == "REMOVE":
        return f"Eliminates security risk; enforces least-privilege alignment"
    elif action_type == "REVIEW":
        return f"Controls production-impacting capability; clarifies {permission_id} authority"
    else:
        return f"Maintains operations; prevents access creep"
