"""
STEP 7-8: Recommendation Engine
Generates cleanup recommendations with prioritization
"""
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)


class RecommendationEngine:
    """Generates prioritized cleanup recommendations"""
    
    def __init__(self):
        self.recommendation_types = ["REMOVE", "REVIEW", "MONITOR", "REASSIGN"]
    
    def generate_recommendations(
        self,
        risk_scores: List[Dict],
        vectors: Dict[str, Dict],
        clusters: Dict[str, Any],
        permissions: List[Dict],
        logs: List[Dict]
    ) -> List[Dict]:
        """
        Generate prioritized recommendations
        """
        
        recommendations = []
        perm_map = {p["permission_id"]: p for p in permissions}
        
        for risk in risk_scores:
            if "flag" not in risk:
                continue
            
            user_id = risk["user_id"]
            perm_id = risk["permission_id"]
            risk_score = risk["risk_score"]
            flag = risk["flag"]
            
            # Determine action type
            if risk_score > 0.9:
                action_type = "REMOVE"
                urgency = "IMMEDIATE"
            elif risk_score > 0.5:
                action_type = "REVIEW"
                urgency = "HIGH"
            else:
                action_type = "MONITOR"
                urgency = "MEDIUM"
            
            # Build recommendation
            rec = {
                "priority": len(recommendations) + 1,
                "action_type": action_type,
                "user_id": user_id,
                "permission_id": perm_id,
                "risk_score": risk_score,
                "urgency": urgency,
                "reason": self._build_reason(risk, user_id, perm_id, vectors, clusters, perm_map, logs),
                "impact": self._describe_impact(action_type, perm_id, perm_map),
                "metrics": self._extract_metrics(risk, user_id, perm_id, vectors, clusters, logs)
            }
            
            if action_type == "REMOVE":
                rec["resolution"] = "Remove permission immediately"
            elif action_type == "REVIEW":
                rec["resolution_options"] = [
                    f"Verify with {user_id}'s manager if {perm_id} is needed",
                    "If yes: Implement approval workflow",
                    "If no: Remove permission"
                ]
            else:
                rec["resolution_options"] = [
                    f"Schedule 90-day review for {user_id}'s {perm_id}",
                    "If zero usage detected: Remove",
                    "Otherwise: Continue monitoring"
                ]
            
            recommendations.append(rec)
        
        return sorted(recommendations, key=lambda x: x["risk_score"], reverse=True)
    
    def _build_reason(self, risk: Dict, user_id: str, perm_id: str, vectors: Dict, clusters: Dict, perm_map: Dict, logs: List) -> str:
        """Build detailed reason for recommendation"""
        
        components = risk["components"]
        perm_info = perm_map.get(perm_id, {})
        sensitivity = perm_info.get("sensitivity_level", "unknown")
        
        # Get user's log entry
        user_log = next((l for l in logs if l["user_id"] == user_id and l["permission_id"] == perm_id), {})
        timestamp = user_log.get("timestamp", "unknown")
        frequency = user_log.get("frequency", 0)
        
        # Find days old
        from datetime import datetime
        try:
            ts_date = datetime.strptime(timestamp, "%Y-%m-%d")
            days_old = (datetime.now() - ts_date).days
        except:
            days_old = 0
        
        reason = f"{sensitivity.capitalize()} sensitivity, "
        
        if frequency <= 1:
            reason += f"only {frequency} use"
        else:
            reason += f"infrequent ({frequency} uses)"
        
        if days_old > 30:
            reason += f" {days_old} days old"
        
        reason += f". Peer deviation: {components['peer_deviation']:.1%}"
        
        return reason
    
    def _describe_impact(self, action_type: str, perm_id: str, perm_map: Dict) -> str:
        """Describe impact of recommendation"""
        
        if action_type == "REMOVE":
            return f"Eliminates privilege escalation risk; enforces least-privilege alignment"
        elif action_type == "REVIEW":
            return f"Controls {perm_id} capability; clarifies access authority"
        else:
            return f"Maintains operational capability; prevents access creep"
    
    def _extract_metrics(self, risk: Dict, user_id: str, perm_id: str, vectors: Dict, clusters: Dict, logs: List) -> Dict:
        """Extract supporting metrics"""
        
        # Get user's log
        user_log = next((l for l in logs if l["user_id"] == user_id and l["permission_id"] == perm_id), {})
        timestamp = user_log.get("timestamp", "unknown")
        frequency = user_log.get("frequency", 0)
        
        # Calculate days old
        from datetime import datetime
        try:
            ts_date = datetime.strptime(timestamp, "%Y-%m-%d")
            days_old = (datetime.now() - ts_date).days
        except:
            days_old = 0
        
        # Count peer prevalence
        user_cluster_id = None
        peer_count = 0
        for cid, cinfo in clusters.items():
            if user_id in cinfo["users"]:
                user_cluster_id = cid
                peer_count = sum(1 for uid in cinfo["users"] if uid != user_id and perm_id in vectors.get(uid, {}))
                total_peers = len(cinfo["users"]) - 1
                break
        
        peer_prevalence = f"{peer_count}/{total_peers}" if total_peers > 0 else "0/0"
        
        # Count global usage
        global_usage = sum(1 for l in logs if l["permission_id"] == perm_id)
        total_logs = len(logs)
        
        metrics = {
            "sensitivity": risk["components"]["sensitivity"],
            "usage_frequency": f"{frequency} occurrences",
            "recency_days": days_old,
            "peer_prevalence": peer_prevalence,
            "global_prevalence": f"{global_usage}/{total_logs} accesses"
        }
        
        return metrics
