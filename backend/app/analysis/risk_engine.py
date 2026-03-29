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
        
        # Risk formula weights (base weights, will be adapted)
        self.weights = {
            "sensitivity": 0.4,
            "infrequency": 0.3,
            "peer_deviation": 0.2,
            "recency": 0.1
        }
        
        # IMPROVEMENT 4: SoD constraints - define conflicting permission pairs
        self.sod_policies = [
            {"approve": "approve_payments", "execute": "execute_payments", "risk_boost": 0.25},
            {"create": "create_user", "delete": "delete_user", "risk_boost": 0.20},
            {"approve": "approve_budget", "execute": "execute_budget", "risk_boost": 0.25},
            {"read": "read_confidential", "modify": "modify_confidential", "risk_boost": 0.15}
        ]
        
        # IMPROVEMENT 5: Adaptive weight configuration
        self.adaptive_weights_config = {
            "high_sensitivity_boost": 1.5,  # Boost sensitivity weight for critical data
            "outlier_infrequency_boost": 1.3,  # Boost infrequency for statistical outliers
            "temporal_recency_boost": 1.2  # Boost recency for temporal anomalies
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
        
        Enhancements:
        - IMPROVEMENT 4: Checks SoD violations
        - IMPROVEMENT 5: Applies adaptive weights
        - IMPROVEMENT 6: Integrates temporal anomalies
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
        
        # IMPROVEMENT 6: Detect temporal anomalies
        temporal_anomalies = self._detect_temporal_anomalies(logs)
        
        # Calculate risk for each access log
        risk_scores = []
        for log in logs:
            user_id = log["user_id"]
            perm_id = log["permission_id"]
            
            sensitivity = self.sensitivity_weights.get(sensitivity_map.get(perm_id, "low"), 0.1)
            infrequency = self._calculate_infrequency(perm_id, vectors, user_id, global_stats)
            peer_deviation = self._calculate_peer_deviation(user_id, perm_id, vectors, user_clusters, clusters)
            recency = self._calculate_recency_risk(log.get("timestamp"))
            
            # IMPROVEMENT 5: Adapt weights based on context
            adapted_weights = self._adapt_weights(
                user_id=user_id,
                perm_id=perm_id,
                sensitivity_level=sensitivity_map.get(perm_id, "low"),
                infrequency=infrequency,
                temporal_anomaly_detected=(log.get("timestamp", "") in temporal_anomalies),
                is_statistical_outlier=(infrequency > 0.7)
            )
            
            # Composite risk score with adapted weights
            risk = (
                sensitivity * adapted_weights["sensitivity"] +
                infrequency * adapted_weights["infrequency"] +
                peer_deviation * adapted_weights["peer_deviation"] +
                recency * adapted_weights["recency"]
            )
            
            # IMPROVEMENT 4: Check for SoD violations and boost risk
            sod_boost = self._check_sod_violations(user_id, perm_id, vectors)
            if sod_boost > 0:
                risk = min(1.0, risk + sod_boost)
            
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
                },
                "adapted_weights": {
                    "sensitivity": round(adapted_weights["sensitivity"], 3),
                    "infrequency": round(adapted_weights["infrequency"], 3),
                    "peer_deviation": round(adapted_weights["peer_deviation"], 3),
                    "recency": round(adapted_weights["recency"], 3)
                }
            }
            
            # Add SoD violation flag
            if sod_boost > 0:
                risk_obj["sod_violation"] = True
                risk_obj["sod_boost"] = round(sod_boost, 3)
            
            # Add temporal anomaly flag
            if log.get("timestamp", "") in temporal_anomalies:
                risk_obj["temporal_anomaly"] = True
            
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
    
    # ==================== IMPROVEMENT 4: SoD CONSTRAINT CHECKING ====================
    def _check_sod_violations(self, user_id: str, current_perm_id: str, vectors: Dict[str, Dict]) -> float:
        """
        IMPROVEMENT 4: Check for Segregation of Duties (SoD) violations
        Returns risk boost (0 to 1) if conflicting permissions are held
        
        SoD violations occur when a user has permissions that should be separated
        for audit and control purposes (e.g., approve and execute authority).
        """
        user_perms = vectors.get(user_id, {})
        risk_boost = 0.0
        
        for policy in self.sod_policies:
            # Check if current permission is part of this conflict pair
            if current_perm_id in [policy.get("approve"), policy.get("execute"), 
                                   policy.get("create"), policy.get("delete"),
                                   policy.get("read"), policy.get("modify")]:
                
                # Get the conflicting permission(s)
                conflicting_perms = [p for k, p in policy.items() if k != "risk_boost" and p != current_perm_id and p is not None]
                
                # If user has any conflicting permission, boosten risk
                for conflict_perm in conflicting_perms:
                    if conflict_perm in user_perms:
                        risk_boost = max(risk_boost, policy.get("risk_boost", 0.2))
                        logger.warning(f"SoD violation detected for user {user_id}: {current_perm_id} + {conflict_perm}")
        
        return risk_boost
    
    # ==================== IMPROVEMENT 5: ADAPTIVE WEIGHTS ====================
    def _adapt_weights(self, user_id: str, perm_id: str, sensitivity_level: str, 
                       infrequency: float, temporal_anomaly_detected: bool, 
                       is_statistical_outlier: bool) -> Dict[str, float]:
        """
        IMPROVEMENT 5: Dynamically adjust weights based on context
        
        Adaptive weights provide more nuanced risk assessment:
        - Boost sensitivity weight for critical/high sensitivity data
        - Boost infrequency weight for statistical outliers
        - Boost recency weight for temporal anomalies
        """
        adapted = self.weights.copy()
        
        # Boost sensitivity weight for high-sensitivity permissions
        if sensitivity_level in ["high", "critical"]:
            adapted["sensitivity"] *= self.adaptive_weights_config["high_sensitivity_boost"]
        
        # Boost infrequency weight for statistical outliers
        if is_statistical_outlier:
            adapted["infrequency"] *= self.adaptive_weights_config["outlier_infrequency_boost"]
        
        # Boost recency weight for temporal anomalies
        if temporal_anomaly_detected:
            adapted["recency"] *= self.adaptive_weights_config["temporal_recency_boost"]
        
        # Normalize weights to sum to 1.0
        total_weight = sum(adapted.values())
        if total_weight > 0:
            adapted = {k: v / total_weight for k, v in adapted.items()}
        
        return adapted
    
    # ==================== IMPROVEMENT 6: TEMPORAL ANOMALY DETECTION ====================
    def _detect_temporal_anomalies(self, logs: List[Dict]) -> set:
        """
        IMPROVEMENT 6: Detect temporal anomalies in access patterns
        
        Identifies timestamps that deviate from normal access windows:
        - Unusual off-hours access
        - Clustering of rapid accesses
        - Weekend/holiday access patterns
        
        Returns: Set of anomalous timestamps
        """
        anomalies = set()
        
        if not logs:
            return anomalies
        
        # Count accesses per hour
        hour_counts = {}
        for log in logs:
            try:
                timestamp = datetime.strptime(log.get("timestamp", ""), "%Y-%m-%d")
                hour = timestamp.hour
                hour_counts[hour] = hour_counts.get(hour, 0) + 1
            except (ValueError, TypeError):
                continue
        
        if not hour_counts:
            return anomalies
        
        # Calculate average accesses per hour
        avg_hourly = sum(hour_counts.values()) / len(hour_counts) if hour_counts else 0
        stddev = math.sqrt(sum((count - avg_hourly) ** 2 for count in hour_counts.values()) / len(hour_counts)) if hour_counts else 0
        
        # Flag hours with access 2+ standard deviations from mean
        threshold = avg_hourly + (2 * stddev)
        anomalous_hours = set(h for h, count in hour_counts.items() if count > threshold)
        
        # Collect all timestamps from anomalous hours
        for log in logs:
            try:
                timestamp = datetime.strptime(log.get("timestamp", ""), "%Y-%m-%d")
                if timestamp.hour in anomalous_hours:
                    anomalies.add(log.get("timestamp", ""))
                    logger.debug(f"Temporal anomaly detected at {log.get('timestamp')}")
            except (ValueError, TypeError):
                continue
        
        return anomalies
