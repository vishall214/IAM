"""
STEP 2: Behavior Vector Creation Module
Creates weighted permission vectors for each user
"""
from typing import Dict, List, Any
from datetime import datetime
import math
import logging

logger = logging.getLogger(__name__)


class BehaviorVectorCreator:
    """Creates weighted user behavior vectors"""
    
    def __init__(self, reference_date: datetime = None):
        self.reference_date = reference_date or datetime.now()
    
    def create_vectors(self, users: List[Dict], logs: List[Dict], permissions: List[Dict]) -> Dict[str, Dict]:
        """
        Create behavior vectors for all users
        Returns: {user_id: {permission_id: weighted_score}}
        """
        vectors = {}
        
        # Create permission sensitivity map
        sensitivity_map = {p["permission_id"]: p.get("sensitivity_level", "low") for p in permissions}
        sensitivity_weights = {"low": 0.1, "medium": 0.2, "high": 0.3, "critical": 0.4}
        
        # Group logs by user
        user_logs = {}
        for log in logs:
            uid = log["user_id"]
            if uid not in user_logs:
                user_logs[uid] = []
            user_logs[uid].append(log)
        
        # Create vector for each user
        for user in users:
            uid = user["user_id"]
            vectors[uid] = self._create_user_vector(
                uid,
                user_logs.get(uid, []),
                sensitivity_map,
                sensitivity_weights
            )
        
        return vectors
    
    def _create_user_vector(
        self,
        user_id: str,
        logs: List[Dict],
        sensitivity_map: Dict,
        sensitivity_weights: Dict
    ) -> Dict:
        """Create vector for single user"""
        
        if not logs:
            return {}
        
        # Group by permission
        perm_stats = {}
        for log in logs:
            pid = log["permission_id"]
            freq = log.get("frequency", 1)
            timestamp = log.get("timestamp")
            
            if pid not in perm_stats:
                perm_stats[pid] = {
                    "total_frequency": 0,
                    "latest_timestamp": None,
                    "sensitivity": sensitivity_map.get(pid, "low")
                }
            
            perm_stats[pid]["total_frequency"] += freq
            
            # Track latest timestamp
            if timestamp:
                if perm_stats[pid]["latest_timestamp"] is None:
                    perm_stats[pid]["latest_timestamp"] = timestamp
                else:
                    if timestamp > perm_stats[pid]["latest_timestamp"]:
                        perm_stats[pid]["latest_timestamp"] = timestamp
        
        # Calculate weighted scores
        vector = {}
        for pid, stats in perm_stats.items():
            freq_weight = stats["total_frequency"]
            recency_weight = self._calculate_recency_weight(stats["latest_timestamp"])
            sensitivity_weight = sensitivity_weights.get(stats["sensitivity"], 0.1)
            
            # Combined score: frequency * recency * sensitivity
            weighted_score = freq_weight * recency_weight
            vector[pid] = weighted_score
        
        # Normalize vector to probabilities
        total = sum(vector.values())
        if total > 0:
            normalized_vector = {pid: score / total for pid, score in vector.items()}
        else:
            normalized_vector = vector
        
        return normalized_vector
    
    def _calculate_recency_weight(self, timestamp_str: str) -> float:
        """
        Calculate recency weight using exponential decay
        Score = exp(-days_old / 30)
        """
        if not timestamp_str:
            return 0.5  # Default for missing timestamps
        
        try:
            timestamp = datetime.strptime(timestamp_str, "%Y-%m-%d")
            days_old = (self.reference_date - timestamp).days
            
            # Exponential decay with half-life of 30 days
            recency = math.exp(-days_old / 30.0)
            return recency
        except:
            return 0.5
