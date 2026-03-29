"""
STEP 4: Role Mining Module
Generates minimal, optimized roles from clusters
"""
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)


class RoleMiner:
    """Mines candidate roles from user clusters"""
    
    def __init__(self, core_threshold: float = 0.70):
        self.core_threshold = core_threshold
    
    def mine_roles(self, clusters: Dict[str, Any], vectors: Dict[str, Dict]) -> Dict[str, Any]:
        """
        Generate candidate roles from clusters
        Returns: {role_id: {role_name, permissions, coverage, justification}}
        """
        
        roles = {}
        
        for cluster_id, cluster_info in clusters.items():
            role_id = f"role_{cluster_id.split('_')[1]}"
            
            # Extract core permissions (used by >70% of cluster)
            core_perms = self._extract_core_permissions(
                cluster_info["users"],
                vectors,
                self.core_threshold
            )
            
            # Calculate role coverage
            coverage = len(core_perms) / max(len(cluster_info["permissions"]), 1) * 100
            
            roles[role_id] = {
                "role_id": role_id,
                "role_name": f"Role_{cluster_id}",
                "source_cluster": cluster_id,
                "permissions": core_perms,
                "coverage": f"{coverage:.1f}%",
                "user_count": len(cluster_info["users"]),
                "users": cluster_info["users"],
                "dominance_threshold": f"{self.core_threshold * 100:.0f}%",
                "notes": f"Minimal role extracted from {len(cluster_info['users'])} user cluster"
            }
        
        return roles
    
    def _extract_core_permissions(self, users: List[str], vectors: Dict[str, Dict], threshold: float) -> List[str]:
        """
        Extract permissions used by >threshold of users
        """
        if not users:
            return []
        
        # Count permission usage
        perm_usage = {}
        for user_id in users:
            if user_id in vectors:
                for perm_id in vectors[user_id].keys():
                    if perm_id not in perm_usage:
                        perm_usage[perm_id] = 0
                    perm_usage[perm_id] += 1
        
        # Filter by threshold
        user_count = len(users)
        core_perms = [
            perm_id for perm_id, count in perm_usage.items()
            if count / user_count >= threshold
        ]
        
        return sorted(core_perms)
