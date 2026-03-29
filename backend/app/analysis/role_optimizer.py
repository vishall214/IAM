"""
Role Optimization Module
Optimizes role selection using multi-criteria approach
IMPROVEMENT 1: Role optimization with adaptive thresholds
"""
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)


class RoleOptimizer:
    """Optimizes role selection by evaluating multiple thresholds"""
    
    def __init__(self, risk_scores_dict: Dict = None):
        self.risk_scores = risk_scores_dict or {}
    
    def optimize_roles_for_cluster(self, cluster_id: str, users: List[str], 
                                   vectors: Dict[str, Dict], 
                                   permissions: List[Dict]) -> Dict:
        """
        Find optimal role for a cluster by evaluating candidates at different thresholds
        
        Args:
            cluster_id: Unique cluster identifier
            users: List of user_ids in cluster
            vectors: Permission vectors for all users
            permissions: List of all permissions with sensitivity
        
        Returns:
            optimal_role: {
                "permissions": [...],
                "coverage": float,
                "threshold_used": float,
                "justification": string
            }
        """
        
        # PHASE 1: Generate candidates at different thresholds
        candidates = []
        
        for threshold in [0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90]:
            core_perms = self._extract_permissions_above_threshold(users, vectors, threshold)
            
            if not core_perms:
                continue
            
            # Calculate metrics
            coverage = self._calculate_coverage(users, vectors, core_perms)
            avg_risk = self._calculate_avg_risk(users, core_perms)
            
            # Count users who can use this role (have all permissions)
            covered_users = sum(1 for u in users 
                               if self._user_can_use_role(u, vectors, core_perms))
            excluded_count = len(users) - covered_users
            
            candidates.append({
                "threshold": threshold,
                "permissions": core_perms,
                "coverage": coverage,
                "avg_risk": avg_risk,
                "excluded_users": excluded_count,
                "perm_count": len(core_perms),
                "covered_users": covered_users
            })
        
        # PHASE 2: Score each candidate
        scores = []
        
        for cand in candidates:
            # Multi-objective scoring
            # Prefer: high coverage, low risk, few excluded users, moderate perm count
            score = (
                cand["coverage"] * 0.5 +                          # 50% on coverage
                (1 - cand["avg_risk"]) * 0.3 +                   # 30% on low risk
                (1 - cand["excluded_users"] / max(len(users), 1)) * 0.2  # 20% on low exclusion
            )
            scores.append((score, cand))
        
        # PHASE 3: Select best candidate
        if not scores:
            # Fallback to 70% threshold if no candidates
            return self._fallback_role(users, vectors, 0.70)
        
        best_score, best_candidate = max(scores, key=lambda x: x[0])
        
        return {
            "permissions": best_candidate["permissions"],
            "coverage": f"{best_candidate['coverage']*100:.1f}%",
            "avg_risk": f"{best_candidate['avg_risk']:.3f}",
            "threshold_used": best_candidate["threshold"],
            "covered_users": best_candidate["covered_users"],
            "excluded_users": best_candidate["excluded_users"],
            "justification": (
                f"Optimal: {len(best_candidate['permissions'])} perms, "
                f"covers {best_candidate['coverage']*100:.0f}% of cluster, "
                f"avg_risk {best_candidate['avg_risk']:.2f}, "
                f"threshold {best_candidate['threshold']:.0%} "
                f"(evaluated {len(candidates)} thresholds)"
            )
        }
    
    def _extract_permissions_above_threshold(self, users: List[str], 
                                             vectors: Dict[str, Dict], 
                                             threshold: float) -> List[str]:
        """Extract permissions used by >threshold of users"""
        if not users:
            return []
        
        perm_usage = {}
        for user_id in users:
            if user_id in vectors:
                for perm_id, score in vectors[user_id].items():
                    if perm_id not in perm_usage:
                        perm_usage[perm_id] = 0
                    if score > 0:  # User has this permission
                        perm_usage[perm_id] += 1
        
        user_count = len(users)
        core_perms = [
            perm_id for perm_id, count in perm_usage.items()
            if count / user_count >= threshold
        ]
        
        return sorted(core_perms)
    
    @staticmethod
    def _calculate_coverage(users: List[str], vectors: Dict[str, Dict], 
                           permissions: List[str]) -> float:
        """Calculate what fraction of cluster is covered by this permission set"""
        if not users:
            return 0.0
        
        covered = 0
        for user_id in users:
            if user_id in vectors:
                # User covered if they have at least one permission in the set
                if any(perm in vectors[user_id] for perm in permissions):
                    covered += 1
        
        return covered / len(users)
    
    @staticmethod
    def _calculate_avg_risk(users: List[str], permissions: List[str]) -> float:
        """Estimate average risk for this role (simplified)"""
        # In full implementation, would use actual risk_scores
        # For now, return simplified value based on permission count
        return min(0.5, len(permissions) * 0.05)
    
    @staticmethod
    def _user_can_use_role(user_id: str, vectors: Dict[str, Dict], 
                          permissions: List[str]) -> bool:
        """Check if user has all permissions in role"""
        if user_id not in vectors:
            return False
        
        user_perms = set(vectors[user_id].keys())
        return all(perm in user_perms for perm in permissions)
    
    def _fallback_role(self, users: List[str], vectors: Dict[str, Dict], 
                      threshold: float) -> Dict:
        """Fallback: generate role at fixed threshold"""
        core_perms = self._extract_permissions_above_threshold(users, vectors, threshold)
        coverage = self._calculate_coverage(users, vectors, core_perms)
        
        return {
            "permissions": core_perms,
            "coverage": f"{coverage*100:.1f}%",
            "avg_risk": "0.0",
            "threshold_used": threshold,
            "justification": f"Fallback role at {threshold:.0%} threshold: {len(core_perms)} perms"
        }
