"""
STEP 5 & 6: Risk Scoring and Outlier Detection Module
Calculates risk scores and identifies outliers
"""
from typing import Dict, List, Any, Tuple
from datetime import datetime
import math
import logging

logger = logging.getLogger(__name__)


class RiskEngine:
    """Calculates risk scores for user-permission pairs"""
    
    def __init__(self, reference_date: datetime = None):
        self.reference_date = reference_date or datetime.now()
        self.sensitivity_weights = {"low": 0.1, "medium": 0.2, "high": 0.3, "critical": 0.4}
        
        # Risk formula weights
        self.weights = {
            "sensitivity": 0.4,
            "infrequency": 0.3,
            "peer_deviation": 0.2,
            "recency": 0.1
        }
    
    def calculate_risks(
        self,
        logs: List[Dict],
        permissions: List[Dict],
        vectors: Dict[str, Dict],
        clusters: Dict[str, Any]
    ) -> List[Dict]:
        """
        Calculate risk scores for all user-permission pairs
        Returns: List of risk scores with components and flags
        """
        
        # Create permission sensitivity map
        sensitivity_map = {p["permission_id"]: p.get("sensitivity_level", "low") for p in permissions}
        
        # Create user-to-cluster mapping
        user_clusters = {}
        for cluster_id, cluster_info in clusters.items():
            for user_id in cluster_info["users"]:
                user_clusters[user_id] = cluster_id
        
        # Calculate per-permission global statistics
        global_stats = self._calculate_global_stats(logs, vectors)
        
        # Calculate risk for each access log
        risk_scores = []
        for log in logs:
            user_id = log["user_id"]
            perm_id = log["permission_id"]
            
            sensitivity = self.sensitivity_weights.get(sensitivity_map.get(perm_id, "low"), 0.1)
            infrequency = self._calculate_infrequency(perm_id, vectors, user_id, global_stats)
            peer_deviation = self._calculate_peer_deviation(user_id, perm_id, vectors, user_clusters, clusters)
            recency = self._calculate_recency_risk(log.get("timestamp"))
            
            # Composite risk score
            risk = (
                sensitivity * self.weights["sensitivity"] +
                infrequency * self.weights["infrequency"] +
                peer_deviation * self.weights["peer_deviation"] +
                recency * self.weights["recency"]
            )
            
            risk_obj = {
                "user_id": user_id,
                "permission_id": perm_id,
                "risk_score": round(risk, 3),
                "risk_level": self._classify_risk(risk),
                "components": {
                    "sensitivity": round(sensitivity, 3),
                    "infrequency": round(infrequency, 3),
                    "peer_deviation": round(peer_deviation, 3),
                    "recency": round(recency, 3)
                }
            }
            
            # Add flags for high-risk items
            if risk > 0.9:
                risk_obj["flag"] = "IMMEDIATE_REMOVAL_REQUIRED"
            elif risk > 0.5:
                risk_obj["flag"] = "REVIEW_NEEDED"
            elif risk > 0.4:
                risk_obj["flag"] = "MONITOR_90_DAYS"
            
            risk_scores.append(risk_obj)
        
        return sorted(risk_scores, key=lambda x: x["risk_score"], reverse=True)
    
    def _calculate_infrequency(self, perm_id: str, vectors: Dict, user_id: str, global_stats: Dict) -> float:
        """
        Calculate infrequency risk (0 = frequent, 1 = rare)
        """
        if perm_id not in global_stats or "avg_frequency" not in global_stats[perm_id]:
            return 0.5
        
        user_freq = vectors.get(user_id, {}).get(perm_id, 0)
        avg_freq = global_stats[perm_id]["avg_frequency"]
        
        if avg_freq == 0:
            return 0.5
        
        # Normalize: if user frequency is 50% of average, infrequency = 0.5
        freq_ratio = user_freq / avg_freq if avg_freq > 0 else 0
        infrequency = max(0, 1 - freq_ratio)
        
        return min(1.0, infrequency)
    
    def _calculate_peer_deviation(self, user_id: str, perm_id: str, vectors: Dict, user_clusters: Dict, clusters: Dict) -> float:
        """
        Calculate peer deviation risk (0 = same as peers, 1 = unique)
        """
        if user_id not in user_clusters:
            return 0.5
        
        cluster_id = user_clusters[user_id]
        cluster_info = clusters.get(cluster_id, {})
        cluster_users = cluster_info.get("users", [])
        
        if len(cluster_users) <= 1:
            return 0  # No peers to deviate from
        
        # Count how many peers have this permission
        peers_with_perm = sum(1 for uid in cluster_users if uid != user_id and perm_id in vectors.get(uid, {}))
        total_peers = len(cluster_users) - 1
        
        if total_peers == 0:
            return 0
        
        # Peer deviation = 1 - (proportion_of_peers_with_permission)
        peer_ratio = peers_with_perm / total_peers
        deviation = 1 - peer_ratio
        
        return min(1.0, deviation)
    
    def _calculate_recency_risk(self, timestamp_str: str) -> float:
        """
        Calculate recency risk (0 = recent, 1 = very stale)
        """
        if not timestamp_str:
            return 0.5
        
        try:
            timestamp = datetime.strptime(timestamp_str, "%Y-%m-%d")
            days_old = (self.reference_date - timestamp).days
            
            # Risk increases after 30 days, maxes out at 90+ days
            if days_old <= 30:
                recency_risk = 0
            elif days_old <= 90:
                recency_risk = (days_old - 30) / 60  # Linear from 0 to 1 over 60 days
            else:
                recency_risk = 1.0
            
            return min(1.0, recency_risk)
        except:
            return 0.5
    
    def _classify_risk(self, score: float) -> str:
        """Classify risk level"""
        if score < 0.2:
            return "LOW"
        elif score < 0.4:
            return "LOW-MEDIUM"
        elif score < 0.6:
            return "MEDIUM"
        elif score < 0.8:
            return "MEDIUM-HIGH"
        elif score < 0.95:
            return "HIGH"
        else:
            return "CRITICAL"
    
    def _calculate_global_stats(self, logs: List[Dict], vectors: Dict) -> Dict[str, Dict]:
        """Calculate global statistics per permission"""
        stats = {}
        
        for log in logs:
            perm_id = log["permission_id"]
            if perm_id not in stats:
                stats[perm_id] = {"frequencies": []}
            
            freq = log.get("frequency", 1)
            stats[perm_id]["frequencies"].append(freq)
        
        # Calculate averages
        for perm_id in stats:
            freqs = stats[perm_id]["frequencies"]
            stats[perm_id]["avg_frequency"] = sum(freqs) / len(freqs) if freqs else 0
            stats[perm_id]["total_usage"] = len(freqs)
        
        return stats
    
    def identify_outliers(self, risk_scores: List[Dict]) -> List[Dict]:
        """Filter and mark outlier risk scores"""
        outliers = [r for r in risk_scores if "flag" in r]
        return sorted(outliers, key=lambda x: x["risk_score"], reverse=True)
